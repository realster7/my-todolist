const bcrypt = require('bcryptjs');
const pool = require('./pool');

const SEED_EMAILS = ['seed-student@example.com', 'seed-worker@example.com'];

async function seed() {
  // 재실행 안전성: 기존 시드 사용자 삭제 (categories/todos는 ON DELETE CASCADE로 함께 제거)
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [SEED_EMAILS]);

  const passwordHash = await bcrypt.hash('password123', 10);

  const { rows: users } = await pool.query(
    `INSERT INTO users (email, password, name) VALUES
       ($1, $3, '학생 시드'), ($2, $3, '직장인 시드')
     RETURNING id, email`,
    [SEED_EMAILS[0], SEED_EMAILS[1], passwordHash]
  );
  const student = users.find((u) => u.email === SEED_EMAILS[0]);
  const worker = users.find((u) => u.email === SEED_EMAILS[1]);

  const { rows: categories } = await pool.query(
    `INSERT INTO categories (user_id, name) VALUES
       ($1, '기본'), ($1, '과제'),
       ($2, '기본'), ($2, '업무')
     RETURNING id, user_id, name`,
    [student.id, worker.id]
  );
  const cat = (userId, name) =>
    categories.find((c) => c.user_id === userId && c.name === name).id;

  const today = new Date();
  const iso = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  const todos = [
    // 학생: 시작전 / 진행중 / 완료 / 지연 각 1건
    [student.id, cat(student.id, '과제'), '알고리즘 과제', iso(3), iso(7), false, null],
    [student.id, cat(student.id, '과제'), 'DB 프로젝트 발표자료', iso(-1), iso(3), false, null],
    [student.id, cat(student.id, '기본'), '독서 노트 정리', iso(-5), iso(-1), true, new Date().toISOString()],
    [student.id, cat(student.id, '과제'), '특강 리포트', iso(-10), iso(-3), false, null],
    // 직장인: 시작전 / 진행중 / 완료 / 지연 각 1건
    [worker.id, cat(worker.id, '업무'), '분기 보고서 작성', iso(2), iso(5), false, null],
    [worker.id, cat(worker.id, '업무'), '거래처 미팅 준비', iso(-2), iso(2), false, null],
    [worker.id, cat(worker.id, '기본'), '치과 예약', iso(-4), iso(-1), true, new Date().toISOString()],
    [worker.id, cat(worker.id, '업무'), '계약서 검토', iso(-8), iso(-2), false, null],
  ];

  for (const t of todos) {
    await pool.query(
      `INSERT INTO todos
         (user_id, category_id, title, start_date, end_date, is_done, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      t
    );
  }

  console.log(`Seeded ${users.length} users, ${categories.length} categories, ${todos.length} todos.`);
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
