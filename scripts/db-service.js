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

console.log('Starting local PostgreSQL server...');
const child = spawn(postgresBin, ['-D', pgDataDir], {
  stdio: 'inherit',
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
