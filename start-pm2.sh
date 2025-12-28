#!/usr/bin/env bash

# install project packages using pnpm
echo "Installing packages..."
pnpm i


# Build the server project using pnpm
echo "Building the server project..."
pnpm build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Server build failed! Exiting..."
    exit 1
fi

echo "Server build completed successfully!"

# Start or reload the server application with PM2
echo "Starting/reloading server application with PM2..."

# Check if the server app is already running
if pm2 describe codefotech-server > /dev/null 2>&1; then
    echo "Server application is already running. Reloading..."
    pm2 reload codefotech-server
else
    echo "Starting new server application..."
    pm2 start dist/index.js --name "codefotech-server"
fi

# Save PM2 configuration for startup
echo "Saving PM2 configuration..."
pm2 save

echo "Server application is now running with PM2!"
echo "Use 'pm2 logs codefotech-server' to view server logs"
echo "Use 'pm2 stop codefotech-server' to stop the server application"