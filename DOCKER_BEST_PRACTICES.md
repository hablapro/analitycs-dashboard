# Docker Best Practices to Prevent Container Accumulation

## 1. Always use --rm flag for temporary containers
```bash
docker run --rm image-name
```
This automatically removes the container when it exits.

## 2. Name your containers
```bash
docker run --name my-app image-name
```
Named containers are easier to manage and prevent duplicates.

## 3. Use docker-compose for multi-container apps
```yaml
version: '3'
services:
  app:
    image: your-image
    container_name: your-app-name
```

## 4. Regular cleanup commands

### Daily cleanup
```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -f
```

### Weekly cleanup
```bash
# Full system cleanup (containers, images, volumes, networks)
docker system prune -a -f
```

## 5. Set up aliases in your shell profile
Add to ~/.zshrc or ~/.bashrc:
```bash
alias dclean='docker system prune -a -f'
alias dstop='docker stop $(docker ps -q)'
alias drm='docker rm $(docker ps -a -q)'
```

## 6. Use the cleanup script
```bash
./docker-cleanup.sh
```

## 7. Monitor Docker disk usage
```bash
docker system df
```

## 8. Set Docker daemon options
Create/edit `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## 9. Use health checks
Add health checks to prevent unhealthy containers from accumulating:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

## 10. Automated cleanup with cron
Add to crontab (`crontab -e`):
```bash
# Clean up Docker every day at 2 AM
0 2 * * * /usr/local/bin/docker system prune -f
```