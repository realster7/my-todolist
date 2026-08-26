-- 출처: docs/schema.sql, 목록/필터링(UC-05/06) 성능용 (project-principle 5.4절)
CREATE INDEX idx_todos_user_id ON todos (user_id);
CREATE INDEX idx_todos_category_id ON todos (category_id);
CREATE INDEX idx_todos_date_range ON todos (start_date, end_date);
