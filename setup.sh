#!/bin/bash

# FISD Counselor Web App Setup Script
echo "🎓 Setting up FISD Counselor Web App..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created! Please edit it with your API keys."
else
    echo "✅ .env file already exists."
fi

# Copy .env to backend directory for dotenv
echo "📝 Copying .env to backend directory..."
cp .env backend/.env

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create PDFs directory
echo "📁 Creating PDFs directory..."
mkdir -p backend/pdfs
touch backend/pdfs/.gitkeep

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Perplexity API key"
echo "2. Add FISD PDFs to backend/pdfs/ directory"
echo "3. Run ./start.sh to start the application"
echo ""
echo "For deployment instructions, see README.md"
