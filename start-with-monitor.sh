#!/bin/bash

# Marmara API Server Monitor Startup Script
# This script starts the server with automatic crash detection and restart

echo "🚀 Starting Marmara API with Server Monitor..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Load environment variables if .env.local exists
if [ -f ".env.local" ]; then
    echo "📋 Loading environment variables from .env.local"
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "⚠️  No .env.local file found. Email notifications will be disabled."
    echo "   Copy .env.monitor to .env.local and configure your email settings."
fi

# Install nodemailer if not already installed
if ! npm list nodemailer &> /dev/null; then
    echo "📦 Installing nodemailer for email notifications..."
    npm install nodemailer
fi

# Make sure the server monitor script is executable
chmod +x server-monitor.js

# Start the server monitor
echo "🔍 Starting server monitor..."
echo "📝 Logs will be written to: logs/server-monitor.log"
echo "💥 Crash reports will be written to: logs/crash-reports.log"
echo ""
echo "To stop the monitor, press Ctrl+C"
echo "----------------------------------------"

# Start the monitor
node server-monitor.js