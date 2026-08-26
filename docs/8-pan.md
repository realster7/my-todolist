# TodoList 실행 계획 (WBS)

## 버전 이력

| 버전  | 날짜       | 작성자     | 변경 내용     |
| ----- | ---------- | ---------- | -------------- |
| 0.1.0 | 2026-08-26 | Daniel Kim | 최초 초안 작성 |

---

## 0. 문서 개요

**목적**: `1-domain-definition.md`(v0.4.0), `2-PRD.md`(v0.2.0), `3-user-scenario.md`, `4-wireframe.md`, `5-project-principle.md`(v0.2.0, FSD), `6-arch.md`, `7-erd.md`, `schema.sql`을 근거로 DB/백엔드/프론트엔드 실행 가능한 Task 단위로 작업을 분할한다.

**전제**: 1인 개발, 2일(Day1~Day2) MVP 완성(PRD 8장). Task는 독립적으로 완료 판정 가능한 최소 단위로 쪼갠다. UC-ID/BR-ID는 도메인정의서를 인용만 한다.

**Day 매핑**: Day1 = DB 전체 + Backend 전체(BE-01~12), Day2 = Frontend 전체(FE-01~13) + 통합 QA(QA-01~02). PRD 8장 일정과 동일한 축을 유지한다.

---

## 1. Database

### DB-01. 스키마 마이그레이션 적용

- **수행 작업**: `schema.sql`(users/categories/todos, CHECK/UNIQUE/인덱스 포함)을 마이그레이션 파일로 분리(`001_create_users.sql`, `002_create_categories.sql`, `003_create_todos.sql`, `004_indexes.sql`)하고 로컬 PostgreSQL 17 인스턴스에 적용한다.
- **완료 조건**:
  - [ ] 4개 마이그레이션 파일이 `backend/src/db/migrations/`에 존재한다
  - [ ] `psql`로 마이그레이션 실행 시 오류 없이 users/categories/todos 테이블이 생성된다
  - [ ] `\d todos`에서 `chk_todos_date_range` CHECK 제약과 FK(user_id, category_id)가 확인된다
  - [ ] `idx_todos_user_id`, `idx_todos_category_id`, `idx_todos_date_range` 인덱스가 생성된다
- **선행 Task**: 없음

### DB-02. 기본 카테고리 생성 규칙 검증

- **수행 작업**: BR-04("기본" 카테고리는 사용자별 최초 1회 자동 생성)를 DB 레벨에서 강제할지, 서비스 레벨(BE-06)에서 강제할지 결정하고 문서화한다(project-principle 2.2절 기준 서비스 레벨로 확정, DB는 UNIQUE(user_id, name) 제약만 담당).
- **완료 조건**:
  - [ ] `(user_id, name)` UNIQUE 제약으로 동일 사용자가 같은 이름의 카테고리를 중복 생성할 수 없음을 SQL로 직접 검증(중복 INSERT 시 에러 발생 확인)
  - [ ] "기본" 카테고리 자동 생성 책임이 BE-06(서비스 레이어)에 있음을 주석 또는 커밋 메시지로 기록
- **선행 Task**: DB-01

---

## 2. Backend

### BE-01. 프로젝트 초기 셋업

- **수행 작업**: `backend/` 디렉토리에 Express + pg 기반 프로젝트 초기화(`package.json`, `src/app.js`, `src/config/env.js`, `.env.example`), 5-project-principle.md 7장 디렉토리 구조 생성.
- **완료 조건**:
  - [ ] `npm start`(또는 `node src/app.js`)로 서버가 지정 포트에서 기동된다
  - [ ] `.env.example`에 `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `PORT` 키가 존재한다
  - [ ] `routes/`, `controllers/`, `services/`, `db/queries/`, `middlewares/`, `utils/` 폴더가 생성되어 있다
- **선행 Task**: 없음

### BE-02. DB 커넥션 풀 연결

- **수행 작업**: `db/pool.js`에 `pg.Pool` 단일 인스턴스 생성(project-principle 5.4절 `max:20` 등 초기값 적용), 앱 기동 시 DB 연결 확인 로직 추가.
- **완료 조건**:
  - [ ] 서버 기동 로그에 DB 연결 성공 메시지가 출력된다
  - [ ] 잘못된 `DATABASE_URL`일 때 명확한 에러로 즉시 종료된다
- **선행 Task**: DB-01, BE-01

### BE-03. 회원가입 API (UC-01)

- **수행 작업**: `POST /auth/signup` — email/password/name 입력받아 비밀번호 해시(bcrypt 등) 후 `users` 테이블에 저장. 라우트→컨트롤러→서비스→쿼리 4계층 구현.
- **완료 조건**:
  - [ ] 정상 입력 시 201 응답과 함께 사용자 생성됨 (비밀번호는 평문 저장되지 않음, 도메인정의서 3.1)
  - [ ] 중복 email 가입 시 409 등 명확한 에러 응답 (BR-03)
  - [ ] 회원가입 시 해당 사용자의 "기본" 카테고리가 자동 생성됨 (BR-04)
- **선행 Task**: BE-02

### BE-04. 로그인/JWT 발급 API (UC-02)

- **수행 작업**: `POST /auth/login` — email/password 검증 후 access_token(단명)·refresh_token(장명) 발급. refresh_token은 httpOnly 쿠키로, access_token은 응답 바디로 반환 (PRD 6·7장).
- **완료 조건**:
  - [ ] 올바른 자격증명으로 로그인 시 access_token(바디)과 refresh_token(Set-Cookie httpOnly) 발급 확인
  - [ ] 틀린 email/password 시 401 응답
  - [ ] access_token 페이로드에 `userId`가 포함됨
- **선행 Task**: BE-03

### BE-05. 인증 미들웨어 + 토큰 재발급 (BR-01)

- **수행 작업**: `middlewares/authMiddleware.js`에서 access_token 검증 후 `req.user` 주입. `POST /auth/refresh` 엔드포인트로 refresh_token 검증 후 access_token 재발급.
- **완료 조건**:
  - [ ] access_token 없이 보호된 라우트 호출 시 401 응답 (BR-01)
  - [ ] 만료된 access_token + 유효한 refresh_token으로 `/auth/refresh` 호출 시 새 access_token 발급
  - [ ] refresh_token도 만료/무효인 경우 재발급 거부 및 재로그인 요구 응답
- **선행 Task**: BE-04

### BE-06. 카테고리 조회/기본값 처리 (UC-09)

- **수행 작업**: `categoryService.js`/`categoryQueries.js` — 사용자별 카테고리 목록 조회 API, "기본" 카테고리 자동 생성 로직(BE-03 회원가입 시 호출).
- **완료 조건**:
  - [ ] `GET /categories`가 인증된 사용자 본인 카테고리만 반환 (BR-02)
  - [ ] "기본" 카테고리는 삭제 API 대상에서 제외됨(삭제 엔드포인트 자체를 노출하지 않음, BR-04, OI-01 회피)
- **선행 Task**: BE-05

### BE-07. 할일 등록 API (UC-04)

- **수행 작업**: `POST /todos` — title/startDate/endDate/(categoryId 선택) 입력받아 생성. categoryId 미지정 시 사용자 "기본" 카테고리로 대체(BR-04), startDate<=endDate 검증(BR-05).
- **완료 조건**:
  - [ ] 정상 등록 시 201과 생성된 Todo(계산된 status 포함 없이 raw 데이터) 반환
  - [ ] categoryId 미지정 시 응답의 categoryId가 사용자의 "기본" 카테고리 id와 일치
  - [ ] endDate < startDate 입력 시 400 응답 (BR-05)
  - [ ] 인증 없이 호출 시 401 (BR-01)
- **선행 Task**: BE-05, BE-06

### BE-08. 할일 목록 조회 + 필터링 API (UC-05, UC-06)

- **수행 작업**: `GET /todos?category=&status=` — 본인 소유 Todo만 조회(BR-02), 각 항목에 도메인정의서 5장 규칙으로 계산한 `status`(NOT_STARTED/IN_PROGRESS/DONE/OVERDUE)를 포함해 반환. `utils/computeTodoStatus.js` 단일 함수로 구현(BR-06).
- **완료 조건**:
  - [ ] 필터 없이 호출 시 본인 Todo 전체가 status 포함되어 반환
  - [ ] `category` 쿼리 파라미터로 카테고리별 필터링 동작
  - [ ] `status` 파라미터로 시작전/진행중/완료/지연 각각 필터링 동작
  - [ ] 완료(is_done=true)된 항목은 종료일이 지났어도 OVERDUE가 아닌 DONE으로 반환 (도메인정의서 5장 우선순위 규칙)
  - [ ] 타 사용자의 Todo는 결과에 포함되지 않음 (BR-02)
- **선행 Task**: BE-07

### BE-09. 할일 수정 API (UC-07)

- **수행 작업**: `PATCH /todos/:id` — 제목/기간/카테고리/완료여부 수정. 본인 소유만 수정 가능(BR-02), endDate 검증(BR-05), isDone 토글 시 completedAt 기록/초기화(BR-07).
- **완료 조건**:
  - [ ] 정상 수정 시 변경 내용 반영 및 200 응답
  - [ ] 타인 소유 Todo 수정 시도 시 403 또는 404 (BR-02)
  - [ ] endDate < startDate로 수정 시도 시 400 (BR-05)
  - [ ] isDone false→true 전환 시 completedAt에 현재 시각 기록, true→false 전환 시 completedAt이 null로 초기화 (BR-07)
- **선행 Task**: BE-08

### BE-10. 할일 삭제 API (UC-08)

- **수행 작업**: `DELETE /todos/:id` — 본인 소유 Todo만 삭제 가능(BR-02).
- **완료 조건**:
  - [ ] 본인 Todo 삭제 시 204 응답 및 DB에서 실제 제거 확인
  - [ ] 타인 소유 Todo 삭제 시도 시 403 또는 404
- **선행 Task**: BE-08

### BE-11. 공통 에러 핸들링

- **수행 작업**: `middlewares/errorHandler.js` — 검증 실패/인증 실패/서버 에러를 일관된 JSON 포맷(`{ error: { code, message } }`)으로 응답.
- **완료 조건**:
  - [ ] 존재하지 않는 라우트 호출 시 404 JSON 응답
  - [ ] 컨트롤러에서 발생한 예외가 500으로 죽지 않고 표준 포맷으로 응답
  - [ ] BE-03~BE-10의 모든 에러 응답이 동일 포맷을 따름
- **선행 Task**: BE-10

### BE-12. 백엔드 핵심 로직 최소 테스트

- **수행 작업**: project-principle 4.1절 기준 — `computeTodoStatus`, BR-05/BR-02/BR-04/BR-07/BR-03 단위 테스트 및 UC-01/04/05/07/08 happy path API 통합 테스트(Jest/supertest) 작성.
- **완료 조건**:
  - [ ] `computeTodoStatus` 4개 상태 케이스 + "완료 시 지연 아님" 케이스 테스트 통과
  - [ ] BR-05, BR-02, BR-04, BR-07, BR-03 각 1개 이상 테스트 통과
  - [ ] UC-01/04/05/07/08 API 통합 테스트 각 1개 이상 통과
  - [ ] `npm test` 전체 그린
- **선행 Task**: BE-11

---

## 3. Frontend

### FE-01. 프로젝트 초기 셋업

- **수행 작업**: `frontend/` 디렉토리에 React 19 + TypeScript(Vite) 프로젝트 생성, Zustand·TanStack Query 설치, 5-project-principle.md 6장 FSD 폴더(`app/pages/features/entities/shared`) 골격 생성.
- **완료 조건**:
  - [ ] `npm run dev`로 개발 서버가 기동되고 빈 페이지가 렌더링된다
  - [ ] `src/app/providers.tsx`에 `QueryClientProvider`가 적용되어 있다
  - [ ] FSD 5개 레이어 폴더가 생성되어 있다
- **선행 Task**: 없음

### FE-02. shared 공통 UI 컴포넌트

- **수행 작업**: `shared/ui`에 Button/Input/Modal/Header, `shared/api/httpClient.ts`(fetch 래퍼, access_token 헤더 자동 부착, 401 시 refresh 처리 훅 연결점) 구현.
- **완료 조건**:
  - [ ] Button/Input/Modal이 스토리 없이도 다른 화면에서 import되어 렌더링 확인됨
  - [ ] `httpClient`가 요청마다 `Authorization: Bearer <access_token>` 헤더를 자동 부착
  - [ ] `httpClient`가 401 응답을 받으면 refresh 시도 후 원 요청을 재시도하는 흐름을 가진다(4-wireframe.md/3-user-scenario.md 4.1절)
- **선행 Task**: FE-01

### FE-03. entities/user (인증 상태)

- **수행 작업**: `entities/user/model/types.ts`(User 타입), `entities/user/model/authStore.ts`(Zustand — access_token, 로그인 여부, 로그인/로그아웃 액션).
- **완료 조건**:
  - [ ] `authStore`에 access_token 저장/삭제 액션이 동작한다
  - [ ] 새로고침 시 로그인 상태 유지 전략(메모리 한정 or 저장소 사용)이 결정되어 주석으로 명시됨
- **선행 Task**: FE-01

### FE-04. 회원가입 화면 (UC-01)

- **수행 작업**: `features/sign-up`(SignUpForm, api), `pages/sign-up`(SignUpPage) — BE-03 연동, 4-wireframe.md 회원가입 화면 레이아웃(데스크톱+모바일) 구현.
- **완료 조건**:
  - [ ] email/password/name 입력 후 제출 시 BE-03 API 호출 및 성공 시 로그인 화면으로 이동
  - [ ] 중복 email 에러 시 사용자에게 에러 메시지 표시 (BR-03)
  - [ ] 375px 폭에서 레이아웃 깨짐 없이 표시 (반응형 웹 필수 요건, PRD 6장)
- **선행 Task**: FE-02, FE-03, BE-03

### FE-05. 로그인 화면 (UC-02)

- **수행 작업**: `features/login`(LoginForm, api), `pages/login`(LoginPage) — BE-04 연동, 성공 시 authStore에 access_token 저장 후 할일 목록 화면으로 이동.
- **완료 조건**:
  - [ ] 정상 로그인 시 authStore에 access_token 저장 및 목록 화면 이동 확인
  - [ ] 틀린 자격증명 시 에러 메시지 표시
  - [ ] 375px 폭 레이아웃 확인
- **선행 Task**: FE-04, BE-04

### FE-06. entities/todo, entities/category

- **수행 작업**: `entities/todo`(types, todoApi, useTodos 훅, TodoListItem, StatusBadge, computeTodoStatus), `entities/category`(types, categoryApi, useCategories 훅, CategoryBadge/CategorySelect) — BE-06/BE-08 연동.
- **완료 조건**:
  - [ ] `useTodos()`로 목록 데이터를 TanStack Query 캐시로 조회 가능
  - [ ] `useCategories()`로 카테고리 목록 조회 가능
  - [ ] `StatusBadge`가 4개 상태(NOT_STARTED/IN_PROGRESS/DONE/OVERDUE)에 대해 서로 다른 색상/라벨을 표시 (4-wireframe.md 10장 색상 규칙)
- **선행 Task**: FE-02, FE-03, BE-08, BE-06

### FE-07. 할일 등록 화면 (UC-04)

- **수행 작업**: `features/create-todo`(TodoForm, api), `pages/todo-form`(TodoFormPage 등록 모드) — 제목/캘린더(시작일·종료일)/카테고리 선택 UI, BE-07 연동.
- **완료 조건**:
  - [ ] 캘린더 UI로 시작일/종료일 선택 후 등록 성공 시 목록 화면으로 이동 및 목록에 즉시 반영(TanStack Query invalidate)
  - [ ] 종료일 < 시작일 선택 시 클라이언트에서 1차로 제출 차단 또는 서버 에러 메시지 표시 (BR-05)
  - [ ] 카테고리 미선택 시에도 등록 가능하고 "기본"으로 표시됨 (BR-04)
- **선행 Task**: FE-06, BE-07

### FE-08. 할일 목록/필터링 화면 (UC-05, UC-06)

- **수행 작업**: `features/filter-todos`(TodoFilterBar, useTodoFilter), `pages/todo-list`(TodoListPage) — 카테고리별/상태별 필터 UI, 목록 렌더링. BE-08 연동.
- **완료 조건**:
  - [ ] 필터 미적용 시 전체 목록 표시
  - [ ] 카테고리 필터 적용 시 해당 카테고리 항목만 표시
  - [ ] 상태 필터(시작전/진행중/완료/지연) 각각 적용 시 올바른 항목만 표시
  - [ ] 375px 폭에서 필터 UI가 접히거나 스크롤 가능한 형태로 정상 표시
- **선행 Task**: FE-07, BE-08

### FE-09. 할일 편집 화면 (UC-07)

- **수행 작업**: `features/edit-todo`(api), `pages/todo-form`(편집 모드 공유) — 기존 값 프리필, 완료 체크박스, 저장/삭제 버튼. BE-09 연동.
- **완료 조건**:
  - [ ] 목록에서 항목 선택 시 편집 화면에 기존 값이 채워져 표시됨
  - [ ] 수정 저장 시 목록에 즉시 반영
  - [ ] 완료 체크 시 completedAt 반영 결과가 목록 상태 뱃지에 즉시 반영 (BR-07)
- **선행 Task**: FE-08, BE-09

### FE-10. 할일 삭제 확인 UI (UC-08)

- **수행 작업**: `features/delete-todo`(DeleteConfirmModal, api) — 삭제 버튼 클릭 시 확인 모달, 확인 시 BE-10 호출.
- **완료 조건**:
  - [ ] 삭제 버튼 클릭 시 확인 모달이 뜨고, 취소 시 아무 변화 없음
  - [ ] 확인 클릭 시 목록에서 즉시 제거됨
- **선행 Task**: FE-08, BE-10

### FE-11. 반응형 레이아웃 전체 점검

- **수행 작업**: FE-04~FE-10에서 만든 전체 화면을 대상으로 4-wireframe.md 브레이크포인트 기준 데스크톱/모바일 레이아웃 최종 점검 및 CSS 보정.
- **완료 조건**:
  - [ ] 모든 MVP 화면(회원가입/로그인/목록/등록/편집/삭제모달)이 375px, 1024px 이상 두 폭에서 깨짐 없이 표시됨
  - [ ] 별도 네이티브 앱 UI 요소 없이 반응형 웹 단일 코드베이스로 동작 확인 (PRD 6장)
- **선행 Task**: FE-04, FE-05, FE-07, FE-08, FE-09, FE-10

### FE-12. 예외 시나리오 수동 QA

- **수행 작업**: 3-user-scenario.md 4장(access_token 재발급, 소유권 위반, 날짜 유효성 위반, 이메일 중복, 인증 없이 접근) 5개 케이스를 실제 화면에서 수동으로 재현·확인.
- **완료 조건**:
  - [ ] 4.1 access_token 만료 후 자동 재발급으로 작업이 끊기지 않음을 확인
  - [ ] 4.2 타인 Todo 접근 시도가 화면/API 양쪽에서 차단됨을 확인
  - [ ] 4.3 종료일 < 시작일 입력 시 에러가 표시됨을 확인
  - [ ] 4.4 중복 email 가입 시 에러가 표시됨을 확인
  - [ ] 4.5 로그아웃 상태에서 할일 관련 화면 접근 시 로그인 화면으로 리다이렉트됨을 확인
- **선행 Task**: FE-11

### FE-13. (선택, P2) 회원정보 수정 화면 (UC-03)

- **수행 작업**: `pages/profile`(ProfilePage) — name/password 수정 폼. PRD 5장 기준 일정 여유 시에만 착수.
- **완료 조건**:
  - [ ] 본인 name/password 수정 후 저장 시 반영 확인
  - [ ] 미착수 시 이 Task는 PRD 10장 향후 과제로 명시적으로 이월 처리
- **선행 Task**: FE-05 (일정 여유 시에만 진행, MVP 필수 아님)

---

## 4. Task ↔ 요구사항 추적 매트릭스

| Task ID | 관련 UC-ID | 관련 BR-ID |
| --- | --- | --- |
| DB-01, DB-02 | — | BR-04 |
| BE-03 | UC-01 | BR-03, BR-04 |
| BE-04, BE-05 | UC-02 | BR-01 |
| BE-06 | UC-09 | BR-04 |
| BE-07 | UC-04 | BR-01, BR-04, BR-05 |
| BE-08 | UC-05, UC-06 | BR-02, BR-06 |
| BE-09 | UC-07 | BR-02, BR-05, BR-07 |
| BE-10 | UC-08 | BR-02 |
| FE-04 | UC-01 | BR-03 |
| FE-05 | UC-02 | BR-01 |
| FE-06 | UC-05, UC-09 | BR-06 |
| FE-07 | UC-04 | BR-04, BR-05 |
| FE-08 | UC-05, UC-06 | BR-02, BR-06 |
| FE-09 | UC-07 | BR-02, BR-05, BR-07 |
| FE-10 | UC-08 | BR-02 |
| FE-13 | UC-03 | BR-02 |

---

## 5. 실행 순서 요약 (의존성 흐름)

```
DB-01 → DB-02
DB-01 → BE-02 → BE-03 → BE-04 → BE-05 → BE-06 → BE-07 → BE-08 → BE-09 → BE-10 → BE-11 → BE-12
BE-01 → BE-02
FE-01 → FE-02 → FE-04 (+ BE-03)
FE-01 → FE-03
FE-04 → FE-05 (+ BE-04)
FE-05 → FE-06 (+ BE-06, BE-08)
FE-06 → FE-07 (+ BE-07)
FE-07 → FE-08 (+ BE-08) → FE-09 (+ BE-09) / FE-10 (+ BE-10)
FE-08, FE-09, FE-10 → FE-11 → FE-12
(여유 시) FE-05 → FE-13
```
