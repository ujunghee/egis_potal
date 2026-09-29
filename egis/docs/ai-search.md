# AI 검색 결과

메인에서 AI 질문을 하면 도착하는 페이지(`pages/search/ai.html`)입니다.  
메인 쪽 진행 팝업은 [main.md](./main.md#3-ai-검색-진행-팝업--hero-ai-progressjs)를 보세요.

| 구분 | 경로 |
|------|------|
| 껍데기 | `pages/search/ai.html` |
| 실제 컨텐츠 | `pages/search/fragments/` — `ai-breadcrumb.html`, `quick-menu.html`, `ai-results.html`, `favorite-modal.html`, `ai-condition-modal.html` |
| CSS | `assets/css/uikit/search/ai-search.css` (+ 카드·빠른 메뉴는 `topical/topical.css`, `search/search.css`) |
| JS | `assets/js/search/ai-results.js`, `ai-condition.js` (+ 공통 `listing.js`, `quick-nav.js`, `favorites-recent.js`, `common/dataset-card.js`) |
| 외부 라이브러리 | jQuery 3.7.1, flatpickr 4.6.13 + `l10n/ko.js` (조건 수정 기간) |

`ai.html` `<head>`에는 `flatpickr.min.css`가 `foundation.css` 앞에 한 줄 더 있습니다.

---

## 1. 화면 구성

```
main.search-ai-page
└── .search-ai-column (1024px, 가운데)
    ├── 브레드크럼  「AI 검색 결과」
    └── .search-ai-shell.tp-layout (relative)
        ├── 관심·최근 본 빠른 메뉴 (.tp-quick-wrap) ← 본문 오른쪽 바깥 24px에 뜸
        └── .search-ai
            ├── 질문 말풍선 (오른쪽 정렬)
            ├── 답변 (요약·본문·제공기관/추천 기준/답변 범위)
            ├── 더 알고 싶으신 게 있으신가요? (추천 질문 버튼)
            ├── 답변 근거 데이터셋 N개 (카드형/리스트형, 페이지네이션)
            └── 하단 고정 입력창 (AI가 이해한 질문 조건 + 추가 질문)
```

- 빠른 메뉴는 통합검색 dataset 탭과 같은 공통 컴포넌트입니다. `position: absolute` + `translateX(100% + 24px)`로 본문 밖에 두고, 스크롤하면 `quick-nav.js`가 `is-fixed`로 고정합니다.
- 1440px 이하에서는 `main`에 오른쪽 여백을 줘서 빠른 메뉴가 화면 안에 들어오게 합니다.

---

## 2. URL 파라미터

| 파라미터 | 의미 | 없을 때 |
|----------|------|---------|
| `q` | 사용자 질문 | `태양광 발전량 분석에 필요한 데이터는?` |
| `purpose`, `purposeText` | 분석 목적 (직접 입력이면 `purpose=custom` + `purposeText`) | AI 추출값 |
| `topic`, `topicText` | 핵심 주제 (위와 같음) | AI 추천값 |
| `sido`, `sigungu` | 대상 지역. `sido=` 빈 값이면 전국 | 제주특별자치도 / 제주시 |
| `period` | `1w`·`1m`·`3m`·`6m`·`1y`·`custom`, 빈 값이면 전체 | 전체 |
| `start`, `end` | `YYYY-MM-DD` | 없음 |

조건 파라미터가 하나라도 있으면 조건 수정 팝업과 하단 조건 칩이 그 값으로 채워집니다.

---

## 3. 답변·데이터셋 — `ai-results.js`

프로토타입은 **목업 데이터**를 그립니다. 개발에서는 아래 두 상수를 API 응답으로 바꾸면 됩니다.

### 3.1 `MOCK_ANSWER`

| 필드 | 그리는 곳 |
|------|-----------|
| `lead` | `[data-ai-answer-lead]` |
| `body[]` | `[data-ai-answer-body]` (문단마다 `<p>`) |
| `provider` / `criteria` / `scope` | `[data-ai-meta-provider]` / `-criteria]` / `-scope]` |
| `followups[]` | `[data-ai-followup-list]` — 클릭하면 하단 입력창에 문구를 채움 |
| `conditions[]` `{ label, value }` | `[data-ai-conditions]` 칩 (URL 조건이 있으면 `ai-condition.js`가 다시 그림) |

### 3.2 `DATASET_ITEMS`

`{ id, tags[], title, date, provider, format, views }` 배열입니다.  
`SearchListing.init('[data-ai-dataset-list]', DATASET_ITEMS, { quickMenu: true })`로 카드를 그리며, 카드형/리스트형 전환·관심(북마크)·최근 본 기록은 통합검색 공통 로직(`listing.js`, `favorites-recent.js`)을 그대로 씁니다.

- 최근 본 목록: `sessionStorage['egis-search-recent-ids']`
- 건수: `[data-ai-dataset-count]`

### 3.3 하단 입력창

`form[data-ai-composer-form]` → `GET ./ai.html?q=` (빈 값이면 제출 막고 포커스). 메인과 달리 진행 팝업 없이 바로 이동합니다.

---

## 4. 질문 조건 수정 팝업 — `ai-condition.js`

하단 「조건 수정」(`transparent-button-40`, `[data-ai-cond-open]`)으로 `dialog#ai-cond-modal`을 엽니다. 배경·레이어는 메인 상세검색과 같은 `dialog.modal-container`입니다. 폭 700px, 본문이 길면 헤더·하단 버튼은 고정되고 본문만 스크롤됩니다.

### 4.1 구성

| 영역 | 요소 | 동작 |
|------|------|------|
| 분석 목적 | `input[name="purpose"]` 카드 5개 + `#ai-cond-purpose-custom` | 「직접 입력」 선택 시 입력칸 표시·포커스. 빈 채로 적용하면 막음 |
| 핵심 주제 | `input[name="topic"]` 카드 5개 + `#ai-cond-topic-custom` | 위와 같음 |
| 대상 지역 | `#ai-cond-sido` → `#ai-cond-sigungu` | 시·도 바꾸면 시군구 목록 교체. 전국이면 시군구 비활성 |
| 기간 | `#ai-cond-period` + `#ai-cond-start` / `#ai-cond-end` | 메인 상세검색과 같은 규칙(프리셋 → 날짜 채움, 날짜 수정 → 직접 설정) |

라디오 카드는 `radio-basic radio-basic-sm`을 그대로 쓰고, 카드 안에서만 선택 시 24px·흰 점 10px로 바뀝니다(`.ai-cond__option`).

### 4.2 버튼

| 버튼 | 동작 |
|------|------|
| 초기화 (`[data-ai-cond-reset]`) | **AI가 처음 추출한 값**(마크업의 `checked`/`selected`)으로 복원 |
| 취소 · X · 배경 클릭 · Esc | 팝업을 **열기 전 상태**로 복원하고 닫기. 달력이 열려 있으면 Esc는 달력만 닫음 |
| 조건 적용 후 다시 검색 (submit) | 현재 `q` + 조건을 붙여 `GET ./ai.html` |

### 4.3 개발 연동

| 할 일 | 위치 |
|-------|------|
| AI가 추출·추천한 선택지 | 두 라디오 목록. **처음 선택된 값이 "AI 기본값"**(초기화 기준)이므로 `checked`를 AI 결과에 맞춰 렌더링 |
| 시군구 데이터 | `SIGUNGU` 객체(목업, 일부 시·도만) → 행정구역 API |
| 조건 재검색 | 위 URL 파라미터를 받아 AI 재질의 |
| 조건 칩 문구 | `renderConditions()` — 기간은 `기간 미지정` / `최근 3개월` / `YYYY-MM-DD ~ YYYY-MM-DD` |

---

## 5. 개발 연동 체크리스트

| 할 일 | 위치 |
|-------|------|
| 질문 표시 | `[data-ai-query-bubble]` (`q`) |
| 답변·메타·추천 질문 | `MOCK_ANSWER` → API |
| 근거 데이터셋 | `DATASET_ITEMS` → API, 페이지당 개수 `#ai-page-size` |
| 페이지네이션 | `.pagination` (현재 1페이지 고정 마크업) |
| 관심 등록 | `favorites-recent.js`의 관심 Set → 서버 저장 |
| 조건 수정 | 4.3 참고 |
