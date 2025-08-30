"""
Vercel-compatible Flask app entry point
"""
import sys
import os

# Add the parent directory to the path so we can import from the root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# This is the entry point for Vercel
app = app
