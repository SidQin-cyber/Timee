#!/bin/bash

echo "🚀 Starting Timee API Server..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Start the application
echo "✅ Starting the application on port 8080..."
npm run start:prod 