# TodoList 프로젝트 구조 설계 원칙 (Project Structure Principle)

## 버전 이력

| 버전  | 날짜       | 작성자     | 변경 내용     |
| ----- | ---------- | ---------- | -------------- |
| 0.1.0 | 2026-08-26 | Daniel Kim | 최초 초안 작성 |
| 0.2.0 | 2026-08-26 | Daniel Kim | 프론트엔드 디렉토리 구조를 타입별(api/stores/hooks/components/pages) 구조에서 FSD(Feature-Sliced Design) 구조로 변경 |

---

## 0. 문서 개요

**목적**: `1-domain-definition.md`(v0.4.0), `2-PRD.md`(v0.2.0), `3-user-scenario.md`, `4-wireframe.md`에서 정한 도메인·요구사항·화면을 실제 코드로 옮길 때 따르는 구조 원칙을 정의한다.

**전제**: 1인 개발, 2일 내 MVP 완성. 이 문서의 모든 원칙은 "빠르게 만들되 도메인 규칙(BR-01~07)은 깨지지 않게"를 최우선으로 한다. 과도한 레이어링·추상화·범용화는 전부 지양한다.

---

## 1. 최상위 원칙

1. **단순성 우선(YAGNI)**: 지금 필요한 기능만 만든다. "나중에 필요할 것 같은" 확장 포인트(플러그인 구조, 범용 어댑터, 미사용 설정 옵션)는 만들지 않는다.
2. **도메인 용어 일관성**: 도메인정의서 2장 Ubiquitous Language를 코드 전 영역(변수명, 함수명, DB 컬럼명, API 필드명, UI 라벨)에 동일하게 사용한다. 번역·의역 없이 그대로 매핑한다 (3장 매핑표 참조).
3. **단일 출처 원칙**: 비즈니스 규칙(BR-ID)·상태 판별 로직(도메인정의서 5장)은 코드 내 한 곳에만 구현하고 여러 레이어에 중복 구현하지 않는다.
4. **필요할 때 분리**: 파일/모듈은 실제로 재사용되거나 한 파일이 너무 커질 때만 나눈다. 처음부터 폴더를 잘게 쪼개지 않는다.
5. **2일 예산 의식**: 매 구현 결정에서 "이걸 지금 안 하면 MVP가 실패하는가?"를 기준으로 판단한다. 아니라면 PRD 10장 향후 과제로 미룬다.

---

## 2. 의존성/레이어 원칙

### 2.1 프론트엔드: FSD(Feature-Sliced Design) 레이어 + UI-상태-API 원칙

레이어 구성은 6장 참조. 규모(엔티티 3개, 화면 5개)에 맞춰 `widgets` 레이어는 생략하고 `app / pages / features / entities / shared` 5계층만 사용한다.

| 레이어 | 책임 |
| --- | --- |
| app | 앱 초기화, 라우터, 전역 Provider(QueryClient 등) |
| pages | 라우트 단위 화면 조합(4-wireframe.md 화면과 1:1). 자체 로직은 최소화하고 features/entities를 배치만 한다 |
| features | 사용자 행동(동사) 단위 — 로그인, 할일 등록/수정/삭제, 필터링 등 |
| entities | 도메인 모델(User/Todo/Category) 단위 — 타입, 조회 API, 목록 아이템 UI, 상태 계산 로직 |
| shared | 특정 도메인에 속하지 않는 공통 UI(Button 등)·http 클라이언트·유틸 |

- **임포트 방향은 위에서 아래로만 허용**한다: `app → pages → features → entities → shared`. 하위 레이어가 상위 레이어를 참조하지 않는다(예: `entities/todo`가 `features/edit-todo`를 import 금지).
- 레이어 내부의 각 슬라이스(기능/엔티티 폴더)는 필요한 세그먼트(`ui/`, `model/`, `api/`)만 만든다. 세그먼트가 1개 파일뿐이면 폴더 없이 파일 하나로 둔다(빈 폴더 금지).
- "상태-API" 책임 분리는 레이어와 별개로 그대로 유지한다: 서버 데이터(Todo/Category 등)는 TanStack Query 캐시가 단일 출처이며 Zustand에 복제 저장하지 않는다. Zustand는 access_token/로그인 여부처럼 클라이언트 소유 상태만 다룬다(대개 `entities/user`의 `model/`에 위치).
- 컴포넌트에서 fetch를 직접 호출하지 않고 각 슬라이스의 `api/*` 함수를 통해서만 호출한다. 별도의 "서비스 레이어", "리포지토리 패턴" 등은 도입하지 않는다.

### 2.2 백엔드: 라우트 - 컨트롤러 - (서비스+쿼리) 실용 3계층

과도한 레이어링 금지. 클래식한 Controller-Service-Repository-Entity 4계층 대신 아래처럼 축소한다.

| 레이어 | 책임 | 비고 |
| --- | --- | --- |
| Route | URL·HTTP 메서드 매핑, 인증 미들웨어 연결 | `routes/*.js` |
| Controller | req/res 처리, 입력 검증 호출, 컨트롤러에서 서비스 함수 호출 후 응답 포맷 | `controllers/*.js` |
| Service | 비즈니스 규칙(BR-01~07) 적용, 여러 쿼리 조합, 트랜잭션 경계 | `services/*.js` |
| Query | 순수 SQL 실행 함수 (pg) | `db/queries/*.js` |

- Service와 Query를 억지로 더 쪼개지 않는다(예: Repository 인터페이스, DTO 클래스 등 도입 금지).
- 엔티티가 3개(User/Category/Todo)뿐이므로 도메인별 파일 1개씩(`todoService.js`, `todoQueries.js` 등)이면 충분하다. 공통 로직(상태 계산 등)만 별도 유틸로 분리한다.
- 컨트롤러가 SQL을 직접 작성하지 않는다(테스트/변경 용이성을 위한 최소 경계). 이 경계 하나만 지키면 나머지는 자유롭게 실용적으로 합칠 수 있다.

---

## 3. 코드/네이밍 원칙

### 3.1 공통 컨벤션

- 파일명: 프론트/백 모두 `camelCase.js`(또는 `.tsx`), 컴포넌트 파일만 `PascalCase.tsx`.
- 함수명:동사+명사 (`createTodo`, `getTodosByUser`, `computeTodoStatus`).
- 변수명: 도메인 용어를 그대로 camelCase화 (`isDone`, `startDate`, `endDate`, `categoryId`).
- DB 컬럼명: snake_case (`is_done`, `start_date`, `end_date`, `category_id`, `created_at`) — PostgreSQL 관례를 따르고, API 응답에서 camelCase로 변환한다(변환은 컨트롤러 또는 쿼리 결과 매핑 지점 한 곳에서만 수행).
- 상수/ENUM 값: 도메인정의서 5장 상태 값은 코드 전역에서 동일한 문자열 상수로 관리한다 (`NOT_STARTED`, `IN_PROGRESS`, `DONE`, `OVERDUE`).

### 3.2 도메인 용어 매핑표

| 도메인 용어(한글) | 도메인 용어(영문, 도메인정의서 기준) | 코드 식별자 |
| --- | --- | --- |
| 사용자 | User | `User`, `user`, `userId` |
| 할일 | Todo | `Todo`, `todo`, `todoId` |
| 카테고리 | Category | `Category`, `category`, `categoryId` |
| 상태 | Status | `status` (계산값, DB 미저장) |
| 시작일자 | Start Date | `startDate` / DB `start_date` |
| 종료일자 | End Date | `endDate` / DB `end_date` |
| 완료 여부 | Is Done | `isDone` / DB `is_done` |
| 완료일시 | Completed At | `completedAt` / DB `completed_at` |
| 지연 | Overdue | `OVERDUE` |
| 시작 전 | Not Started | `NOT_STARTED` |
| 진행중 | In Progress | `IN_PROGRESS` |
| 완료 | Done | `DONE` |

- "할일"을 `Task`, `Item` 등 다른 단어로 바꿔 쓰지 않는다. "카테고리"를 `Tag`, `Group`으로 바꿔 쓰지 않는다.

---

## 4. 테스트/품질 원칙 (2일 일정 트레이드오프)

**전략**: 전체 커버리지 목표(예: 80%)는 세우지 않는다. 대신 도메인정의서 7.1절 수용 기준(AC)을 백엔드 핵심 로직에 대한 최소 테스트 케이스로 그대로 사용한다.

### 4.1 반드시 테스트하는 것

- **상태 판별 로직(5장, BR-06)**: `computeTodoStatus()` 단위 테스트 — 완료/지연/진행중/시작전 4가지 케이스 + "완료된 건은 종료일이 지나도 완료로 표시" 케이스(5장 우선순위 규칙).
- **BR-05 (startDate <= endDate) 검증**: 등록/수정 시 위반 케이스가 거부되는지.
- **BR-02 (소유권 검증)**: 타인 소유 Todo 접근 시 거부되는지(수정/삭제/조회 각 1건).
- **BR-04 (기본 카테고리 자동 지정)**: 카테고리 미지정 등록 시 '기본'으로 지정되는지.
- **BR-07 (completedAt 기록/초기화)**: 완료 처리/취소 시 값 반영.
- **BR-03 (email 유일성)**: 중복 가입 거부.

이 항목들은 서비스 레이어 함수 단위 테스트(예: Jest)로 작성하고, UC-01/04/05/07/08의 happy path는 최소 1개씩 API 레벨(supertest 등) 통합 테스트로 커버한다.

### 4.2 생략하는 것 (2일 일정상 트레이드오프)

- 프론트엔드 컴포넌트 단위 테스트: 생략. 대신 수동 QA로 4장 예외 시나리오(access_token 재발급, 소유권 위반, 날짜 위반, 이메일 중복, 미인증 접근)를 화면에서 직접 확인한다.
- E2E 테스트(Playwright/Cypress 등): 생략.
- 부하 테스트(1,000명 동시접속 실측): PRD 9·10장에 따라 이번 범위에서 생략, 코드 수준 기본기(인덱스, 커넥션 풀)만 반영.
- 커버리지 수치 측정 도구 설정: 생략.
- UC-06 필터링, UC-09 카테고리 관리는 별도 자동 테스트 없이 수동 QA로 대체(로직이 단순한 쿼리 조건 조합이므로).

---

## 5. 설정/보안/운영 원칙

### 5.1 환경변수

- `.env` 파일(커밋 금지, `.gitignore` 등록)로 관리: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`(예: 15m), `JWT_REFRESH_EXPIRES_IN`(예: 7d), `PORT`.
- `.env.example`에 키 목록만 값 없이 커밋해 온보딩 참고용으로 둔다.
- 별도의 설정 관리 서비스(Vault 등)는 도입하지 않는다 — 1인 개발 규모에 과함.

### 5.2 JWT 시크릿

- access_token과 refresh_token은 서로 다른 시크릿 키를 사용한다(하나가 유출돼도 다른 하나는 안전).
- refresh_token은 httpOnly 쿠키로 전달(PRD 7장), access_token은 응답 바디로 전달해 클라이언트가 Authorization 헤더에 담아 요청한다.
- refresh_token은 DB에 저장하지 않는 stateless 방식을 기본으로 하되(2일 일정상 단순화), 로그아웃 시 즉시 무효화가 필요하면 만료시간만으로 대응하고 블랙리스트 테이블은 이번 범위에서 생략한다.

### 5.3 BR-01/BR-02 강제 위치

- **BR-01(인증 필수)**: Express 미들웨어(`middlewares/auth.js`)에서 access_token 검증 후 `req.user`에 사용자 정보를 주입. Todo/Category 관련 모든 라우트에 이 미들웨어를 공통 적용한다(라우트 정의 단계에서 강제, 컨트롤러마다 재검증하지 않음).
- **BR-02(소유권 검증)**: Service 레이어에서 강제한다. 쿼리 자체에 `WHERE user_id = $1` 조건을 항상 포함시켜, 컨트롤러의 `req.user.id`를 서비스 함수 인자로 넘기는 구조로 소유권 누락을 원천 차단한다. 이중 검증(존재 확인 후 별도 owner 비교)은 하지 않고 쿼리 조건 자체로 해결한다.

### 5.4 DB 커넥션 풀 (1,000명 동시접속 최소 대비)

- `pg.Pool` 사용, 애플리케이션 시작 시 1회 생성 후 재사용(요청마다 커넥션 생성 금지).
- 초기 설정값: `max: 20` 내외(단일 인스턴스 기준, PostgreSQL 기본 `max_connections`을 넘지 않게), `idleTimeoutMillis`, `connectionTimeoutMillis` 기본값 사용.
- 정확한 튜닝값은 부하 테스트 없이 산정 불가하므로(PRD 9장 리스크) 기본값에서 시작하고, 이후 실측 후 조정한다.
- Todo 조회는 `user_id`, `category_id`, `(start_date, end_date)`에 인덱스를 걸어 목록/필터링(UC-05/06) 성능을 확보한다.

### 5.5 로깅

- 최소한의 요청 로깅(morgan 등)과 에러 로깅(콘솔 또는 간단한 파일)만 적용한다. 구조화 로깅 시스템(ELK 등) 도입은 이번 범위에서 생략.

---

## 6. 프론트엔드 디렉토리 구조 (FSD)

```
frontend/
├── src/
│   ├── app/                          # 앱 초기화
│   │   ├── router.tsx
│   │   ├── providers.tsx             # QueryClientProvider 등
│   │   └── main.tsx
│   │
│   ├── pages/                         # 화면 단위 (4-wireframe.md 화면과 1:1)
│   │   ├── sign-up/ui/SignUpPage.tsx           # UC-01
│   │   ├── login/ui/LoginPage.tsx              # UC-02
│   │   ├── todo-list/ui/TodoListPage.tsx       # UC-05/06
│   │   ├── todo-form/ui/TodoFormPage.tsx       # UC-04/07 (등록/편집 폼 재사용)
│   │   └── profile/ui/ProfilePage.tsx          # UC-03 (P2, 여유 시)
│   │
│   ├── features/                       # 사용자 행동 단위
│   │   ├── sign-up/
│   │   │   ├── ui/SignUpForm.tsx
│   │   │   └── api/signUp.ts               # UC-01, BR-03
│   │   ├── login/
│   │   │   ├── ui/LoginForm.tsx
│   │   │   └── api/login.ts                 # UC-02
│   │   ├── create-todo/
│   │   │   ├── ui/TodoForm.tsx              # 등록/편집 겸용
│   │   │   └── api/createTodo.ts            # UC-04, BR-05
│   │   ├── edit-todo/
│   │   │   └── api/updateTodo.ts            # UC-07, BR-05/07
│   │   ├── delete-todo/
│   │   │   ├── ui/DeleteConfirmModal.tsx
│   │   │   └── api/deleteTodo.ts            # UC-08
│   │   └── filter-todos/
│   │       ├── ui/TodoFilterBar.tsx
│   │       └── model/useTodoFilter.ts       # UC-06 (필터 상태)
│   │
│   ├── entities/                        # 도메인 모델 단위
│   │   ├── user/
│   │   │   ├── model/types.ts             # User
│   │   │   └── model/authStore.ts          # Zustand: access_token, 로그인 여부
│   │   ├── todo/
│   │   │   ├── model/types.ts              # Todo, Status
│   │   │   ├── model/computeTodoStatus.ts  # 도메인정의서 5장 상태 판별
│   │   │   ├── api/todoApi.ts              # 조회 fetch 함수
│   │   │   ├── api/useTodos.ts             # TanStack Query 훅
│   │   │   └── ui/TodoListItem.tsx, StatusBadge.tsx
│   │   └── category/
│   │       ├── model/types.ts              # Category
│   │       ├── api/categoryApi.ts, useCategories.ts   # UC-09
│   │       └── ui/CategoryBadge.tsx, CategorySelect.tsx
│   │
│   └── shared/                           # 도메인 무관 공통
│       ├── ui/Button.tsx, Input.tsx, Modal.tsx, Header.tsx
│       ├── api/httpClient.ts              # fetch 래퍼, 인증 헤더 부착, 401 시 토큰 재발급 훅
│       └── lib/
│
├── index.html
└── package.json
```

- 임포트 방향은 2.1절 규칙(`app → pages → features → entities → shared`)을 따른다. `entities/todo`는 `features/*`를 import할 수 없다.
- 규모상 `widgets` 레이어는 두지 않는다. 화면 조합이 필요하면 `pages`에서 `features`/`entities` 컴포넌트를 바로 배치한다.
- 슬라이스 내부 세그먼트(`ui/model/api`)는 필요한 것만 만든다 — 파일이 하나뿐이면 폴더 없이 슬라이스 루트에 바로 둔다(예: `features/login/LoginForm.tsx`).
- 상태 계산 로직(도메인정의서 5장)은 서버 응답을 그대로 신뢰하는 것을 기본으로 하되, 필요 시 `entities/todo/model/computeTodoStatus.ts`에 동일 로직을 프론트에도 둘 수 있다(단, 서버 로직과 100% 동일하게 유지, 중복 구현 시 4장 테스트 대상에 포함).

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── routes/                  # URL-핸들러 매핑 + 인증 미들웨어 연결
│   │   ├── authRoutes.js        # UC-01/02, 토큰 재발급
│   │   ├── todoRoutes.js        # UC-04/05/06/07/08
│   │   └── categoryRoutes.js    # UC-09
│   ├── controllers/               # req/res 처리, 입력 1차 검증
│   │   ├── authController.js
│   │   ├── todoController.js
│   │   └── categoryController.js
│   ├── services/                    # 비즈니스 규칙(BR-01~07) 적용
│   │   ├── authService.js           # 비밀번호 해시, JWT 발급/검증(BR-03)
│   │   ├── todoService.js           # BR-04/05/06/07, 소유권 조건 적용(BR-02)
│   │   └── categoryService.js       # BR-04 기본 카테고리 자동 생성
│   ├── db/
│   │   ├── pool.js                   # pg.Pool 단일 인스턴스
│   │   ├── queries/                   # 순수 SQL 실행 함수 (ORM 미사용)
│   │   │   ├── userQueries.js
│   │   │   ├── todoQueries.js
│   │   │   └── categoryQueries.js
│   │   └── migrations/                # SQL 마이그레이션 파일 (예: node-pg-migrate 또는 직접 관리)
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_categories.sql
│   │       └── 003_create_todos.sql
│   ├── middlewares/
│   │   ├── authMiddleware.js          # BR-01 강제 (access_token 검증, req.user 주입)
│   │   └── errorHandler.js            # 표준화된 에러 응답
│   ├── utils/
│   │   ├── computeTodoStatus.js       # 도메인정의서 5장 상태 판별 (단일 출처)
│   │   └── validators.js              # BR-05 등 입력 검증 함수
│   ├── config/
│   │   └── env.js                     # 환경변수 로드/검증
│   └── app.js                          # Express 앱 초기화
├── tests/
│   ├── todoService.test.js             # 4장 필수 테스트 케이스
│   └── todo.integration.test.js
├── .env.example
└── package.json
```

- `queries/*.js`가 SQL을 직접 담당하는 유일한 계층이며, 이 밖의 계층에서는 SQL 문자열을 작성하지 않는다.
- 엔티티가 3개뿐이므로 도메인별 파일 1개(route/controller/service/query 각 1개)면 충분하며, 그 이상으로 세분화하지 않는다.
- 마이그레이션은 별도 마이그레이션 프레임워크 없이 순번이 매겨진 `.sql` 파일 + 간단한 실행 스크립트로 충분하다(2일 일정 규모).
