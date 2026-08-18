# EGIS 폴더 구조

소스는 전부 `egis/` 아래입니다.  
**이 문서는 파일이 어디에 있는지**만 적습니다.

- **껍데기** : `index.html`처럼 페이지를 여는 파일. CSS 연결과, 어느 조각을 어디에 넣을지만 있습니다.
- **실제 컨텐츠** : `fragments/` 안 HTML. 화면에 보이는 마크업입니다.

JSP에 붙이는 법 → [jsp.md](./jsp.md) · 동작 → [js.md](./js.md) · CSS 연결 → [css.md](./css.md)

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
3. 실제 컨텐츠 : `pages/main/fragments/main-content.html`

## 2) 환경기초지도

1. 폴더명 : `pages/map`
2. 껍데기 : `pages/map/index.html`
3. 실제 컨텐츠 : `pages/map/fragments/`
   - `map-navigation.html` — 좌측 메뉴
   - `result-panel.html` — 결과 패널 (안에 `integrated-search-filter.html`, `map-sheet-search.html`)
   - `map-toolbar.html` — 행정구역
   - `radius-search.html` — 반경검색
   - `spatial-search.html` — 공간검색
   - `spatial-search-results.html` — 공간검색 결과
   - `map-controls.html` — 줌·측량
   - `selected-layer.html` — 선택 레이어
   - `background-map.html` — 배경지도

헤더: `shared/fragments/map-header.html`

## 3) 주제별 지도

**목록**

1. 폴더명 : `pages/topicalMap`
2. 껍데기 : `pages/topicalMap/index.html`
3. 실제 컨텐츠 : `pages/topicalMap/fragments/` — `breadcrumb.html`, `filter-panel.html`, `search-bar.html`, `pinned.html`, `results.html`, `quick-menu.html`, `favorite-modal.html`

**상세**

1. 폴더명 : `pages/topicalMap`
2. 껍데기 : `pages/topicalMap/detail.html`
3. 실제 컨텐츠 : `pages/topicalMap/fragments/` — `detail-sticky.html`, `detail-hero.html`, `detail-body.html`, `download-modal.html`

## 4) 데이터 개방

**Open API 목록**

1. 폴더명 : `pages/data-open/open-api`
2. 껍데기 : `pages/data-open/open-api/index.html`
3. 실제 컨텐츠 : `fragments/breadcrumb.html`, `fragments/list/` (`filter-panel`, `search-bar`, `pinned`, `results`, `quick-menu`, `favorite-modal`)

**Open API 상세**

1. 폴더명 : `pages/data-open/open-api`
2. 껍데기 : `pages/data-open/open-api/detail.html`
3. 실제 컨텐츠 : `fragments/detail/` — `detail-sticky.html`, `detail-hero.html`, `detail-body.html`, `download-modal.html`

**Open API 개발계정 신청**

1. 폴더명 : `pages/data-open/open-api`
2. 껍데기 : `pages/data-open/open-api/apply.html`
3. 실제 컨텐츠 : `fragments/apply/form.html`

**국가토지피복 통계**

1. 폴더명 : `pages/data-open/land-cover`
2. 껍데기 : `pages/data-open/land-cover/index.html`
3. 실제 컨텐츠 : `fragments/breadcrumb.html`, `content.html` (안에 `tabs.html`, `panel-cover.html`, `panel-green.html`, `table-section.html`)

**AI 데이터셋**

1. 폴더명 : `pages/data-open/ai-dataset`
2. 껍데기 : `pages/data-open/ai-dataset/index.html`
3. 실제 컨텐츠 : `fragments/breadcrumb.html`, `content.html`

## 5) 이용자 지원

**공지사항 목록**

1. 폴더명 : `pages/userSupport`
2. 껍데기 : `pages/userSupport/index.html`
3. 실제 컨텐츠 : `fragments/notice/breadcrumb.html`, `board.html`

**공지사항 상세**

1. 폴더명 : `pages/userSupport`
2. 껍데기 : `pages/userSupport/notice-detail.html`
3. 실제 컨텐츠 : `fragments/notice/detail-body.html`

**FAQ**

1. 폴더명 : `pages/userSupport`
2. 껍데기 : `pages/userSupport/faq.html`
3. 실제 컨텐츠 : `fragments/faq/breadcrumb.html`, `list.html`

**문의하기 목록**

1. 폴더명 : `pages/userSupport`
2. 껍데기 : `pages/userSupport/inquiry.html`
3. 실제 컨텐츠 : `fragments/inquiry/breadcrumb.html`, `board.html`

**문의하기 상세**

1. 폴더명 : `pages/userSupport`
2. 껍데기 : `pages/userSupport/inquiry-detail.html`
3. 실제 컨텐츠 : `fragments/inquiry/detail-breadcrumb.html`, `detail-body.html`

**문의하기 등록**

1. 폴더명 : `pages/userSupport`
2. 껍데기 : `pages/userSupport/inquiry-write.html`
3. 실제 컨텐츠 : `fragments/inquiry/write-breadcrumb.html`, `write-body.html`

## 6) 통합검색

1. 폴더명 : `pages/search`
2. 껍데기 : `index.html` / `dataset.html` / `openapi.html` / `faq.html` / `inquiry.html`
3. 실제 컨텐츠 : `fragments/` — `search-bar.html`, `tabs.html`, 탭별 `*-results.html` · `*-filter.html`, `applied-filter.html`

## 7) 로그인

1. 폴더명 : `pages/login`
2. 껍데기 : `pages/login/index.html`
3. 실제 컨텐츠 : `fragments/breadcrumb.html`, `login-form.html`, `anyid-modal.html`

## 8) 마이페이지

왼쪽 메뉴 공통: `pages/mypage/fragments/lnb.html`

| 화면 | 껍데기 | 실제 컨텐츠 |
|------|--------|-------------|
| 관심 데이터 | `mypage/index.html` | `fragments/content.html` |
| 다운로드 내역 | `mypage/download/index.html` | `fragments/list.html`, `area-modal.html` |
| Open API 신청 현황 | `mypage/openapi/index.html` | `fragments/list.html` |
| 개발계정 상세 | `mypage/openapi/detail.html` | `fragments/detail.html` |
| 개발계정 수정 | `mypage/openapi/edit.html` | `fragments/edit.html` |
| 운영계정 신청 | `mypage/openapi/prod-apply.html` | `fragments/prod-apply.html` |
| 운영계정 신청 상세 (완료) | `mypage/openapi/prod-detail.html` | `fragments/prod-detail.html` |
| 운영계정 신청 상세 (심사중) | `mypage/openapi/prod-detail-review.html` | `fragments/prod-detail-review.html` |
| 운영계정 신청 상세 (반려) | `mypage/openapi/prod-detail-rejected.html` | `fragments/prod-detail-rejected.html` |
| 인증키 발급 현황 | `mypage/authkey/index.html` | `fragments/list.html` |
| 나의 문의 | `mypage/inquiry/index.html` | `fragments/list.html` |
| 나의 문의 상세 | `mypage/inquiry/detail.html` | `fragments/detail.html` |

운영계정 신청 상세는 완료·심사중·반려가 **각각 HTML**입니다. `?status=`로 한 파일을 바꾸지 않습니다.

---

## assets

`egis/assets/` — css · js · image · font.  
CSS 안 구조는 [css.md](./css.md), JS 파일은 [js.md](./js.md)를 보세요.
