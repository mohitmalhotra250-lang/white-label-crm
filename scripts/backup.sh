#!/bin/bash
# Production backup script — run via cron (daily)
set -e
DB_URL=${DATABASE_URL}
BACKUP_DIR=${BACKUP_DIR:-/backups}
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
pg_dump "$DB_URL" --format=custom --file="$BACKUP_DIR/crm_$DATE.dump"
echo "DB backup: $BACKUP_DIR/crm_$DATE.dump"
# Recording backup (S3 / R2)
# aws s3 sync s3://bucket/recordings/ "$BACKUP_DIR/recordings/" || echo "S3 sync skipped"
echo "Backup complete at $DATE"
