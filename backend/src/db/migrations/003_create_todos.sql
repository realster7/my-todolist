-- 출처: docs/schema.sql, docs/7-erd.md
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
