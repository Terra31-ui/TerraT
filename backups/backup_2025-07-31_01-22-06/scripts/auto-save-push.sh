#!/bin/bash
# Save, backup, commit, push, and trigger Netlify deploy for all changes

# Run backup script first
./backup.sh

# Then commit and push
git add .
git commit -m "Auto: save, backup, and push changes"
git push

echo "All changes backed up, committed, and pushed. Netlify deploy will start automatically."
