#!/bin/bash

# GamePlannr Docker Startup Script (User-based approach)

echo "🚀 Starting GamePlannr with Docker (User-based)..."

# Check if Supabase is running
if ! curl -s http://127.0.0.1:54321 > /dev/null; then
    echo "⚠️  Supabase is not running. Starting Supabase..."
    supabase start
    echo "✅ Supabase started!"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies with Docker (as current user)..."
    docker run --rm \
      -v "$(pwd)":/app \
      -w /app \
      -u $(id -u):$(id -g) \
      node:18-alpine \
      npm install --ignore-scripts
    echo "✅ Dependencies installed!"
fi

# Start the React app
echo "🎯 Starting React app..."
docker run --rm -it \
  -v "$(pwd)":/app \
  -w /app \
  -p 3000:3000 \
  -u $(id -u):$(id -g) \
  -e REACT_APP_SUPABASE_URL=http://host.docker.internal:54321 \
  -e REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0 \
  -e REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51S3mRoFUjUaFpWkc8NBUv8EUc03ME8ovMJ4gv7xHXtf8rJBtirhkKx47UMBOyCFgtwR8670fIgmsgUIxYiQPQSYN00qfk3PiOS \
  -e SITE_URL=https://gameplannrmvp.netlify.app/ \
  --add-host=host.docker.internal:host-gateway \
  node:18-alpine \
  npm start
