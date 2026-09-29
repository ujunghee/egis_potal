# 환경 시각화 도구

분류 체계(대분류 → 중분류 → 소분류 → 데이터셋)를 세 가지 맵으로 보여 주는 화면입니다.  
진입: GNB 「데이터 탐색 > 환경 시각화 도구」, 메인 주요 서비스 카드.

| 구분 | 경로 |
|------|------|
| 껍데기 | `pages/visualTool/index.html` (`main.vt-page`) |
| 실제 컨텐츠 | `pages/visualTool/fragments/breadcrumb.html`, `treeMap.html` (세 맵 전부 이 파일 안) |
| CSS | `assets/css/uikit/visual-tool/visual-tool.css` (`common.css`에 포함) |
| JS | `assets/js/visual-tool/` — `treemap.js`, `step-cat-sync.js`, `relation-map.js`, `expand-map.js`, `tabs.js` |
| 아이콘·범례 | `assets/image/icon/web/visual-tool/*.svg` |
| 외부 라이브러리 | jQuery 3.7.1, **ECharts 6.1.0** (`https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js`) |

다른 화면과 달리 **차트는 JS가 없으면 그려지지 않습니다.** HTML에는 틀(탭·필터·상세 패널·버튼)만 있고, 캔버스 영역은 ECharts가 채웁니다.

---

## 1. 스크립트 순서

`visualTool-app.js`의 로드 순서를 지켜야 합니다.

```
jquery → echarts → header.js
→ treemap.js → step-cat-sync.js → relation-map.js → expand-map.js → tabs.js
```

- `step-cat-sync.js`는 관계도맵·확장맵이 쓰는 함수(`window.syncVtCatTreeFromStep`)를 먼저 등록합니다.
- `expand-map.js`는 관계도맵 패널의 필터·상세 마크업을 **복제**해 쓰므로 `relation-map.js` 뒤에 둡니다.
- `tabs.js`는 세 맵의 공개 API(`window.Vt*`)를 호출하므로 마지막입니다.

---

## 2. 화면 구성 (`treeMap.html`)

```
section.vt-tool
├── .vt-tool__head
│   ├── 맵 유형 탭  [data-vt-tabs]  radio name="vt-map-type"  (treemap | relation | expand)
│   ├── 전체화면일 때만 보이는 범례 (관계도맵용 / 확장맵용)
│   ├── 데이터 검색 [data-vt-relation-search]   ← 관계도맵·확장맵에서만 표시
│   └── 전체화면 종료 [data-vt-fullscreen-exit] ← 전체화면일 때만 표시
├── [data-vt-panel="treemap"]   트리맵
├── [data-vt-panel="relation"]  관계도맵
└── [data-vt-panel="expand"]    확장맵
```

맵 유형 탭은 공통 컴포넌트 `radio-toggle-group`(`component/radio.css`)입니다.

---

## 3. 탭·전체화면 — `tabs.js`

- 탭 `change` → 이전 패널 페이드 아웃(280ms) → 새 패널 표시 → 해당 맵 `show()`(리사이즈·재렌더)
- 전체화면: 각 맵의 확대 버튼으로 진입, 「전체화면 종료」 버튼 또는 Esc로 종료
- 전체화면 중 탭을 바꾸면 전체화면을 유지한 채 맵만 바뀝니다.

| body 클래스 | 상태 |
|-------------|------|
| `is-vt-tm-fullscreen` | 트리맵 전체화면 |
| `is-vt-relation-fullscreen` | 관계도맵 전체화면 |
| `is-vt-expand-fullscreen` | 확장맵 전체화면 |

### 공개 API

세 맵이 같은 모양의 객체를 `window`에 둡니다.

| 객체 | 메서드 |
|------|--------|
| `window.VtTreemap` | `show()`, `setFullscreenUI(open)`, `enterFullscreen(opt)`, `exitFullscreen(opt)` |
| `window.VtRelationMap` | 위 + `resize()` |
| `window.VtExpandMap` | 위 + `resize()` |
| `window.syncVtFullscreenExit()` | 종료 버튼 표시 동기화 (`tabs.js`) |
| `window.syncVtCatTreeFromStep(tree, step, cat)` | 단계(1~4)에 맞춰 분류 트리 체크 (`step-cat-sync.js`) |

`enterFullscreen` / `exitFullscreen` 옵션: `{ syncBody: false }`(body 클래스 건드리지 않음), `{ focus: false }`(포커스 이동 안 함).

---

## 4. 트리맵 — `treemap.js`

면적 = 데이터 비중인 드릴다운 트리맵입니다.

| 동작 | 결과 |
|------|------|
| 타일 hover | 툴팁(제목·데이터셋 수·비율) + 액션 버튼 |
| 대·중분류 타일 클릭 / 「하위 분류 보기」 | 한 단계 아래로(대 → 중 → 소) |
| 경로 표시 `[data-vt-path-trail]` | 상위 단계 버튼(`data-vt-path-up="root\|mid"`)으로 복귀 |
| 소분류 타일 클릭 | 선택 테두리(흰색 4px) 토글 |
| 소분류 「데이터셋 보기」 | `../search/dataset.html`로 이동 (`DATASET_PAGE_URL`) |
| 확대 `[data-vt-treemap-expand]` | 전체화면 |

상세 패널 `[data-vt-tm-detail]`은 마크업과 닫기(`[data-vt-tm-detail-close]`)만 연결돼 있고, **현재 여는 동작은 없습니다**(항상 `hidden`). 쓰려면 `setTmDetailOpen(true)`를 원하는 이벤트에서 호출합니다. 열리면 `[data-vt-tm-layout]`에 `is-detail-open`이 붙습니다.

### 데이터 (`rootData`)

```js
{
  id: 'major-1', level: 'major',          // 'major' | 'mid' | 'small'
  name, title, pathLabel,                  // 타일 라벨 · 툴팁 제목 · 경로 라벨
  value,                                   // 면적 비중
  percent, datasets, share, shareLabel,    // 툴팁 수치
  childCount,                              // 하위 분류 수
  actionLabel, actionType,                 // '하위 분류 보기' + 'drill' | '데이터셋 보기' + 'dataset'
  itemStyle: { color },
  children: [ …mid… ]                      // mid.children = […small…]
}
```

대분류 4개(물환경·자연환경·탄소중립·에너지) × 중분류 × 소분류 목업을 `createMidNodes()` / `createSmallNodes()`로 만듭니다. 대분류별 색 팔레트는 `COLORS_WATER` · `COLORS_NATURE` · `COLORS_CARBON` · `COLORS_ENERGY`입니다.

**개발 연동**: `rootData`를 분류 API 응답으로 교체합니다. 소분류 「데이터셋 보기」는 `DATASET_PAGE_URL`에 분류 코드를 붙여 데이터셋 목록으로 넘기면 됩니다.

---

## 5. 관계도맵 — `relation-map.js`

대분류(육각형) 중심으로 중분류(마름모) → 소분류(원) → 데이터셋(칩)을 선으로 잇는 그래프입니다.

### 5.1 왼쪽 필터 (`.vt-relation__side`)

| 요소 | 선택자 | 동작 |
|------|--------|------|
| 단계별 확장 | `input[type=range][data-vt-rel-step]` (1~4), 안내 `[data-vt-rel-step-hint]` | 1 대분류 · 2 중분류 · 3 소분류 · 4 데이터셋까지 표시 |
| 분류 선택 트리 | `[data-vt-rel-tree]` > `.vt-relation__tree-item[data-depth][data-vt-cat]` | 대분류(`data-depth="1"`) 체크 = 테마 전환. 화살표로 접기/펼치기 |

`data-vt-cat`: `water` · `nature` · `carbon` · `energy`. 대분류를 바꾸면 그래프 색(`THEMES`)과 중심 노드 이름이 바뀝니다. 대분류는 항상 하나만 선택됩니다.

### 5.2 그래프

| 동작 | 결과 |
|------|------|
| 데이터셋 노드 클릭 | 오른쪽 상세 패널 `[data-vt-rel-detail]` 열림 + 구성 데이터 팝오버 `[data-vt-rel-popover]` |
| 빈 곳 클릭 | 팝오버 닫기 |
| 확대·축소·초기화 | `[data-vt-rel-zoom-in]` · `[data-vt-rel-zoom-out]` · `[data-vt-rel-reset]` (0.5~2배) |
| 드래그 | 노드 이동·화면 이동 |
| 상세 패널 폭 | `[data-vt-rel-detail-resize]` 드래그 |
| 확대 | `[data-vt-relation-expand]` → 전체화면 |

### 5.3 데이터

- `ALL_NODES`: `{ id, name, category(0 대 · 1 중 · 2 소 · 3 데이터셋), level(1~4), x, y, symbol, symbolSize, compose? }`
- `ALL_LINKS`: `{ source, target, level, dashed? }` — 데이터셋 연결은 점선
- `THEMES[cat]`: `{ majorName, major, mid, small, dsActive, compose[] }`
- **좌표(x, y)가 고정값**입니다. 노드 수가 바뀌면 배치 로직(원형·방사형 등)을 새로 정해야 합니다.

상세 패널 내용(칩·데이터셋명·메타·「상세보기」)은 `treeMap.html`에 정적 마크업으로 있습니다.

---

## 6. 확장맵 — `expand-map.js`

관계도맵과 같은 데이터를 작은 아이콘 노드로 넓게 펼친 버전입니다.

- **왼쪽 필터와 오른쪽 상세 패널은 관계도맵 패널의 마크업을 JS가 복제**해서 넣습니다(`cloneNode`). 복제본의 `id` / `for` / `aria-*` 값에는 `exp-` 접두어를 붙여 중복을 피합니다.
  - JSP에서 관계도맵 마크업을 빼면 확장맵 필터도 사라집니다. 서버에서 확장맵용 필터·상세를 직접 렌더링한다면 복제 코드를 지우고 `data-vt-exp-detail`을 붙인 상세 패널을 `[data-vt-expand-layout]` 안에 두면 됩니다.
- 노드 모양: 대분류 육각형 · 중분류 마름모 · 소분류 삼각형 · 데이터셋 아이콘(`expand-ds.svg`, 선택 시 `expand-ds-active.svg`)
- 데이터셋은 단계 4에서만 선택됩니다. 선택하면 상세 패널 + 구성 데이터 팝오버 `[data-vt-expand-popover]`
- 확대·축소·맞춤: `[data-vt-expand-zoom-in]` · `[data-vt-expand-zoom-out]` · `[data-vt-expand-fit]`
- 확대 `[data-vt-expand-expand]` → 전체화면(툴바에 확장맵 범례 표시)

데이터 구조는 관계도맵과 같습니다(`ALL_NODES`, `ALL_LINKS`, `THEMES`, `COMPOSE_*`).

---

## 7. 주의

- **인라인 SVG**: `treeMap.html`에는 관계도맵 중심 노드용 인라인 `<svg>`가 하나 있습니다. Live Server로 볼 때 이 태그 때문에 새로고침 스크립트가 끼워집니다(현재는 파일이 잘리지 않음). 인라인 SVG를 더 늘리지 말고 `icon.css` 클래스나 `<img>`를 쓰세요. 자세한 내용은 [README](../../README.md#프로토타입-실행-주의).
- 차트 크기는 컨테이너 기준입니다. 숨긴 패널에서 차트를 만들면 크기가 0이 되므로, 패널을 보여 준 뒤 `show()` / `resize()`를 부릅니다(`tabs.js`가 처리).
- 데이터 검색창 `[data-vt-relation-search]`은 UI만 있습니다(검색 로직 없음).

---

## 8. 개발 연동 체크리스트

| 할 일 | 위치 |
|-------|------|
| 분류 트리맵 데이터 | `treemap.js` `rootData` |
| 데이터셋 목록 이동 | `treemap.js` `DATASET_PAGE_URL` + 분류 코드 |
| 관계도·확장맵 노드/링크 | `relation-map.js`, `expand-map.js` `ALL_NODES` / `ALL_LINKS` (좌표 배치 포함) |
| 대분류별 색·구성 데이터 | `THEMES`, `COMPOSE_WATER` / `COMPOSE_THEME` |
| 분류 선택 트리 | `treeMap.html` `[data-vt-rel-tree]` 항목 (`data-depth`, `data-vt-cat`) |
| 데이터셋 상세 패널 | `treeMap.html` `[data-vt-rel-detail]` 내용 |
| 데이터 검색 | `[data-vt-relation-search]` — 로직 신규 |
