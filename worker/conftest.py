"""
Pytest configuration - ensures worker root is on sys.path so
absolute imports like 'from scheduler.jobs import run_pipeline' work.
"""

import sys
from pathlib import Path

# Add worker root to sys.path so imports match production behaviour
sys.path.insert(0, str(Path(__file__).resolve().parent))
