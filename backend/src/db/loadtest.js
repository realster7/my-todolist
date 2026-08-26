const pool = require('./pool');

async function measure(concurrency, userId) {
  const runs = Array.from({ length: concurrency }, async () => {
    const start = process.hrtime.bigint();
    await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY start_date',
      [userId]
    );
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  });

  const durations = await Promise.all(runs);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const max = Math.max(...durations);
  return { concurrency, avgMs: avg.toFixed(2), maxMs: max.toFixed(2) };
}

async function main() {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE email = 'seed-student@example.com'"
  );
  if (rows.length === 0) {
    throw new Error('시드 사용자가 없습니다. 먼저 `npm run seed`를 실행하세요.');
  }
  const userId = rows[0].id;

  console.log('pool.max =', pool.options.max);
  console.log(
    '이 측정은 DB 커넥션 풀에 대한 소규모 검증이며, PRD의 1,000명 동시접속 목표에 대한 애플리케이션 레벨 실측을 대체하지 않는다.'
  );

  for (const n of [20, 50]) {
    const result = await measure(n, userId);
    console.log(
      `concurrency=${result.concurrency} avg=${result.avgMs}ms max=${result.maxMs}ms`
    );
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
