"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const env_1 = require("../config/env");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Load variables from environment
const dbUrl = env_1.env.DATABASE_URL;
if (!dbUrl) {
    console.error('DATABASE_URL is not set. Cannot perform backup.');
    process.exit(1);
}
// Generate backup filename
const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
const backupFilename = `backup-${dateStr}.sql`;
const backupsDir = path_1.default.join(process.cwd(), 'backups');
// Ensure backups directory exists
if (!fs_1.default.existsSync(backupsDir)) {
    fs_1.default.mkdirSync(backupsDir, { recursive: true });
}
const backupPath = path_1.default.join(backupsDir, backupFilename);
console.log(`Starting database backup to: ${backupPath}`);
// Run pg_dump
// Note: pg_dump must be installed on the system where this script runs
const command = `pg_dump "${dbUrl}" -F c -f "${backupPath}"`;
(0, child_process_1.exec)(command, (error, stdout, stderr) => {
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
