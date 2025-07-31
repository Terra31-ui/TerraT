#!/bin/zsh
# Usage: ./scripts/backup-commit-push.sh "Your commit message"

set -e

COMMIT_MSG=${1:-"Auto backup, commit, and push"}
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="backups/backup_$TIMESTAMP"

# Create backup
mkdir -p "$BACKUP_DIR"
rsync -a --exclude 'node_modules' --exclude 'backups' . "$BACKUP_DIR/"

# Git add, commit, and push

git add .
git commit -m "$COMMIT_MSG"
git push

echo "Backup, commit, and push complete. Backup saved to $BACKUP_DIR"
