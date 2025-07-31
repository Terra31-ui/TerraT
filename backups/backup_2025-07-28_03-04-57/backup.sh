#!/bin/zsh
# Backup script for TerraT project (shell version)
# Usage: ./backup.sh

BACKUP_DIR="$(pwd)/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DEST="$BACKUP_DIR/backup_$TIMESTAMP"

mkdir -p "$DEST"

# Exclude the backups folder itself from the backup
rsync -av --exclude 'backups' --exclude '.git' ./ "$DEST"

echo "Backup completed at $DEST"
