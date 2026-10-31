const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

function isPostgresRunning() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(5432, '127.0.0.1');
  });
}

async function start() {
  const running = await isPostgresRunning();
  let pgProcess = null;

  if (!running) {
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

    if (fs.existsSync(postgresBin) && fs.existsSync(pgDataDir)) {
      console.log('⚡ Starting local PostgreSQL server on port 5432...');
      pgProcess = spawn(postgresBin, ['-D', pgDataDir], {
        stdio: 'ignore',
        detached: true,
      });
      pgProcess.unref();

      // Wait a moment for postgres to accept connections
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 400));
        if (await isPostgresRunning()) {
          console.log('✅ Local PostgreSQL server is ready.');
          break;
        }
      }
    } else {
      console.log('ℹ️ Local embedded PostgreSQL files not found. Connecting to external DATABASE_URL if configured.');
    }
  } else {
    console.log('✅ PostgreSQL is already active on port 5432.');
  }

  console.log('🚀 Starting Next.js development server...');
  const nextProcess = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  const cleanup = () => {
    if (nextProcess) nextProcess.kill();
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start().catch(console.error);
