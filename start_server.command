#!/bin/bash
cd "$(dirname "$0")/web"
PORT=${PORT:-5001}
echo "Starting Llyli on port $PORT..."
PORT=$PORT ../.venv/bin/python app.py
