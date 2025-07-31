#!/bin/bash

# Docker cleanup script to prevent container accumulation

echo "🧹 Docker Cleanup Script"
echo "======================="

# Stop all running containers
echo "Stopping all containers..."
docker stop $(docker ps -q) 2>/dev/null || echo "No running containers to stop"

# Remove all stopped containers
echo "Removing stopped containers..."
docker container prune -f

# Remove unused images
echo "Removing unused images..."
docker image prune -f

# Remove unused volumes
echo "Removing unused volumes..."
docker volume prune -f

# Remove unused networks
echo "Removing unused networks..."
docker network prune -f

# Show disk usage
echo ""
echo "📊 Docker disk usage:"
docker system df

echo ""
echo "✅ Cleanup complete!"