#!/bin/bash

# Deploy script for GitHub Pages
echo "Building frontend..."
cd frontend
npm run build

echo "Copying built files to root directory..."
cd ..
cp -r frontend/dist/* .

echo "Committing and pushing to GitHub..."
git add .
git commit -m "Deploy frontend to GitHub Pages"
git push origin main

echo "Deployment complete! Your site should be available at:"
echo "https://nithilan45.github.io/fisd-counselor/"


