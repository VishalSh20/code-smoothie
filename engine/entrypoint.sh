#!/bin/bash

# Stop execution on any error
set -e

echo "Starting setup for the Code-Smoothie engine..."

# Pull necessary Docker images
echo "Pulling required Docker images..."
docker pull gcc:latest || { echo "Failed to pull gcc:latest"; exit 1; }
docker pull openjdk:slim || { echo "Failed to pull openjdk:slim"; exit 1; }
docker pull python:slim || { echo "Failed to pull python:slim"; exit 1; }
docker pull node:slim || { echo "Failed to pull node:slim"; exit 1; }

# Load environment variables
echo "Loading configuration..."
if [ -f ".config" ]; then
    set -a
    source .config
    set +a
else
    echo "Error: .config file not found!"
    exit 1
fi

# Set up prisma
npx prisma generate || { echo "Failed to generate schema"; exit 1; }
npx prisma db push || { echo "Failed to push schema to db"; exit 1; }

# Install dependencies
echo "Installing npm dependencies..."
npm install || { echo "Failed to install dependencies"; exit 1; }

# Start the application with pm2
echo "Starting the engine with pm2..."

npx pm2 start npm --name "code-smoothie-engine" -- run start
npx pm2 save

echo "Code-Smoothie engine is up and running under pm2!"
