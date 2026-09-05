"""
JanSahaya Python FastAPI Backend Package
Automated environment path resolution for robust importing across CLI, Docker, and scripts.
"""
import os
import sys

_backend_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.dirname(_backend_dir)
for _p in [_root_dir, _backend_dir]:
    if _p not in sys.path:
        sys.path.insert(0, _p)
