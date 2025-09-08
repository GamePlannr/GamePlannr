#!/bin/bash

# Fix permissions for node_modules created by Docker

echo "🔧 Fixing permissions for node_modules..."

if [ -d "node_modules" ]; then
    sudo chown -R $(id -u):$(id -g) node_modules
    echo "✅ Permissions fixed!"
else
    echo "❌ node_modules directory not found. Run npm install first."
fi
