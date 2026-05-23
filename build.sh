#!/usr/bin/env bash
# Vercel Build Script
# Produces .vercel/output (Build Output API v3) containing:
#   - TanStack Start SSR frontend (via Nitro vercel preset)
#   - Flask API as a Python serverless function
set -o errexit

echo "=== Step 1: Build Frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Step 2: Move Build Output to project root ==="
rm -rf .vercel/output
mkdir -p .vercel
cp -r frontend/.vercel/output .vercel/output

echo "=== Step 3: Set up Flask API function ==="
FUNC_DIR=".vercel/output/functions/api/index.func"
mkdir -p "$FUNC_DIR"

# Copy the Flask application code
cp -r backend "$FUNC_DIR/backend"
cp api/index.py "$FUNC_DIR/index.py"

# Install Python dependencies into the function directory
PIP_CMD=$(command -v pip3 || command -v pip || echo "pip")
$PIP_CMD install --target "$FUNC_DIR" -r requirements.txt --quiet

# Create the Vercel function config
cat > "$FUNC_DIR/.vc-config.json" << 'EOF'
{
  "runtime": "python3.12",
  "handler": "index.app",
  "launcherType": "Nodejs",
  "shouldAddHelpers": true
}
EOF

echo "=== Step 4: Update routing config ==="
python3 << 'PYEOF'
import json

config_path = ".vercel/output/config.json"
with open(config_path) as f:
    config = json.load(f)

# Insert API route at the beginning, before static asset handling
api_route = {"src": "/api/(.*)", "dest": "/api/index"}
config["routes"].insert(0, api_route)

with open(config_path, "w") as f:
    json.dump(config, f, indent=2)

print("Updated config.json with API route")
PYEOF

echo "=== Build complete ==="
echo "Output structure:"
ls -la .vercel/output/
echo ""
echo "Functions:"
ls -la .vercel/output/functions/
