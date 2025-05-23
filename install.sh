#!/bin/bash

echo "🚀 Setting up Pouch - Read Later App"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating server environment file..."
    cp env.example .env
    echo "⚠️  Please update the JWT_SECRET in server/.env for production use!"
fi

cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "🎉 Installation complete!"
echo ""
echo "To start the development servers:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - Backend server on http://localhost:3001"
echo "  - Frontend app on http://localhost:5173"
echo ""
echo "📖 Check the README.md for more information!" 