# Vercel Serverless Function entry point
# Vercel auto-detects the Flask `app` instance from this file.
import sys
import os

# Ensure the project root is on the Python path so `backend.app` resolves
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import app
