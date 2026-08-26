-- 출처: docs/schema.sql, docs/7-erd.md
-- DB-02 결정사항: "기본" 카테고리(BR-04) 자동 생성 책임은 DB가 아닌
-- 서비스 레이어(backend/src/services/categoryService.js, BE-06)가 가진다.
-- 이 테이블은 UNIQUE(user_id, name) 제약으로 중복 이름만 방지한다 (project-principle 2.2절).
CREATE TABLE categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          VARCHAR(50) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, name)  -- 사용자별 카테고리명 고유 (도메인정의서 3.2)
);
