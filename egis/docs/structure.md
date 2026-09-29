# EGIS 폴더 구조

소스는 전부 `egis/` 아래입니다.  
**이 문서는 파일이 어디에 있는지**만 적습니다.

- **껍데기** : `index.html`처럼 페이지를 여는 파일. CSS 연결과, 어느 조각을 어디에 넣을지만 있습니다.
- **실제 컨텐츠** : `fragments/` 안 HTML. 화면에 보이는 마크업입니다.

JSP에 붙이는 법 → [jsp.md](./jsp.md) · 동작 → [js.md](./js.md) · CSS 연결 → [css.md](./css.md)  
화면별 상세 → [main.md](./main.md) · [ai-search.md](./ai-search.md) · [visual-tool.md](./visual-tool.md)

```
egis/
├── pages/     화면 (껍데기 + fragments)
├── shared/    공통 헤더·푸터·로더
├── assets/    css / js / image / font
├── docs/      문서
└── scripts/   검증용
```

공통 HTML은 `shared/fragments/` 입니다. 화면 폴더 안에 없습니다.

- 웹 헤더: `shared/fragments/web-header.html`
- 지도 헤더: `shared/fragments/map-header.html`
- 푸터: `shared/fragments/footer.html`
- 토스트: `shared/fragments/toast.html`

---

## 1) 메인화면

1. 폴더명 : `pages/main`
2. 껍데기 : `pages/main/index.html`
   - `<head>` : `flatpickr.min.css`(CDN) → `foundation.css` → `common.css`
   - `<body>` : `web-header.html` → `main-content.html` → `footer.html`
3. 실제 컨텐츠 : `pages/main/fragments/main-content.html` **한 파일**에 전부 있습니다.

### 파일 안 순서

| 순서 | 영역 | 시작 표시 (주석 · 블록 클래스) |
|------|------|-------------------------------|
| 1 | 히어로 + 검색 | `<!-- 히어로 + 검색 -->` · `section.main-hero` |
| 1-1 | 검색 방식 탭 (AI 질문 / 통합검색) | `.main-hero-mode` |
| 1-2 | AI 질문 입력창 | `form.main-hero-ai` (`#main-ai-input`) |
| 1-3 | 통합검색 입력창 | `form.main-hero-search` (`#main-search-input`) |
| 1-4 | 상세검색 버튼 | `.main-hero-detail` |
| 1-5 | 인기 검색어 | `details.main-hero-rank` |
| 1-6 | 추천 질문 | `.main-hero-suggest` |
| 1-7 | 분야 바로가기 (기후관측 ~ 생활환경) | `.main-hero-category` |
| 2 | 주요 서비스 (환경 지도 · 데이터셋 · 환경 시각화 도구 카드, 포털 카드) | `<!-- 주요 서비스 -->` · `section.main-feature` |
| 3 | 최신 데이터 · 도움말 | `<!-- 최신 데이터 · 도움말 -->` · `section.main-bottom` |
| 4 | AI 검색 진행 팝업 | `<!-- AI 검색 진행 팝업 -->` · `dialog#main-ai-overlay` |
| 5 | 상세검색 팝업 | `<!-- 상세검색 모달 -->` · `dialog#main-detail-modal` |
| 5-1 | 검색어 · 기간 · 날짜 | `.main-detail__top` |
| 5-2 | 탭 (분류 · 갱신주기 · 자료유형 · 서비스유형 · 제공기관) | `.main-detail__tabs` |
| 5-3 | 탭 패널 | `[data-md-panel="category\|cycle\|format\|service\|org"]` |
| 5-4 | 적용된 필터 | `.main-detail__applied` |
| 5-5 | 검색 버튼 | `.modal__footer` |

팝업 2개(4, 5)는 `</main>` 뒤에 있지만 **같은 파일**입니다. JSP에 옮길 때 빠뜨리지 마세요.

### 관련 파일

| 종류 | 위치 |
|------|------|
| CSS | `assets/css/uikit/main/main.css` (`common.css`가 불러옴) |
| 레이어 팝업 공통 CSS | `assets/css/component/modal.css` |
| 진입 JS (프로토타입용) | `pages/main/main-app.js` |
| 기능 JS | `assets/js/main/hero-mode.js` — 검색 방식 탭, 추천 질문 |
| | `assets/js/main/hero-ai-progress.js` — AI 검색 진행 팝업 |
| | `assets/js/main/hero-rank.js` — 인기 검색어 |
| | `assets/js/main/detail-search.js` — 상세검색 팝업 |
| 공통 JS | `assets/js/common/header.js`, `datepicjer.js`(날짜 선택) |
| 외부 라이브러리 | jQuery 3.7.1, flatpickr 4.6.13 + `l10n/ko.js` |
| 이미지 (히어로·분야·카드) | `assets/image/main/` |
| 아이콘 (화살표·필터 등) | `assets/image/icon/web/main/` — 클래스는 `default/icon.css`의 `main-*-icon` |

AI 질문을 제출하면 `pages/search/ai.html`(AI 검색 결과)로 이동하고, 통합검색·상세검색은 `pages/search/index.html`로 이동합니다.

## 2) 환경 시각화 도구

1. 폴더명 : `pages/visualTool`
2. 껍데기 : `pages/visualTool/index.html`
   - `<head>` : `foundation.css` → `common.css`
   - `<body>` : `web-header.html` → `main.vt-page` 안에 `breadcrumb.html` · `treeMap.html` → `footer.html`
3. 실제 컨텐츠 : `pages/visualTool/fragments/`
   - `breadcrumb.html` — 제목 「환경 시각화 도구」 + 경로(홈 > 환경 시각화 도구)
   - `treeMap.html` — 도구 본문 전체. **세 가지 맵이 모두 이 파일 안**에 있습니다.

### `treeMap.html` 안 순서

| 순서 | 영역 | 시작 표시 (주석 · 블록 클래스) |
|------|------|-------------------------------|
| 1 | 상단 툴바 | `section.vt-tool` > `.vt-tool__head` |
| 1-1 | 맵 유형 탭 (트리맵 · 관계도맵 · 확장맵) | `.vt-map-tabs` (`[data-vt-tabs]`) |
| 1-2 | 전체화면용 범례 (관계도맵 / 확장맵) | `.vt-relation__node-legend--toolbar`, `.vt-expand__node-legend--toolbar` |
| 1-3 | 데이터 검색 · 전체화면 종료 버튼 | `.vt-tool__head-right` |
| 2 | 트리맵 | `<!-- 트리맵 -->` · `[data-vt-panel="treemap"]` |
| 2-1 | 경로 표시 | `.vt-path` |
| 2-2 | 차트 영역 | `.vt-chart` > `[data-vt-treemap]` |
| 2-3 | 상세 패널 | `aside.vt-tm-detail` |
| 3 | 관계도맵 | `<!-- 관계도맵-->` · `[data-vt-panel="relation"]` |
| 3-1 | 왼쪽 필터 (단계별 확장 · 분류 선택 · 범례) | `aside.vt-relation__side` |
| 3-2 | 그래프 영역 · 확대/축소 버튼 · 팝오버 | `.vt-relation__canvas` |
| 3-3 | 데이터셋 상세 패널 | `aside.vt-relation__detail` |
| 4 | 확장맵 | `<!-- 확장맵 -->` · `[data-vt-panel="expand"]` |
| 4-1 | 범례 · 그래프 영역 · 확대/축소/맞춤 버튼 | `.vt-expand__legend`, `.vt-expand__viewport` |

확장맵의 왼쪽 필터와 상세 패널은 HTML에 없습니다. 페이지가 열릴 때 **JS가 관계도맵(3-1, 3-3)을 복사**해 넣습니다. 그래서 관계도맵 마크업을 지우면 확장맵 필터도 사라집니다.

### 관련 파일

| 종류 | 위치 |
|------|------|
| CSS | `assets/css/uikit/visual-tool/visual-tool.css` (`common.css`가 불러옴) |
| 맵 유형 탭 CSS | `assets/css/component/radio.css` (`radio-toggle-group`) |
| 진입 JS (프로토타입용) | `pages/visualTool/visualTool-app.js` |
| 기능 JS | `assets/js/visual-tool/treemap.js` — 트리맵 |
| | `assets/js/visual-tool/step-cat-sync.js` — 단계 ↔ 분류 선택 체크 연동 |
| | `assets/js/visual-tool/relation-map.js` — 관계도맵 |
| | `assets/js/visual-tool/expand-map.js` — 확장맵 |
| | `assets/js/visual-tool/tabs.js` — 맵 유형 탭, 전체화면 |
| 공통 JS | `assets/js/common/header.js` |
| 외부 라이브러리 | jQuery 3.7.1, **ECharts 6.1.0** (차트는 ECharts가 그려서 JS 없이는 비어 보임) |
| 아이콘 · 범례 이미지 | `assets/image/icon/web/visual-tool/` |

JS는 위 표 순서대로 불러와야 합니다(`treemap` → `step-cat-sync` → `relation-map` → `expand-map` → `tabs`).

진입 경로: GNB 「데이터 탐색 > 환경 시각화 도구」(`shared/fragments/web-header.html`), 메인 주요 서비스 카드.


---

## assets

`egis/assets/` — css · js · image · font.  
CSS 안 구조는 [css.md](./css.md), JS 파일은 [js.md](./js.md)를 보세요.
