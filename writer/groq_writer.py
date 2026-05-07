"""
Groq AI writer - writes neutral headlines and summaries from verified facts.
Uses only key_facts from Gemini (not original articles) for token efficiency.
"""

import os
import json
import time
from typing import List, Dict

import requests

from logger.pipeline_logger import PipelineLogger


class GroqWriter:
    """Writes news posts using Groq API with Llama 3.3 70B."""
    
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    MAX_RETRIES = 1
    RETRY_DELAY = 10
    
    def __init__(self):
        self.logger = PipelineLogger()
        self.api_key = os.getenv("GROQ_API_KEY", "")
    
    def write(self, key_facts: List[str], category: str) -> Dict:
        """
        Write neutral headline and summary from verified facts.
        
        Args:
            key_facts: List of verified facts from Gemini
            category: Article category
            
        Returns:
            Dict with headline and summary
        """
        if not self.api_key:
            raise Exception("Groq API key not configured")
        
        if not key_facts:
            raise Exception("No key facts provided")
        
        prompt = self._build_prompt(key_facts, category)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 300
        }
        
        for attempt in range(self.MAX_RETRIES + 1):
            try:
                response = requests.post(
                    self.API_URL,
                    headers=headers,
                    json=data,
                    timeout=30
                )
                response.raise_for_status()
                
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                parsed = self._parse_response(content)
                self.logger.log("GROQ", f"Wrote article: {parsed.get('headline', '')[:50]}")
                return parsed
                
            except requests.exceptions.RequestException as e:
                self.logger.log("GROQ_ERROR", f"API request failed (attempt {attempt + 1}): {str(e)}")
                if attempt < self.MAX_RETRIES:
                    time.sleep(self.RETRY_DELAY)
                else:
                    raise
            except Exception as e:
                self.logger.log("GROQ_ERROR", f"Unexpected error: {str(e)}")
                raise
        
        raise Exception("Max retries exceeded")
    
    def _build_prompt(self, key_facts: List[str], category: str) -> str:
        """
        Build token-efficient writing prompt.
        
        Args:
            key_facts: List of verified facts
            category: Article category
            
        Returns:
            Formatted prompt
        """
        facts_text = "\n".join(f"{i+1}. {fact}" for i, fact in enumerate(key_facts))
        
        prompt = f"""You are a neutral news writer.
You will receive a list of verified facts about a news event.
Return ONLY a valid JSON object with no extra text, no markdown, no explanation.

JSON format:
{{
  "headline": "<short neutral factual headline under 12 words>",
  "summary": "<exactly 3 sentences, plain English, factual, no opinion, under 80 words total>"
}}

Rules:
- Do not invent any information. Only use what is in the facts list.
- Headline must be under 12 words.
- Summary must be exactly 3 sentences.
- Summary must be under 80 words total.
- Use plain English, no jargon.
- No opinion, no bias, no sensationalism.
- Write in active voice.

Category: {category}

Verified facts:
{facts_text}"""
        
        return prompt
    
    def _parse_response(self, text: str) -> Dict:
        """
        Parse Groq JSON response.
        
        Args:
            text: Raw response text
            
        Returns:
            Parsed dict with headline and summary
        """
        # Clean up response
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        try:
            result = json.loads(text)
            
            # Validate required fields
            if "headline" not in result or "summary" not in result:
                raise ValueError("Missing required fields")
            
            # Ensure headline is under 12 words
            headline = result["headline"].strip()
            if len(headline.split()) > 15:  # Allow some flexibility
                words = headline.split()[:12]
                headline = " ".join(words) + "..."
            
            # Ensure summary is reasonable
            summary = result["summary"].strip()
            
            return {
                "headline": headline,
                "summary": summary
            }
            
        except json.JSONDecodeError:
            self.logger.log("GROQ_ERROR", f"Failed to parse JSON: {text[:100]}")
            # Fallback: try to extract headline and summary manually
            lines = text.split("\n")
            headline = lines[0][:100] if lines else "News Update"
            summary = " ".join(lines[1:]) if len(lines) > 1 else "Details to follow."
            
            return {
                "headline": headline,
                "summary": summary[:300]
            }
