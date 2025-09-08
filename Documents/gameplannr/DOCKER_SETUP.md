# GamePlannr Docker Setup

This guide explains how to run the GamePlannr MVP using Docker.

## Prerequisites

- Docker installed and running
- Supabase CLI installed (for local development)

## Quick Start

### Option 1: Using the startup script (Recommended)

```bash
./start-app.sh
```

This script will:
1. Check if Supabase is running and start it if needed
2. Install npm dependencies using Docker
3. Start the React app

### Option 2: Manual steps

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Install dependencies:**
   ```bash
   docker run --rm -v "$(pwd)":/app -w /app node:18-alpine npm install --ignore-scripts
   ```

3. **Start the React app:**
   ```bash
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
     npm start
   ```

## Access the Application

Once running, you can access the application at:
- **Frontend**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **Supabase API**: http://localhost:54321

## Features

- ✅ Authentication (Sign up/Sign in)
- ✅ Role-based dashboards (Parent/Mentor)
- ✅ Mentor search and profiles
- ✅ Session request flow
- ✅ Mock Stripe payment integration
- ✅ Local Supabase development environment

## Testing the Stripe Integration

The app includes a mock Stripe integration for local development:

1. Sign up as a parent
2. Search for mentors
3. Request a session
4. Go to payment page
5. Click "Pay with Stripe" - it will simulate payment and redirect to success

## Troubleshooting

### If you get permission errors (EACCES):
```bash
# Fix permissions for node_modules
./fix-permissions.sh

# Or manually:
sudo chown -R $(id -u):$(id -g) node_modules
```

### If dependencies fail to install:
```bash
# Remove node_modules and try again
rm -rf node_modules
docker run --rm -v "$(pwd)":/app -w /app node:18-alpine npm install --ignore-scripts
./fix-permissions.sh
```

### Alternative: Use user-based Docker approach:
```bash
# This avoids permission issues by running as current user
./start-app-user.sh
```

### If Supabase is not accessible:
```bash
# Restart Supabase
supabase stop
supabase start
```

### If port 3000 is already in use:
```bash
# Kill any process using port 3000
sudo lsof -ti:3000 | xargs kill -9
```

## Production Deployment

For production, update the environment variables in the Docker command to use your production Supabase instance and real Stripe keys.
