-- TodoList DDL (PostgreSQL 17)
-- 출처: docs/7-erd.md, docs/1-domain-definition.md
-- ORM 미사용, 순수 SQL (docs/5-project-principle.md)

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          VARCHAR(50) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, name)  -- 사용자별 카테고리명 고유 (도메인정의서 3.2)
);

CREATE TABLE todos (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id   UUID NOT NULL REFERENCES categories(id),
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    start_date    DATE NOT NULL,
    end_date      DATE NOT NULL,
    is_done       BOOLEAN NOT NULL DEFAULT false,
    completed_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_todos_date_range CHECK (end_date >= start_date)  -- BR-05
);

-- 목록/필터링(UC-05/06) 성능용 인덱스 (project-principle 5.4절)
CREATE INDEX idx_todos_user_id ON todos (user_id);
CREATE INDEX idx_todos_category_id ON todos (category_id);
CREATE INDEX idx_todos_date_range ON todos (start_date, end_date);
