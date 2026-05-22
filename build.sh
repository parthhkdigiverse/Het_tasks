#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

echo "Installing frontend dependencies..."
cd frontend
# Depending on the platform, bun might not be available. We can fallback to npm.
if command -v bun &> /dev/null
then
    bun install
    bun run build
else
    npm install
    npm run build
fi
cd ..

echo "Build complete."
