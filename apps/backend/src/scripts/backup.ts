import { exec } from 'child_process';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

// Load variables from environment
const dbUrl = env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL is not set. Cannot perform backup.');
  process.exit(1);
}

// Generate backup filename
const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
const backupFilename = `backup-${dateStr}.sql`;
const backupsDir = path.join(process.cwd(), 'backups');

// Ensure backups directory exists
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const backupPath = path.join(backupsDir, backupFilename);

console.log(`Starting database backup to: ${backupPath}`);

// Run pg_dump
// Note: pg_dump must be installed on the system where this script runs
const command = `pg_dump "${dbUrl}" -F c -f "${backupPath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup failed: ${error.message}`);
    return;
  }
  if (stderr) {
    console.warn(`pg_dump stderr: ${stderr}`);
  }
  
  console.log('Database backup completed successfully!');
  console.log(`Backup saved at: ${backupPath}`);
});
