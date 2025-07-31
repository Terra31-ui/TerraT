// Backup script for TerraT project (Node.js version)
// Usage: node backup.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = process.cwd();
const backupDir = path.join(projectDir, 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const dest = path.join(backupDir, `backup_${timestamp}`);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Exclude backups and .git
const exclude = ['backups', '.git'];

function shouldExclude(file) {
  return exclude.some(ex => file === ex);
}

function copyRecursive(src, dest) {
  if (shouldExclude(path.basename(src))) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(projectDir, dest);
console.log(`Backup completed at ${dest}`);
