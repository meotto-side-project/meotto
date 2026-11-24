# 디자인 시스템

Figma 섹션: Design System (날짜 섹션 안. 최신은 "11/02")
토큰 값은 코드의 `frontend/apps/web/src/app/globals.css` `@theme`에 구현되어 있다. Figma에 변수(Variables)는 없고 색상은 직접 지정된 값이라, 아래 표의 이름은 코드용으로 붙인 것이다. 값이 바뀌면 Figma `Design System` 섹션을 `get_design_context`로 다시 읽어 `globals.css`와 이 표를 함께 고친다.

## 기준 화면

Figma 프레임: iPhone 17 (402×874).

## 색상

| 토큰              | 값                    | 용도(Figma 기준)                                          |
| ----------------- | --------------------- | --------------------------------------------------------- |
| `sky`             | `#04b5eb`             | 하늘색, 파란 도장/포인트                                  |
| `tomato`          | `#ee2615`             | 토마토 레드                                               |
| `green`           | `#3b8301`             | 꼭지                                                      |
| `dark-red`        | `#b12729`             | 다크 레드                                                 |
| `beige`           | `#dad5d2`             | 베이지                                                    |
| `white` / `black` | `#ffffff` / `#000000` |                                                           |
| `gray-50`         | `#f3f3fa`             | 보조 버튼, 모달 버튼 배경                                 |
| `gray-100`        | `#e5e5e9`             |                                                           |
| `gray-200`        | `#cfcfd6`             |                                                           |
| `gray-300`        | `#b7b7bb`             |                                                           |
| `gray-500`        | `#6c6c6c`             | 설명 글자 (팔레트 밖, 11/16 온보딩. 디자이너에 추가 요청) |
| `gray-700`        | `#343434`             | 모달 제목, 보조 버튼 글자                                 |
| `gray-800`        | `#272727`             | 기본 버튼 배경                                            |
| `danger`          | `#fe0000`             | 탈퇴하기 등 위험 동작 글자 (팔레트 밖, 탈퇴창에서만 확인) |

로고는 흰/검정 배경 2종.

## 반경

`sm` 10px / `md` 30px / `lg` 50px. 버튼과 모달은 `md`. 하단 탭바의 탭 항목만 20px(`nav-item`)이라 별도 토큰으로 뒀다.

## 타이포

폰트: Poppins(`next/font`, 400·500·600). 한글 글리프가 없어 한글은 시스템 폰트(`Apple SD Gothic Neo`, `Noto Sans KR`)로 폴백한다. 자간은 전체 `-1%`.

| 토큰       | 크기 | 굵기    | 줄 높이            |
| ---------- | ---- | ------- | ------------------ |
| `display`  | 56px | Medium  | -                  |
| `h1`       | 32px | Medium  | -                  |
| `h2`       | 24px | Medium  | -                  |
| `h3`       | 20px | Medium  | -                  |
| `body-l`   | 20px | Medium  | -                  |
| `body-m`   | 16px | Regular | 30px               |
| `body-s`   | 14px | Regular | -                  |
| `title`    | 16px | Medium  | 30px               |
| `button-l` | 18px | Medium  | 30px               |
| `button-m` | 16px | Medium  | 30px               |
| `label`    | 14px | Medium  | -                  |
| `caption`  | 13px | Regular | -                  |
| `nav`      | 12px | Regular | - (하단 탭바 라벨) |

굵기는 토큰에 묶지 않고 컴포넌트에서 `font-medium` 등으로 지정한다. 줄 높이는 Figma 노드에서 확인된 값(30px)만 넣었다.

## 공통 컴포넌트

구현됨 (`apps/web/src/components/ui/`):

- `Button`: `variant` primary(`gray-800` 배경, 흰 글자) / secondary(`gray-50`, `gray-700`) / destructive(`gray-50`, `danger`), `size` l(높이 75px, `button-l`) / m(높이 62px, `button-m`). 반경 `md`.
- `Modal`: 흰 배경, 반경 `md`, 패딩 20px, 그림자 `0 0 17.5px rgba(0,0,0,0.2)`, 제목(18px SemiBold, `gray-700`) + 설명 + 버튼 영역. `role="dialog"`. 화면 전체 오버레이(딤)는 Figma에 없어 포함하지 않았다.

- `Logo`: `Meotto` 워드마크(Figma 11/16 `Union` 노드). `variant` solid(기본, 색은 `currentColor`라 검정/흰색 모두 가능) / outline(흰 채움 + 검정 외곽선, Figma `8177:2123`).
- `Icon/*`: Home, Star, Emoji, Bell, Download, Close, ChevronLeft. Home·Star·Emoji는 `filled`(선택 상태) 지원. 기본은 보조기기에서 숨김(`aria-hidden`). Figma 이름 `iconoir:bell` 중 두 번째는 모양이 다운로드 아이콘이라 `Download`로 이름 붙였다.
- `BottomTabBar`: Home / My / Friend. 다크 필(`gray-800`, 반경 `md`) + 선택 탭 라이트 필(`gray-50`, 반경 `nav-item`), 선택 탭은 아이콘이 `filled`. 라우팅은 연결하지 않았고 `activeTab`/`onSelect`만 받는다. 탭바 뒤 그라디언트 페이드(118px)는 포함하지 않았다.

미구현:

- 소셜 로그인 버튼(카카오 노랑 / 네이버 초록 / Apple 검정, 로고 아이콘 + 라벨).
- 키워드 칩, 토글, 아바타 + 라벨 리스트 행, 배지 아이콘 타일.
- 원형 아이콘 버튼(뒤로가기: 흰색 30% + 그림자, 닫기: `gray-200` 40%).
- 로고 아이콘 부분(토마토 심볼 154px).

## Open Questions

- 검색 입력창, 메시지 작성 텍스트 영역(0/200 카운터), QR 코드, 온보딩 슬라이드 인디케이터 등 다른 스펙 파일에 등장하는 컴포넌트들의 디자인시스템 반영 여부. (전송완료 등 오버레이는 `모달` 컴포넌트로 확인됨.)
- Poppins는 한글 글리프를 지원하지 않는 폰트라, 한글에도 Poppins로 지정돼 있다면 실제 렌더링 시 폴백 폰트가 적용될 가능성. 한글 샘플 텍스트로 재확인 필요.
- Figma 타이포 표에 `H1`이 56px과 32px 두 개로 적혀 있다. 코드에서는 `display`(56)와 `h1`(32)로 나눴으니 디자이너 확인이 필요하다.
- 자간 표기는 `-1%`인데 버튼·모달 노드는 `-1px`로 되어 있다. 코드는 `-1%`(`-0.01em`)로 통일했다.
- 표기 `56px / 35% / -1%`의 가운데 값(35%, 30%, 25%)의 의미(줄 높이 아님?)가 불분명해 줄 높이로 쓰지 않았다.
- 탈퇴하기 글자색 `#fe0000`(`danger`)을 팔레트에 정식 포함할지.
- 화면(11/16 온보딩)의 강조 글자와 일러스트 토마토는 `#e8392a`로 팔레트에 없다. 코드는 팔레트의 `tomato`(`#ee2615`)를 쓴다.
- 설명 글자 `#6c6c6c`는 팔레트에 없지만 팔레트 회색(`gray-300`은 배경 대비 명암비 1.81:1)이 너무 연해 `gray-500`으로 추가했다(4.75:1, WCAG AA 충족). 디자이너에게 팔레트 추가를 요청했다.
- 로고 outline 변형(흰 채움 + 검정 외곽선)을 어디에 쓰는지(예: 인스타그램 카드뉴스용인지 앱 안에서도 쓰는지) 확인이 필요하다.
