# 메인화면

통합 메인(`pages/main/`)의 구조와 동작, 개발 연동 지점입니다.  
파일 위치 전체는 [structure.md](./structure.md), CSS 연결은 [css.md](./css.md)를 보세요.

| 구분 | 경로 |
|------|------|
| 껍데기 | `pages/main/index.html` |
| 실제 컨텐츠 | `pages/main/fragments/main-content.html` (팝업 2개 포함) |
| CSS | `assets/css/uikit/main/main.css` (`common.css`에 포함) |
| JS | `assets/js/main/` — `hero-mode.js`, `hero-ai-progress.js`, `hero-rank.js`, `detail-search.js` |
| 외부 라이브러리 | jQuery 3.7.1, flatpickr 4.6.13 + `l10n/ko.js` (상세검색 날짜) |

`index.html` `<head>`에는 `flatpickr.min.css`가 `foundation.css` 앞에 한 줄 더 있습니다.

---

## 1. 화면 구성

`main-content.html` 안 순서 그대로입니다.

| 영역 | 블록 클래스 | 설명 |
|------|-------------|------|
| 히어로·검색 | `main-hero` | AI 질문 / 통합검색 전환, 상세검색 버튼, 인기 검색어, 추천 질문, 분야 바로가기 |
| 주요 서비스 | `main-feature` | 환경 지도·데이터셋·환경 시각화 도구 카드 + 포털 카드 |
| 최신 데이터·도움말 | `main-bottom` | 최신 데이터 목록, 도움말 카드 |
| AI 검색 진행 팝업 | `dialog#main-ai-overlay` | AI 질문 제출 시 4단계 진행 표시 |
| 상세검색 팝업 | `dialog#main-detail-modal` | 키워드·기간·분류 필터 |

팝업 두 개는 `</main>` 뒤, 같은 fragment 안에 있습니다. JSP에서도 메인 본문과 함께 넣습니다.

---

## 2. 히어로 검색 — `hero-mode.js`

| 요소 | 선택자 | 동작 |
|------|--------|------|
| 모드 탭 | `.main-hero-mode[role="tablist"]`, `[data-hero-mode="ai"\|"search"]` | 클릭·방향키로 전환, 슬라이드 배경(`.main-hero-mode__thumb`) 이동 |
| 패널 | `[data-hero-panel="ai"\|"search"]` | 활성 패널만 `is-active` |
| AI 입력 | `#main-ai-input` (form `[data-main-ai-form]`) | 제출을 JS가 가로채 진행 팝업 → AI 결과 페이지. form `action`은 JS가 꺼졌을 때의 대비용 |
| 통합검색 입력 | `#main-search-input` | `../search/index.html?q=` 로 GET |
| 추천 질문 | `[data-ai-suggest-q="질문"]` | AI 입력칸에 채우고 AI 모드로 전환 |

**포커스 링**: 두 검색창의 파란 링은 **키보드 Tab으로 들어왔을 때만** 보입니다. JS가 검색창 박스(`.main-hero-ai`, `.main-hero-search`)에 `is-tab-focus` 클래스를 붙이고, CSS는 이 클래스만 봅니다. 텍스트 입력은 마우스 클릭에도 `:focus-visible`이 걸리기 때문입니다.

---

## 3. AI 검색 진행 팝업 — `hero-ai-progress.js`

AI 질문을 제출하면 `#main-ai-overlay`를 `showModal()`로 띄우고 단계를 진행한 뒤 AI 결과 페이지로 이동합니다.

| 단계 | 제목 | 시간(ms) |
|------|------|----------|
| 1 | 질문의 의도를 분석하고 있어요 | 2800 |
| 2 | 관련 데이터를 찾고 있어요 | 2800 |
| 3 | 분석에 적합한 데이터를 선별하고 있어요 | 2800 |
| 4 | 검색 결과를 바탕으로 답변을 만들고 있어요 | 2800 |
| 5 | AI 검색이 완료되었어요 | 1400 |

- 완료 후 이동: `../search/ai.html?q={질문}`
- 중지: 「검색 중지」(`[data-main-ai-progress-stop]`) 또는 Esc → 팝업 닫기, 타이머 정리
- 진행 상태: `[data-main-ai-progress][data-active-step="1~5"]`, 각 단계 `[data-step]` 안 `[data-node-shell]`에 `is-loading` / `is-ring-full`
- 스피너 링 SVG는 **JS가 생성**합니다(`RING_SVG`). fragment에 인라인 `<svg>`를 두지 않은 이유는 [README](../../README.md#프로토타입-실행-주의)를 보세요.

**개발 연동**: 프로토타입은 고정 시간으로 단계를 넘깁니다. 실제 AI 응답 진행률(스트리밍 등)에 맞춰 `data-active-step`을 바꾸고, 응답이 오면 결과 페이지로 이동하면 됩니다. `prefers-reduced-motion`이면 애니메이션 없이 완료 단계만 보여 줍니다.

---

## 4. 인기 검색어 — `hero-rank.js`

`<details class="main-hero-rank">` 네이티브 토글입니다.

- 닫힘: `summary.main-hero-rank__toggle` (198×54, 1위 검색어 + 화살표 `main-arrow-down-icon`)
- 열림: `.main-hero-rank__card` — 10개 목록, 각 항목은 `../search/index.html?q=` 링크
- 닫기: 카드 제목 버튼, 바깥 클릭, Esc

**개발 연동**: 목록 `<li>`와 토글의 1위 검색어를 서버 데이터로 렌더링합니다.

---

## 5. 상세검색 팝업 — `detail-search.js`

「상세검색」 버튼(`[data-main-detail-open]`)으로 `#main-detail-modal`을 엽니다. 배경·레이어는 공통 `dialog.modal-container`(`component/modal.css`)입니다.

### 5.1 구성

| 영역 | 요소 | 비고 |
|------|------|------|
| 검색 | `#md-keyword` (`name="q"`) | |
| 기간 | `#md-period` (`name="period"`) + `#md-start` / `#md-end` | 프리셋 `1w`·`1m`·`3m`·`6m`·`1y`·`custom` |
| 탭 | `[data-md-tab="category\|cycle\|format\|service\|org"]` | 분류·갱신주기·자료유형·서비스유형·제공기관 |
| 탭 패널 | `[data-md-panel="…"]` | 활성 탭만 표시 |
| 분류 | 대분류 `name="category"` → 중분류 그룹 `[data-md-group="md-cat-*"]` (`name="subcategory"`) | 대분류를 체크해야 해당 중분류가 보임. 해제하면 중분류도 해제 |
| 적용된 필터 | `[data-md-applied]` | 체크가 하나라도 있으면 표시. 칩 X로 개별 해제, 「초기화」로 전체 해제 |
| 검색 | `button[type=submit]` | |

### 5.2 기간·날짜

- 프리셋을 고르면 오늘 기준으로 시작·종료일을 채웁니다.
- 날짜를 직접 바꾸면 기간이 `custom`(직접 설정)으로 바뀝니다.
- 시작일 ≤ 종료일이 되도록 서로 `minDate`/`maxDate`를 묶습니다.
- 달력은 `window.initPicker()`(`common/datepicjer.js`)로 만들고, dialog 안에 붙여 입력칸 아래(공간 없으면 위)에 놓습니다.

### 5.3 제출 파라미터

`GET ../search/index.html` — 빈 `q`·`period`·`start`·`end`는 전송하지 않습니다.

| 파라미터 | 값 예 |
|----------|-------|
| `q` | 검색어 |
| `period` | `3m` |
| `start`, `end` | `2026-06-29` |
| `category` | `nature`, `water`, `carbon`, `energy` (복수) |
| `subcategory` | `ecosystem`, `water-quality` … (복수) |
| `cycle` | `occasional`, `realtime`, `daily` … (복수) |
| `format` | `csv` … (복수) |
| `service` | `wms`, `wfs`, `download` … (복수) |
| `org` | `me`, `keco` … (복수) |

### 5.4 닫기

X 버튼, 배경 클릭, Esc. 달력이 열려 있으면 Esc는 달력만 닫습니다.

---

## 6. 개발 연동 체크리스트

| 할 일 | 위치 |
|-------|------|
| 인기 검색어 10개 | `main-hero-rank__list`, 토글 1위 |
| 추천 질문 | `[data-ai-suggest-q]` 칩 |
| 상세검색 체크 항목(분류·기관 등) | `data-md-panel` 안 체크박스 `value` |
| 상세검색 결과 수신 | 통합검색 페이지에서 위 파라미터 해석 |
| AI 진행 단계 | `hero-ai-progress.js`의 `runProgress()` 타이머를 실제 응답 진행으로 교체 |
| 최신 데이터 목록 | `main-bottom` 목록 |
