#!/usr/bin/env bash
# Optional: install minimal deps for production server (skip if already installed)
pip install --user waitress flask flask_sqlalchemy flask_cors werkzeug

# Check if certificate files exist
if [ -f "cert.pem" ] && [ -f "key.pem" ]; then
    echo "Starting server with HTTPS on port 5001"
    # Run the app with SSL certificates
    python3 /Users/umairwanware/Documents/Student Record Management Sytem/app.py
else
    echo "Certificate files not found. Please generate SSL certificates first."
    echo "You can generate self-signed certificates with:"
    echo "openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365"
    exit 1
fi
