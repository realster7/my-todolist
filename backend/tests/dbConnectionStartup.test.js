const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { spawnSync, spawn } = require('node:child_process');

const cwd = path.join(__dirname, '..');

const dummyJwtEnv = {
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
};

test('app exits with code 1 and logs failure when database connection fails', () => {
  const result = spawnSync(process.execPath, ['src/app.js'], {
    cwd,
    env: {
      ...process.env,
      DATABASE_URL: 'postgres://user:pass@127.0.0.1:1/nonexistent',
      PORT: '0',
      ...dummyJwtEnv,
    },
    timeout: 5000,
    encoding: 'utf8',
  });

  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Failed to connect to database'));
});

test('app connects to the real database and starts listening', async () => {
  const child = spawn(process.execPath, ['src/app.js'], {
    cwd,
    env: {
      ...process.env,
      PORT: '0',
    },
  });

  let output = '';
  let sawConnected = false;
  let sawListening = false;

  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
    if (output.includes('Database connection established')) sawConnected = true;
    if (output.includes('listening on port')) sawListening = true;
  });

  const success = await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (sawConnected && sawListening) {
        clearInterval(interval);
        clearTimeout(timer);
        resolve(true);
      }
    }, 100);

    const timer = setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, 5000);
  });

  child.kill();

  assert.ok(success, `Expected both startup logs within timeout. Output so far:\n${output}`);
});
