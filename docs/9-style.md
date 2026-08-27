# TodoList 프론트엔드 스타일 가이드 (Style Guide)

## 버전 이력

| 버전  | 날짜       | 작성자     | 변경 내용     |
| ----- | ---------- | ---------- | -------------- |
| 0.1.0 | 2026-08-27 | Daniel Kim | 최초 초안 작성 (참고 이미지: 캘린더 앱 스크린샷 분석) |
| 0.2.0 | 2026-08-27 | Daniel Kim | "소프트 파스텔 카드형" 방향으로 팔레트/타이포그래피 교체 (디자인 시안 D안 채택) |

---

## 1. 문서 개요

**목적**: 첨부된 캘린더 앱 스크린샷(미니멀·화이트 베이스의 구글 캘린더 계열 UI)의 시각적 패턴을 분석해, TodoList 프론트엔드(React 19 + TypeScript + FSD)에 적용할 구체적 디자인 토큰과 컴포넌트 스타일을 정의한다.

**관련 문서**: 화면 구성/레이아웃은 `4-wireframe.md`를 따르고, 특히 10.2절(상태 뱃지 색상 규칙: 시작전=회색/진행중=파랑/완료=초록/지연=빨강)과 10.5절(반응형 브레이크포인트: 데스크톱 ≥1024px, 모바일 <768px)을 그대로 승계한다. 이 문서는 그 규칙에 **정확한 색상값·타이포그래피·간격·컴포넌트 스펙**을 부여하는 역할만 한다.

**참고 이미지 분석 요약**: 흰 배경 위 옅은 회색 그리드 라인, 절제된 색상 사용(포인트 컬러는 파랑=오늘 강조/초록=이벤트뱃지 정도로 최소화), 사이드바의 라운드 필 버튼과 체크박스형 캘린더 목록, 둥근 모서리와 원형 "오늘" 표시, 넉넉한 여백, 산세리프 폰트.

---

## 2. 컬러 팔레트

**0.2.0 변경**: 디자인 시안(A. 기존 유지 / B. 볼드 칸반 / C. 조밀한 테이블형 / D. 소프트 파스텔 카드형) 중 D안을 채택해 팔레트를 교체했다. 아래 값이 최신이며, 상태 뱃지 색상 매핑 원칙(4-wireframe.md 10.2절)은 그대로 승계한다.

### 2.1 브랜드/상태 색상 (4-wireframe.md 10.2절과 매핑)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--color-primary` | `#7C6FE0` | 주요 액션 버튼, 링크, 진행중 상태 (라벤더) |
| `--color-primary-hover` | `#5F51CC` | primary 버튼 hover |
| `--color-primary-bg` | `#EEEBFB` | primary 연한 배경(선택된 필터, 진행중 뱃지 배경 등) |
| `--color-success` | `#4FA989` | 완료 상태(DONE), 성공 토스트 (민트) |
| `--color-success-bg` | `#E4F3EC` | 완료 뱃지 배경 |
| `--color-danger` | `#E8896A` | 지연 상태(OVERDUE), 삭제 버튼, 에러 메시지 (피치) |
| `--color-danger-bg` | `#FBEAE2` | 지연 뱃지 배경 |
| `--color-warning` | `#F29900` | (예비) 경고성 알림 — 이번 MVP에서 필수 사용처 없음 |
| `--color-neutral` | `#8A8394` | 시작전(NOT_STARTED) 상태, 보조 텍스트 |
| `--color-neutral-bg` | `#F1EDF7` | 시작전 뱃지 배경, 카테고리 뱃지 배경(10.3절) |

### 2.2 기본 UI 색상

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--color-bg` | `#FBF6F0` | 페이지 배경 (웜 크림) |
| `--color-bg-subtle` | `#F5EFE7` | 보조 영역 배경 |
| `--color-surface` | `#FFFFFF` | 카드/모달 표면 |
| `--color-border` | `#EAE4F0` | 인풋/카드 테두리 |
| `--color-border-subtle` | `#F0EBE4` | 옅은 구분선 |
| `--color-text-primary` | `#3F3A45` | 본문/헤딩 텍스트 |
| `--color-text-secondary` | `#8A8394` | 보조 텍스트, 라벨, placeholder |
| `--color-text-on-primary` | `#FFFFFF` | primary/성공/위험 배경 위 텍스트 |

**상태 뱃지 색상 최종 매핑** (도메인정의서 5장 상태 판별 로직은 재정의하지 않음):

| 상태 | 텍스트 색상 | 배경 색상 |
| --- | --- | --- |
| 시작 전 (NOT_STARTED) | `--color-neutral` | `--color-neutral-bg` |
| 진행중 (IN_PROGRESS) | `--color-primary` | `--color-primary-bg` |
| 완료 (DONE) | `--color-success` | `--color-success-bg` |
| 지연 (OVERDUE) | `--color-danger` | `--color-danger-bg` |

색상만으로 구분하지 않고 텍스트 라벨을 항상 함께 표시한다(wireframe 10.2절 원칙 유지).

---

## 3. 타이포그래피

D안 채택으로 본문은 Nunito Sans(웹폰트), 헤딩/로고는 Fraunces(세리프 디스플레이 서체)를 사용해 따뜻하고 친근한 톤을 낸다. 두 폰트 모두 Google Fonts에서 로드(`index.html`에 `<link>` 추가, 별도 라이브러리 설치 없음).

```css
--font-family: "Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, "Noto Sans KR", Helvetica, Arial, sans-serif;
--font-family-display: "Fraunces", Georgia, "Noto Serif KR", serif;
```

`--font-family-display`는 헤더 로고 등 소수의 헤딩 요소에만 사용하고(3장 3절 규칙과 동일하게 남용하지 않음), 본문/폼/뱃지 등 나머지 전체는 `--font-family`를 그대로 사용한다.

| 토큰 | 크기 | 굵기 | 용도 |
| --- | --- | --- | --- |
| `--font-size-title` | 22px | 500 | 페이지 타이틀(예: "TodoList", "새 할일 등록") |
| `--font-size-heading` | 16px | 500 | 카드 제목, 섹션 헤딩 |
| `--font-size-body` | 14px | 400 | 본문, 목록 항목, 폼 라벨 |
| `--font-size-caption` | 12px | 400 | 뱃지 텍스트, 보조 설명, 타임스탬프 |
| `--line-height-base` | 1.5 | — | 본문 기본 |

---

## 4. 간격/반경/그림자

이미지의 넉넉한 여백과 둥근 모서리를 8px 그리드로 정형화한다.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;

--radius-sm: 6px;   /* 인풋, 카테고리 뱃지 */
--radius-md: 14px;  /* 카드, 모달, 버튼 */
--radius-full: 999px; /* 상태 뱃지·필터 버튼(필 형태) */

--shadow-card: 0 4px 14px rgba(124,111,224,0.10);
--shadow-modal: 0 8px 24px rgba(63,58,69,0.16);
```

---

## 5. 컴포넌트 스타일

### 5.1 버튼

| 종류 | 배경 | 텍스트 | 테두리 | 용도 |
| --- | --- | --- | --- | --- |
| Primary | `--color-primary` | `--color-text-on-primary` | 없음 | 저장/등록/로그인 등 주 액션 |
| Secondary (Outline) | 투명 | `--color-primary` | 1px `--color-primary` | 취소, 보조 액션(이미지의 "+ 만들기" 버튼 스타일) |
| Danger | `--color-danger` | `--color-text-on-primary` | 없음 | 삭제 확정 |
| Ghost | 투명 | `--color-text-secondary` | 없음 | 아이콘 버튼(검색/설정 등) |

공통: `border-radius: var(--radius-md)`, 높이 40px(데스크톱)/44px(모바일, 터치 타깃 확보), hover 시 배경 8% 어둡게.

### 5.2 상태 뱃지 / 카테고리 뱃지

- 상태 뱃지: `border-radius: var(--radius-full)`(필 형태, 이미지의 이벤트 뱃지처럼), `padding: 2px 10px`, `font-size: var(--font-size-caption)`, 2절 매핑 색상 사용.
- 카테고리 뱃지: `border-radius: var(--radius-sm)`, `--color-neutral-bg` 배경 + `--color-text-secondary` 텍스트로 상태 뱃지와 명확히 구분(wireframe 10.3절).

### 5.3 카드 (할일 목록 항목, 폼 컨테이너)

- `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-md)`, `box-shadow: var(--shadow-card)`, `padding: var(--space-4)`.
- 목록 항목 hover 시 `background: var(--color-bg-subtle)`로 미세 강조(이미지의 그리드 셀 hover 패턴 참고).

### 5.4 입력 필드

- `border: 1px solid var(--color-border)`, `border-radius: var(--radius-sm)`, `padding: var(--space-2) var(--space-3)`, focus 시 `border-color: var(--color-primary)` + `box-shadow: 0 0 0 2px var(--color-primary-bg)`.
- 날짜 선택(시작일/종료일)은 네이티브 `<input type="date">` 사용(wireframe 6장 참조, 별도 캘린더 라이브러리 도입 안 함 — YAGNI).

### 5.5 헤더/네비게이션

- 높이 56~64px, `background: var(--color-bg)`, 하단 `1px solid var(--color-border-subtle)`.
- 좌측 로고 + 타이틀, 우측 텍스트 링크(내 정보/로그아웃) — 이미지의 상단바처럼 아이콘 나열이 아닌 텍스트 링크로 충분(MVP 범위상 검색/설정 아이콘 불필요).
- 모바일: 우측 메뉴를 햄버거 아이콘으로 축소(wireframe 10.1절 유지).

### 5.6 오늘/강조 표시 (참고용, 목록 UI에는 직접 대응 요소 없음)

이미지의 원형 "오늘" 날짜 강조(`--color-primary` 배경 + 흰 텍스트, `border-radius: var(--radius-full)`) 패턴은 캘린더 그리드 전용이며, TodoList MVP에는 캘린더 그리드 뷰가 없으므로 직접 재사용처는 없다. 다만 동일한 톤(파랑 원형 강조)을 **"진행중" 상태 뱃지**와 **선택된 필터 버튼**(예: 카테고리 필터에서 활성 항목)에 적용해 전체 톤을 일관되게 유지한다.

---

## 6. 반응형

`4-wireframe.md` 10.5절 그대로: 데스크톱 ≥1024px(콘텐츠 최대 폭 960px 중앙 정렬), 모바일 <768px(전체 폭, 필터 드롭다운화, 버튼 세로 스택). 768~1024px 사이는 모바일 레이아웃을 기본으로 하되 좌우 여백만 넉넉히 준다.

---

## 7. 명시적으로 가져오지 않는 것 (스코프 아웃)

- 다크 모드: PRD/도메인정의서에 요구사항 없음, 이번 범위 제외.
- 애니메이션/트랜지션 라이브러리: hover/focus 정도의 CSS transition(150ms ease)만 사용, Framer Motion 등 도입 안 함.
- 아이콘 라이브러리: MVP 화면 수가 적어(5개 내외) SVG 직접 인라인 또는 최소 아이콘 세트로 충분, 별도 아이콘 패키지 설치는 실제 화면 구현 시 필요성이 드러나면 그때 판단(YAGNI).
- 커스텀 폰트 로딩: 시스템 폰트 스택으로 대체(3장), 웹폰트 성능 비용 회피.
