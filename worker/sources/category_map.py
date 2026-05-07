"""
Maps RSS feed labels to standard category names.
"""

from typing import Dict, Optional


# Mapping from feed category hints to standard categories
CATEGORY_MAP: Dict[str, str] = {
    # Politics
    "politics": "politics",
    "political": "politics",
    "government": "politics",
    "election": "politics",
    "parliament": "politics",
    "national": "politics",
    "india": "politics",
    
    # Business
    "business": "business",
    "economy": "business",
    "economic": "business",
    "market": "business",
    "markets": "business",
    "finance": "business",
    "money": "business",
    "corporate": "business",
    "companies": "business",
    
    # Sports
    "sports": "sports",
    "sport": "sports",
    "cricket": "sports",
    "football": "sports",
    "tennis": "sports",
    
    # Science
    "science": "science",
    "sci-tech": "science",
    "scitech": "science",
    "technology": "tech",
    "tech": "tech",
    "space": "science",
    "research": "science",
    
    # Health
    "health": "health",
    "medical": "health",
    "medicine": "health",
    "wellness": "health",
    
    # Crime
    "crime": "crime",
    "criminal": "crime",
    "police": "crime",
    "court": "crime",
    "judiciary": "crime",
    "legal": "crime",
    
    # World
    "world": "world",
    "international": "world",
    "global": "world",
    "foreign": "world",
    
    # General
    "general": "politics",
    "top-stories": "politics",
    "latest": "politics",
}


def map_category(category_hint: str) -> str:
    """
    Map a feed category hint to a standard category.
    
    Args:
        category_hint: Category string from RSS feed
        
    Returns:
        Standard category name (politics, business, sports, crime, science, health, tech, world)
    """
    if not category_hint:
        return "politics"
    
    hint_lower = category_hint.lower().strip()
    
    # Direct lookup
    if hint_lower in CATEGORY_MAP:
        return CATEGORY_MAP[hint_lower]
    
    # Try partial matching
    for key, value in CATEGORY_MAP.items():
        if key in hint_lower or hint_lower in key:
            return value
    
    # Default to politics
    return "politics"
