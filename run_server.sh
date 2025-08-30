#!/usr/bin/env bash
# Optional: install minimal deps for production server (skip if already installed)
pip install --user waitress flask flask_sqlalchemy flask_cors werkzeug

# Run the app (app.py uses waitress)
python3 /Users/umairwanware/Documents/Student Record Management Sytem/app.py
