const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const pgDataDir = path.resolve(__dirname, '..', '.pgdata');
const postgresBin = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '@embedded-postgres',
  'windows-x64',
  'native',
  'bin',
  'postgres.exe'
);

if (!fs.existsSync(postgresBin)) {
  console.error('Embedded Postgres binary not found at:', postgresBin);
  process.exit(1);
}

// Automatically remove stale lock file if left by abrupt shutdown
const lockFile = path.join(pgDataDir, 'postmaster.pid');
if (fs.existsSync(lockFile)) {
  try {
    fs.unlinkSync(lockFile);
    console.log('Cleaned up stale postmaster.pid lock file.');
  } catch (err) {
    // Ignore if in use
  }
}

console.log('Starting local PostgreSQL server on port 5432...');
const child = spawn(postgresBin, ['-D', pgDataDir], {
  stdio: 'inherit',
  windowsHide: true,
});

child.on('error', (err) => {
  console.error('Failed to start postgres:', err);
});

process.on('SIGINT', () => {
  console.log('Stopping postgres...');
  child.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit();
});
