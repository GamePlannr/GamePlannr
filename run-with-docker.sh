#!/bin/bash

# Script to run GamePlannr with Docker

echo "🚀 Starting GamePlannr with Docker..."

# Check if Supabase is running
if ! curl -s http://127.0.0.1:54321 > /dev/null; then
    echo "⚠️  Supabase is not running. Starting Supabase..."
    supabase start
fi

# Build and run the React app with Docker
echo "📦 Building and running React app with Docker..."

# Remove any existing node_modules to avoid conflicts
rm -rf node_modules

# Run npm install and start with Docker
docker run --rm -it \
  -v "$(pwd)":/app \
  -w /app \
  -p 3000:3000 \
  -e REACT_APP_SUPABASE_URL=http://host.docker.internal:54321 \
  -e REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0 \
  -e REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51S3mRoFUjUaFpWkc8NBUv8EUc03ME8ovMJ4gv7xHXtf8rJBtirhkKx47UMBOyCFgtwR8670fIgmsgUIxYiQPQSYN00qfk3PiOS \
  -e SITE_URL=http://localhost:3000 \
  --add-host=host.docker.internal:host-gateway \
  node:18-alpine \
  sh -c "npm install && npm start"
