# 화면별 기능 JS

JS는 **참고용**입니다. HTML·CSS만 붙여도 화면은 나옵니다.  
`*-app.js`는 프로토타입에서 JS를 나눠 불러오려고 둔 목록 파일이라 **무시하셔도 됩니다.**  
`fragment-loader.js`도 프로토타입 전용입니다. 조각 HTML을 브라우저에서 붙여 주는 역할이라 JSP에는 넣지 않습니다.  
실제로 보시면 되는 것은 아래 표의 기능 JS입니다.  
파일 위치는 [structure.md](./structure.md), HTML 붙이는 법은 [jsp.md](./jsp.md).

---

## 동적인 것

HTML에는 화면이 이미 그려져 있습니다. JS는 보여 주고 숨기고, 바꿔 줍니다.

| 이런 동작 | 의미 |
|-----------|------|
| 탭·아코디언 | 클릭한 영역만 열고 나머지 닫기 |
| 필터·검색 | 조건에 맞게 목록을 다시 그리기 (프로토타입은 샘플 데이터) |
| 모달·팝업 | HTML에 있는 창을 켰다 끄기 |
| 토스트 | 짧은 안내 문구 ([toast.md](./toast.md)) |
| 지도 패널 | 좌측 메뉴 클릭 시 패널 전환, 레이어 on/off |

`data-*` 는 JS가 찾는 표시입니다. 지우면 동작이 끊깁니다.

---

## 공통

폴더: `assets/js/common/`

| 동작 | 파일 |
|------|------|
| GNB·통합검색 레이어·마이페이지 메뉴 | `header.js` |
| 로그인/로그아웃 표시 (프로토타입) | `prototype-auth.js` |
| 푸터 관련사이트 | `footer.js` |
| 토스트 | `toast.js` + 마크업 `shared/fragments/toast.html` |
| 확인 팝업 | `confirm-dialog.js` |
| 복사 | `clipboard.js` |
| 검색 필터 | `search-filter.js` |
| 날짜 선택 | `datepicjer.js` |

---

## 화면별

### 메인

정적. `pages/main/main-app.js` → `header.js`만.

### 통합검색 — `assets/js/search/`

| 화면 | JS | 동적인 것 |
|------|-----|-----------|
| 결과 전체 | `search-app.js` → `search-head.js`, `results.js` | 검색어·건수, 탭별 목록 |
| 데이터셋 | `dataset-app.js` → `dataset.js`, `listing.js` | 필터, 카드/리스트, 페이지네이션 |
| Open API | `openapi-app.js` | 위와 같음 |
| FAQ 탭 | `faq-app.js` → `user-support/faq.js` | 질문 열고 닫기 |
| 문의 탭 | `inquiry-app.js` | 필터·목록 |

### 주제별 지도 — `assets/js/topical/`

| 화면 | JS | 동적인 것 |
|------|-----|-----------|
| 목록 | `topical-app.js` → `page.js` 등 | 필터, 핀, 관심 모달, 최근 본 |
| 상세 | `topical-detail-app.js` | 스티키 바, 다운로드 팝업 |

### 환경기초지도 — `assets/js/map/`

진입: `pages/map/map-app.js`. 엔진 초기화는 `map.js`.

| 영역 | JS | 동적인 것 |
|------|-----|-----------|
| 헤더 주소검색 | `map-header-search.js`, `address-search.js` | 검색 결과 |
| 좌측 메뉴 | `navigation.js` | 패널 열기 |
| 통합검색 | `integrated-search.js` 등 | 트리, 필터, 레이어 |
| 행정구역 | `region-select.js` | 시·군·구 |
| 공간검색 | `spatial-search-*.js` | 그리기, 결과 |
| 반경검색 | `radius-search-popup.js` | 팝업 |
| 도엽검색 | `map-sheet-search.js` | 결과 |
| 선택 레이어 | `selected-layer-panel.js` | 표시·삭제·투명도 |
| 배경지도 | `background-map-panel.js` | 기본/위성 |
| 줌·측량 | `control-panel.js` | 컨트롤 |

개발에서 받을 이벤트:

| 이벤트 | 의미 |
|--------|------|
| `map-header-search:submit` | 주소검색 요청 |
| `integrated-search:filter-change` | 필터 변경 |
| `integrated-search:filter-reset` | 필터 초기화 |
| `spatial-search:search` | GeoJSON 공간검색 |
| `selected-layer-item:opacity` | 레이어 투명도 |

### 데이터 개방

| 화면 | JS | 동적인 것 |
|------|-----|-----------|
| Open API 목록 | `assets/js/data-open/open-api/` (`open-api-app.js`) | 필터·핀·관심 |
| Open API 상세 | `open-api-detail-app.js` | 스티키, 다운로드, URL 복사 |
| 개발계정 신청 | `apply.js` | 폼 |
| 국가토지피복 | `assets/js/data-open/land-cover/` | 탭, 지역·연도, 차트, 표 |

AI 데이터셋은 정적입니다.

### 이용자 지원 — `assets/js/user-support/`

진입: `pages/userSupport/user-support-app.js`

| 화면 | JS | 동적인 것 |
|------|-----|-----------|
| 공지 목록·상세 | 없음 | 정적 |
| 문의 목록 | `inquiry.js` | 필터 |
| 문의 등록 | `inquiry-write.js` | 필수값, 첨부, 토스트 |
| FAQ | `faq.js` | 질문 열고 닫기 |

### 마이페이지 — `assets/js/mypage/`

왼쪽 메뉴: `lnb.js`

| 화면 | JS | 동적인 것 |
|------|-----|-----------|
| 관심 데이터 | `favorites.js` | 탭, 카드/리스트 |
| Open API 신청 현황 | `openapi/list.js` | 목록·상태 |
| 개발계정 상세 | `openapi/detail.js` | 상세 |
| 개발계정 수정 | `openapi/edit.js` | 폼 |
| 운영계정 신청 | `openapi/prod-apply.js` | 폼 |
| 운영계정 신청 상세 (완료) | `openapi/prod-detail.js` | 인증키 보기·복사 |
| 운영계정 신청 상세 (심사중) | `openapi/prod-detail.js` | 위와 같음. HTML은 `prod-detail-review.html` |
| 운영계정 신청 상세 (반려) | `openapi/prod-detail.js` | 위와 같음. HTML은 `prod-detail-rejected.html` |
| 나의 문의 | `inquiry/list.js` | 필터·목록 |
| 나의 문의 상세 | `inquiry/detail.js` | 상세 |
| 인증키 | `authkey/list.js` | 보기·복사·재발급 |
| 다운로드 내역 | `download/list.js` | 탭·기간 필터 |
| 선택 영역 보기 | `download/area-modal.js` | 팝업 |

### 로그인

`assets/js/login/page.js` — 로그인 방식 선택, 정부 통합인증 안내 팝업(프로토타입). 실제 인증은 개발에서 붙입니다.
