# TodoList 프로젝트 구조 설계 원칙 (Project Structure Principle)

## 버전 이력

| 버전  | 날짜       | 작성자     | 변경 내용     |
| ----- | ---------- | ---------- | -------------- |
| 0.1.0 | 2026-08-26 | Daniel Kim | 최초 초안 작성 |
| 0.2.0 | 2026-08-26 | Daniel Kim | 프론트엔드 디렉토리 구조를 타입별(api/stores/hooks/components/pages) 구조에서 FSD(Feature-Sliced Design) 구조로 변경 |
| 0.3.0 | 2026-08-26 | Daniel Kim | 마이그레이션 실행 스크립트(migrate.js)/시드 데이터(seed.js)/커넥션 풀 소규모 측정(loadtest.js)을 백엔드 구조에 반영, 4.2·5.4절 트레이드오프 서술 조정 |
| 0.4.0 | 2026-08-27 | Daniel Kim | 실제 구현(BE-01~12)과 정합성 맞춤: 테스트 도구를 Jest/supertest 서술에서 Node 내장 `node:test`로 정정, 커버리지 측정 도구 생략 문구 삭제(실제 `--experimental-test-coverage` 사용), 환경변수 목록에 `NODE_ENV`/`CORS_ORIGIN` 추가, 5.6절(Swagger UI, 개발환경 전용) 신설, `middlewares/auth.js`→`authMiddleware.js` 오탈자 수정, 7장 `utils/`·`tests/` 트리를 실제 파일 목록으로 갱신 |
| 0.5.0 | 2026-08-27 | Daniel Kim | 6장 프론트엔드 구조에 `features/calendar-view`(UC-10) 추가 |
| 0.6.0 | 2026-08-27 | Daniel Kim | 실제 구현과 재정합: 7장에 `userController/userService/userRoutes`(UC-03) 및 `userUpdateApi.test.js` 추가, 6장에 `features/edit-profile`·`shared/lib/{apiError,theme,i18n}` 추가, `profile` 페이지 주석의 "P2 여유시" 문구 정정(구현 완료), 5.1절에 프론트엔드 환경변수(`VITE_API_BASE_URL`) 절 신설 |
| 0.7.0 | 2026-08-28 | Daniel Kim | 5.7절(Vercel 배포, 프론트/백엔드 분리) 신설 — 최초 배포 시 겪은 크로스도메인 쿠키/CORS/SSL/SPA 라우팅/콜드스타트 이슈와 조치를 문서화 |

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

이 항목들은 서비스 레이어 함수 단위 테스트(Node 내장 `node:test`)로 작성하고, UC-01/04/05/07/08의 happy path는 최소 1개씩 API 레벨(`app.listen(0)` + Node 전역 `fetch`) 통합 테스트로 커버한다. 별도 테스트 프레임워크(Jest 등)나 HTTP 테스트 라이브러리(supertest 등)는 도입하지 않는다 — Node 24 내장 기능만으로 충분(BE-01~12 실제 구현 시 확정). 목(mock) 없이 실제 로컬 PostgreSQL에 대한 통합 테스트로 검증한다.

### 4.2 생략하는 것 (2일 일정상 트레이드오프)

- 프론트엔드 컴포넌트 단위 테스트: 생략. 대신 수동 QA로 4장 예외 시나리오(access_token 재발급, 소유권 위반, 날짜 위반, 이메일 중복, 미인증 접근)를 화면에서 직접 확인한다.
- E2E 테스트(Playwright/Cypress 등): 생략.
- 부하 테스트(1,000명 동시접속, API/애플리케이션 레벨 실측): PRD 9·10장에 따라 이번 범위에서 생략, 코드 수준 기본기(인덱스, 커넥션 풀)만 반영. 단, DB 커넥션 풀 자체에 대한 소규모 측정은 DB-05로 수행한다(5.4절 참조) — 1,000명 규모 검증을 대체하지는 않는다.
- UC-06 필터링, UC-09 카테고리 관리는 별도 자동 테스트 없이 수동 QA로 대체(로직이 단순한 쿼리 조건 조합이므로).

---

## 5. 설정/보안/운영 원칙

### 5.1 환경변수

**백엔드** — `.env` 파일(커밋 금지, `.gitignore` 등록)로 관리: `NODE_ENV`(기본 `development`), `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`(예: 15m), `JWT_REFRESH_EXPIRES_IN`(예: 7d), `PORT`, `CORS_ORIGIN`(쉼표구분 허용 origin 목록, 미설정 시 전체 허용으로 폴백).

**프론트엔드** — Vite 규칙에 따라 `VITE_` 접두사 필요. `.env`(커밋 금지)로 관리: `VITE_API_BASE_URL`(백엔드 API 서버 주소, 미설정 시 `shared/api/httpClient.ts`가 `http://localhost:3000`으로 폴백). 값 변경 후에는 개발 서버 재시작이 필요(Vite가 서버 기동 시점에만 `.env`를 읽음).

두 앱 모두 `.env.example`에 키 목록만 값 없이 커밋해 온보딩 참고용으로 둔다. 별도의 설정 관리 서비스(Vault 등)는 도입하지 않는다 — 1인 개발 규모에 과함.

### 5.2 JWT 시크릿

- access_token과 refresh_token은 서로 다른 시크릿 키를 사용한다(하나가 유출돼도 다른 하나는 안전).
- refresh_token은 httpOnly 쿠키로 전달(PRD 7장), access_token은 응답 바디로 전달해 클라이언트가 Authorization 헤더에 담아 요청한다.
- refresh_token은 DB에 저장하지 않는 stateless 방식을 기본으로 하되(2일 일정상 단순화), 로그아웃 시 즉시 무효화가 필요하면 만료시간만으로 대응하고 블랙리스트 테이블은 이번 범위에서 생략한다.

### 5.3 BR-01/BR-02 강제 위치

- **BR-01(인증 필수)**: Express 미들웨어(`middlewares/authMiddleware.js`)에서 access_token 검증 후 `req.user`에 사용자 정보를 주입. Todo/Category 관련 모든 라우트에 이 미들웨어를 공통 적용한다(라우트 정의 단계에서 강제, 컨트롤러마다 재검증하지 않음).
- **BR-02(소유권 검증)**: Service 레이어에서 강제한다. 쿼리 자체에 `WHERE user_id = $1` 조건을 항상 포함시켜, 컨트롤러의 `req.user.id`를 서비스 함수 인자로 넘기는 구조로 소유권 누락을 원천 차단한다. 이중 검증(존재 확인 후 별도 owner 비교)은 하지 않고 쿼리 조건 자체로 해결한다.

### 5.4 DB 커넥션 풀 (1,000명 동시접속 최소 대비)

- `pg.Pool` 사용, 애플리케이션 시작 시 1회 생성 후 재사용(요청마다 커넥션 생성 금지).
- 초기 설정값: `max: 20` 내외(단일 인스턴스 기준, PostgreSQL 기본 `max_connections`을 넘지 않게), `idleTimeoutMillis`, `connectionTimeoutMillis` 기본값 사용.
- 초기값은 실측 없이 산정 불가하므로(PRD 9장 리스크) 기본값(`max: 20`)에서 시작한다. DB-05에서 소규모 동시 연결 측정을 수행해 이 값을 유지/조정하고 근거를 기록한다(측정 스크립트: `backend/src/db/loadtest.js`). 이 측정은 DB 커넥션 풀 단위의 소규모 검증이며, PRD의 1,000명 동시접속 목표에 대한 애플리케이션 레벨 실측(향후 과제, PRD 10장)을 대체하지 않는다.
- **DB-05 측정 결과** (시드 데이터 8건 기준, `todos` 조회 쿼리): 동시 20건 — 평균 203.33ms/최대 228.75ms(풀 커넥션을 처음 여는 비용 포함), 동시 50건 — 평균 7.28ms/최대 11.79ms(이미 열린 커넥션 재사용, 로컬 DB라 지연 거의 없음). `max: 20`으로도 50개 동시 요청이 큐잉되면서도 정상 처리됨을 확인했으므로 현재 값을 유지한다. 실제 원격 DB/1,000명 트래픽에서는 결과가 달라질 수 있어, 배포 환경에서 재측정 후 조정 필요(PRD 10장 향후 과제).
- Todo 조회는 `user_id`, `category_id`, `(start_date, end_date)`에 인덱스를 걸어 목록/필터링(UC-05/06) 성능을 확보한다.

### 5.5 로깅

- 요청 로깅은 별도 라이브러리(morgan 등) 없이 `app.js`의 콘솔 로깅 미들웨어(`[timestamp] METHOD url`)로 최소 구현한다. 에러 로깅도 콘솔(`console.error`)로 충분. 구조화 로깅 시스템(ELK 등) 도입은 이번 범위에서 생략.

### 5.6 API 문서 UI

- `swagger-ui-express`로 `backend/swagger.json`을 `/docs` 경로에 서빙한다. `NODE_ENV=production`일 때는 마운트하지 않음(API 명세를 운영 환경에 공개하지 않기 위함) — `config/env.js`의 `nodeEnv` 값으로 분기.

### 5.7 배포 (Vercel, 프론트/백엔드 분리)

프론트(`todolist-ganadi`)와 백엔드(`todolist-ganadi-backend`)를 **서로 다른 Vercel 프로젝트·도메인**으로 배포한다. 이 구조 때문에 로컬 개발(같은 origin이나 다름없는 `localhost:5173`↔`localhost:3000`)에서는 드러나지 않던 크로스도메인 이슈가 실제 배포에서만 나타났다 — 최초 배포 시 겪은 문제와 조치를 그대로 남겨 재발 방지한다.

**필수 환경변수 체크리스트** (하나라도 누락되면 로그인/세션이 깨짐):

| 프로젝트 | 변수 | 값 | 비고 |
| --- | --- | --- | --- |
| 백엔드 | `NODE_ENV` | `production` | 미설정/오설정 시 SSL 미적용·쿠키 `SameSite=Lax`·`/docs` 노출이 동시에 발생(아래 항목들이 전부 이 값에 분기). `/health` 응답의 `nodeEnv` 필드로 실제 배포본 값을 원격 확인 가능 |
| 백엔드 | `DATABASE_URL` | 클라우드 Postgres(Neon/Supabase 등) 연결 문자열 | 로컬 Postgres는 서버리스 함수가 물리적으로 접근 불가. 최초 배포 시 마이그레이션(`npm run migrate`)을 클라우드 DB에 대해 한 번 더 돌려야 함(로컬에만 돌려놓고 착각하기 쉬움) |
| 백엔드 | `CORS_ORIGIN` | 프론트 배포 도메인(예: `https://todolist-ganadi.vercel.app`) | 미설정 시 5.1절 폴백(전체 허용)으로 동작은 하지만, 명시적으로 좁혀 두는 걸 권장 |
| 백엔드 | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` 등 | 5.1/5.2절과 동일 | |
| 프론트 | `VITE_API_BASE_URL` | 백엔드 배포 도메인 | Vite는 **빌드 시점**에 값을 번들에 굽는다 — 대시보드에 값만 추가하고 재배포(rebuild)를 안 하면 반영 안 됨. 오타(예: `.vercel.app`을 `.vercal.app`로) 나면 조용히 실패하니 저장 직후 `/health`나 실제 로그인으로 검증할 것 |

**코드가 `NODE_ENV=production`에서만 켜는 것들** (`pool.js`/`authController.js`):
- DB 연결에 `ssl: { rejectUnauthorized: false }` — 클라우드 Postgres는 SSL 필수, `pg`는 연결 문자열에 `sslmode`가 없으면 SSL을 안 씀
- `refresh_token` 쿠키를 `sameSite: 'none', secure: true`로 설정 — 프론트/백엔드가 다른 도메인(크로스사이트)이라 `sameSite: 'lax'`(로컬 개발 기본값)로는 새로고침·직접 URL 진입 시 브라우저가 쿠키를 아예 안 보내 세션이 매번 끊김. `SameSite=None`은 CSRF 노출을 넓히지 않는다 — 상태변경 API는 쿠키가 아니라 `Authorization` 헤더(access_token)로 인증하고, `/auth/refresh` 응답은 `CORS_ORIGIN` 화이트리스트 밖에서는 읽을 수 없기 때문

**SPA 라우팅**: `frontend/vercel.json`에 `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}` 필수. 없으면 `/login`, `/todos` 등 직접 URL 진입·새로고침 시 Vercel 정적 호스팅이 404를 반환(React Router가 클라이언트 사이드 라우팅이라 실제 파일이 없음).

**서버리스 콜드스타트 대응**: `pool.js`가 `pool.connect()`/`pool.query()`의 최초 연결 시도만 재시도한다(`db/withRetry.js`, ECONNREFUSED 등 연결 레벨 에러 한정, 최대 3회) — 콜드스타트 직후 DB 커넥션 수립이 간헐적으로 실패하는 문제 대응. 쿼리가 DB에 도달한 뒤의 에러(unique_violation 등)는 재시도하지 않는다(부작용 위험).

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
│   │   └── profile/ui/ProfilePage.tsx          # UC-03
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
│   │   ├── filter-todos/
│   │   │   ├── ui/TodoFilterBar.tsx
│   │   │   └── model/useTodoFilter.ts       # UC-06 (필터 상태)
│   │   ├── calendar-view/
│   │   │   └── ui/TodoCalendarView.tsx      # UC-10, 신규 API 없이 목록 조회 데이터 재사용
│   │   └── edit-profile/
│   │       ├── ui/EditProfileForm.tsx       # UC-03
│   │       └── api/updateProfile.ts         # PATCH /users/me
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
│       ├── ui/Button.tsx, Input.tsx, Modal.tsx, Header.tsx, ProtectedRoute.tsx
│       ├── api/httpClient.ts              # fetch 래퍼, 인증 헤더 부착, 401 시 토큰 재발급 훅
│       └── lib/
│           ├── logger.ts                  # 개발모드 전용 콘솔 로깅
│           ├── apiError.ts                # ApiError 타입/isApiError 가드 (모든 features/api에서 공용)
│           ├── theme.ts                   # 라이트/다크 모드 저장·적용
│           └── i18n/                      # ko/en/ja/zh 번역 사전, LocaleContext(useLocale)
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
│   │   ├── categoryRoutes.js    # UC-09
│   │   └── userRoutes.js        # UC-03 (PATCH /users/me)
│   ├── controllers/               # req/res 처리, 입력 1차 검증
│   │   ├── authController.js
│   │   ├── todoController.js
│   │   ├── categoryController.js
│   │   └── userController.js
│   ├── services/                    # 비즈니스 규칙(BR-01~07) 적용
│   │   ├── authService.js           # 비밀번호 해시, JWT 발급/검증(BR-03)
│   │   ├── todoService.js           # BR-04/05/06/07, 소유권 조건 적용(BR-02)
│   │   ├── categoryService.js       # BR-04 기본 카테고리 자동 생성(프리셋 4종: 기본/업무/개인/학습)
│   │   └── userService.js           # UC-03 name/password 부분 수정
│   ├── db/
│   │   ├── pool.js                   # pg.Pool 단일 인스턴스
│   │   ├── queries/                   # 순수 SQL 실행 함수 (ORM 미사용)
│   │   │   ├── userQueries.js         # updateUser 포함(UC-03)
│   │   │   ├── todoQueries.js
│   │   │   └── categoryQueries.js
│   │   ├── migrations/                # SQL 마이그레이션 파일 (번호순, 프레임워크 없이 직접 관리)
│   │   │   ├── 001_create_users.sql
│   │   │   ├── 002_create_categories.sql
│   │   │   ├── 003_create_todos.sql
│   │   │   └── 004_indexes.sql
│   │   ├── migrate.js                  # migrations/*.sql을 순서대로 적용하는 실행 스크립트 (DB-03)
│   │   ├── seed.js                     # 개발/테스트용 시드 데이터 삽입 스크립트 (DB-04)
│   │   └── loadtest.js                 # 커넥션 풀 소규모 동시 연결 측정 스크립트 (DB-05)
│   ├── middlewares/
│   │   ├── authMiddleware.js          # BR-01 강제 (access_token 검증, req.user 주입)
│   │   └── errorHandler.js            # 표준화된 에러 응답
│   ├── utils/
│   │   ├── computeTodoStatus.js       # 도메인정의서 5장 상태 판별 (단일 출처)
│   │   ├── errors.js                  # AppError 클래스 (statusCode/code/message)
│   │   └── jwt.js                     # access/refresh 토큰 발급·검증 (jsonwebtoken 래핑)
│   ├── config/
│   │   └── env.js                     # 환경변수 로드/검증
│   └── app.js                          # Express 앱 초기화
├── tests/                              # Node 내장 node:test, 엔드포인트/함수 단위로 파일 분리
│   ├── env.test.js, pool.test.js, dbConnectionStartup.test.js   # BE-01/02
│   ├── authService.test.js, authSignup.test.js, authLoginApi.test.js,
│   │   authMiddleware.test.js, authRefreshApi.test.js, jwt.test.js   # BE-03~05
│   ├── categoryListApi.test.js                                       # BE-06
│   ├── computeTodoStatus.test.js, todoCreateApi.test.js,
│   │   todoListApi.test.js, todoUpdateApi.test.js, todoDeleteApi.test.js  # BE-07~10
│   ├── app.test.js, errorHandler.test.js                              # BE-11
│   └── userUpdateApi.test.js                                           # BE-13
├── .env.example
└── package.json
```

- `queries/*.js`가 SQL을 직접 담당하는 유일한 계층이며, 이 밖의 계층에서는 SQL 문자열을 작성하지 않는다.
- 엔티티가 3개뿐이므로 도메인별 파일 1개(route/controller/service/query 각 1개)면 충분하며, 그 이상으로 세분화하지 않는다.
- 마이그레이션은 별도 마이그레이션 프레임워크 없이 순번이 매겨진 `.sql` 파일 + 간단한 실행 스크립트로 충분하다(2일 일정 규모).
