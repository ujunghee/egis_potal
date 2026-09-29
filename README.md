# [기후에너지환경부] 환경융합포털 — HTML 프로토타입

환경융합포털 퍼블리싱(HTML·CSS·JS) 프로토타입입니다.  
`file://`이 아니라 **로컬 서버**(VS Code/Cursor Live Server 등)로 열어 주세요. 조각 HTML을 `fetch`로 불러오기 때문입니다.

개발에 필요한 것은 기본적으로 **HTML과 CSS**입니다. JS는 대부분 참고용이지만, **환경 시각화 도구**와 **AI 검색 결과**는 JS가 화면을 그리므로 해당 문서를 꼭 보세요.

- 최소 지원 폭: **1024px** (`--layout-min-width: 102.4rem`). 그 이하 반응형은 없습니다.
- 기준 단위: `html { font-size: 62.5% }` → `1rem = 10px`

## 바로 보기

| 화면 | 경로 |
|------|------|
| 메인 | [egis/pages/main/index.html](egis/pages/main/index.html) |
| AI 검색 결과 | [egis/pages/search/ai.html](egis/pages/search/ai.html) |
| 환경 시각화 도구 | [egis/pages/visualTool/index.html](egis/pages/visualTool/index.html) |
| 통합검색 | [egis/pages/search/index.html](egis/pages/search/index.html) |
| 환경기초지도 | [egis/pages/map/index.html](egis/pages/map/index.html) |

## 문서 보는 순서

`egis/docs/`를 **위에서 아래 순서**로 보시면 됩니다.

| 순서 | 문서 | 내용 |
|------|------|------|
| 1 | [structure.md](egis/docs/structure.md) | 파일이 어디에 있는지. 껍데기(`index.html`)와 실제 내용(`fragments/`) |
| 2 | [jsp.md](egis/docs/jsp.md) | HTML 붙이는 법, 화면설계서 ↔ 클래스, 화면별 추가 스크립트 |
| 3 | [css.md](egis/docs/css.md) | CSS·폰트 넣는 법, `@import`, 레이어 팝업 공통 구조 |
| 4 | [js.md](egis/docs/js.md) | 화면 동작, 외부 라이브러리. `*-app.js`·`fragment-loader.js`는 프로토타입용 |
| 5 | [toast.md](egis/docs/toast.md) | 토스트 문구. 마크업은 `shared/fragments/toast.html` |

화면별 상세(구조·`data-*`·목업 데이터·개발 연동 지점):

| 문서 | 화면 |
|------|------|
| [main.md](egis/docs/main.md) | 메인 — 히어로 검색, AI 검색 진행 팝업, 인기 검색어, 상세검색 팝업 |
| [ai-search.md](egis/docs/ai-search.md) | AI 검색 결과 — 답변·근거 데이터셋, 관심·최근 본, 질문 조건 수정 팝업 |
| [visual-tool.md](egis/docs/visual-tool.md) | 환경 시각화 도구 — 트리맵·관계도맵·확장맵 (ECharts) |

## 최근 변경

| 영역 | 내용 |
|------|------|
| 메인 | AI 질문 / 통합검색 전환, AI 검색 진행 팝업(4단계), 인기 검색어 토글, 상세검색 팝업(탭·적용된 필터·달력). 검색창 포커스 링은 Tab 진입 시에만 |
| AI 검색 결과 | 신규 페이지. 관심·최근 본 메뉴를 본문 오른쪽 바깥으로 배치, 질문 조건 수정 팝업 |
| 환경 시각화 도구 | 신규 페이지. 트리맵 드릴다운, 관계도맵, 확장맵, 전체화면 |
| 공통 | `fragment-loader.js`가 조각 HTML을 `cache: 'no-cache'`로 불러옴(옛 조각 재사용 방지) |

## 외부 라이브러리 (CDN)

| 라이브러리 | 버전 | 용도 |
|------------|------|------|
| jQuery | 3.7.1 | 기능 JS 전반 |
| flatpickr (+ `l10n/ko.js`) | 4.6.13 | 날짜 선택 |
| ECharts | 6.1.0 | 환경 시각화 도구 차트 |

## 프로토타입 실행 주의

- **조각 HTML에 인라인 `<svg>`를 넣지 마세요.** Live Server는 새로고침용 스크립트를 HTML의 `</body>` · `</head>` · `</svg>` 위치에 끼워 넣습니다. 조각 파일에는 `</body>`가 없어서 `</svg>`에 끼워지는데, 이때 응답 길이가 원본 기준으로 계산돼 **파일 뒷부분이 잘립니다.** (실제로 메인 상세검색의 검색 버튼·적용된 필터가 통째로 사라진 적이 있습니다.)  
  아이콘은 `default/icon.css`의 배경 클래스나 `<img>`로 넣고, 꼭 SVG 요소가 필요하면 JS로 생성합니다(예: `hero-ai-progress.js`의 진행 링).  
  JSP에서는 이 문제가 없습니다. 프로토타입을 Live Server로 볼 때만 해당합니다.
- 화면이 예전 그대로 보이면 **Ctrl+F5**(강력 새로고침)를 먼저 해 보세요.
- `*-app.js`, `fragment-loader.js`, `script-loader.js`는 프로토타입 조립용입니다. JSP에는 넣지 않습니다([jsp.md](egis/docs/jsp.md)).
