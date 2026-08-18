# JSP에 HTML 붙이는 법

파일 목록은 [structure.md](./structure.md), CSS 연결은 [css.md](./css.md), 동작은 [js.md](./js.md)를 보세요.

## HTML

파일 여러 개를 맞춰 붙이지 않아도 됩니다. **브라우저에 뜬 화면이 완성본**입니다.

1. Live Server로 해당 `index.html`(또는 `detail.html`)을 연다
2. `F12` → Elements → `<body>` 안 마크업을 복사한다
3. JSP에 붙인다. 실제로 쓰실 것은 **fragment HTML**과 `assets/js/` 안 기능 파일입니다.  
   `*-app.js`는 프로토타입에서 파일을 나눠 불러오려고 둔 것이라 **넣지 않으셔도 됩니다.** `fragment-loader.js`도 같습니다.

`index.html`이 비어 보이는 건 조각을 불러오기 전이라서입니다.

공통 토스트 HTML은 `shared/fragments/toast.html`입니다. 헤더·푸터처럼 **레이아웃 body 끝에 한 번** 넣습니다. 문구는 [toast.md](./toast.md)를 보세요.

`fragment-loader.js`는 프로토타입 전용입니다. `data-fragment="파일경로"` 자리에 조각 HTML을 붙여 브라우저에서 화면을 보여 줍니다. JSP는 `jsp:include`로 같은 일을 하므로 **이 파일은 넣지 않습니다.** `script-loader.js`, `*-app.js`도 같습니다.

## 화면설계서 → 클래스

클래스명은 바꾸지 마세요. HTML 파일은 [structure.md](./structure.md).

| 설계서 | 대표 클래스 |
|--------|-------------|
| 헤더 (3–4) | `gov-masthead`, `header` / 푸터 `footer` / 토스트 `toast-stack` |
| 메인 (5–8) | `main-hero`, `main-hero-search`, `main-feature-card` |
| 통합검색 (9–18) | `search-hero`, `search-tabs`, `search-listing`, `search-filter`, `faq-item` |
| 주제별 지도 목록 (19–27) | `tp-layout`, `search-filter` |
| 주제별 지도 상세 (28–45) | `tp-detail`, `tp-detail__hero` |
| 환경기초지도 (46–58) | `map-header`, `map-navigation`, `result-panel`, `region-select`, `radius-search-popup`, `selected-layer-panel`, `background-map-panel`, `map-control` |
| Open API 목록 (60) | `tp-layout`, `search-filter` |
| Open API 상세 (61–66) | `tp-detail`, `oa-detail` |
| 국가토지피복 (67–70) | `land-cover`, `land-cover__tab` |
| 공지 (72–73) | `notice-board` |
| 문의 등록 (76–77) | `inquiry-write`, `inquiry-write__card` |
| FAQ | `faq-list`, `faq-item` |
| 마이페이지 (78–97) | `mypage`, `mypage__lnb`, `mypage__tab`, `oa-mypage`, `oa-prod-detail`, `ak-mypage`, `dl-mypage` |
| 로그인 | `breadcrumb`, `login__card`, `login__method`, `login-anyid` |

`css`와 `font`는 **같은 상위 폴더**에 두고, 새 CSS는 `<link>`를 늘리지 말고 `@import`로만 추가합니다. 방법은 [css.md](./css.md)에 있습니다. 클래스·연결을 바꾸면 스타일이 빠집니다. 