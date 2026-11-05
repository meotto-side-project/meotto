---
paths:
  - "frontend/apps/mobile/**"
---

# 모바일(Expo, React Native) 규칙

모바일은 웹(`apps/web`)을 웹뷰로 띄우는 앱 껍데기이고, 웹으로 할 수 없는 네이티브 기능(푸시 알림 등)만 직접 구현한다. 화면 UI를 모바일에 새로 만들기 전에 웹에서 할 수 있는지 먼저 따진다. 팀에 RN 경험이 없어서 아래는 가장 단순한 기본값이고, 실제로 써 보며 문제가 있으면 이 문서를 고친다.

## 웹뷰와 브리지

- 웹뷰는 `react-native-webview`를 쓴다. 설치는 `npx expo install`로 하고 사용자 승인을 받는다.
- 웹뷰가 불러오는 URL은 환경 변수로 받고, 허용한 출처 외의 URL은 웹뷰 안에서 열지 않고 시스템 브라우저로 넘긴다 (`originWhitelist`, `onShouldStartLoadWithRequest`).
- 웹과 네이티브의 통신은 `postMessage`/`onMessage` 하나로만 한다. 메시지는 `{ type, payload }` 형식이고 Zod로 검증한다. 메시지 type 목록은 Plan의 브리지 계약 표에 있고, 목록에 없는 메시지는 무시한다.
- 로그인 토큰은 `expo-secure-store`에 두고, 웹에는 필요한 요청에만 전달한다. URL 쿼리에 토큰을 싣지 않는다.
- 웹이 일반 브라우저에서도 열리므로, 브리지 호출부(웹)는 앱 안에서만 동작하도록 감지하고 브라우저에서는 대체 동작을 둔다.

## 구조 (네이티브 화면이 필요한 경우)

- 라우트는 `src/app/`에만 둔다 (Expo Router, 파일이 곧 화면, `_layout.tsx`가 내비게이터). 라우트 이외 코드는 `src/app/` 밖에 둔다.
- `src/components/ui/[Name]/[Name].tsx`: 범용 컴포넌트. `features`를 참조하지 않는다.
- `src/components/features/[feature]/`: 기능 전용. 하위에 `constants/`, `queries/`, `hooks/`.
- `src/lib/`: API 래퍼 등 공용 로직, `src/theme/`: 디자인 토큰.
- import 방향은 상위 → 하위만 (웹과 동일).
- 컴포넌트는 함수형, props 타입을 명시, default export.

## 스타일

- `StyleSheet.create`로 쓰고 값은 `src/theme/`의 토큰(색, 간격, 타이포, 반경)만 쓴다. 임의 값 금지.
- 스타일 라이브러리(NativeWind 등)는 도입하지 않는다. 필요해지면 승인받고 이 문서를 고친다.
- 화면 가장자리는 `react-native-safe-area-context`의 안전 영역을 적용한다.

## 데이터

- TanStack Query + Zod. 훅 패턴은 웹과 같고 위치만 다르다 (`create-api-hook`).
- HTTP는 `src/lib/api`의 래퍼 하나만 쓴다 (`fetch` 기반). 화면 컴포넌트에서 `fetch`를 직접 부르지 않는다.
- 인증 토큰 같은 민감값은 `expo-secure-store`에 저장한다 (AsyncStorage에 두지 않는다). 설치 전에 승인받는다.

## 제스처와 애니메이션

`react-native-reanimated`, `react-native-gesture-handler`가 이미 설치되어 있다. 롱프레스 도장찍기(F-22) 같은 인터랙션은 이 둘로 구현하고, JS 스레드의 `setTimeout` 기반 애니메이션은 쓰지 않는다.

## 접근성

- 눌리는 요소에 `accessibilityRole`, `accessibilityLabel`을 준다. 상태가 있으면 `accessibilityState`.
- 터치 영역은 최소 44x44pt (`hitSlop` 포함).
- 색만으로 상태를 전달하지 않는다.

## 의존성

패키지는 `npx expo install <package>`로 설치한다 (SDK 호환 버전). 추가 전에 사용자 승인을 받는다. 변경 후 `npx expo-doctor`로 점검한다.

## 테스트와 검증

- 컴포넌트·훅: `jest-expo` + React Native Testing Library (Expo 권장 조합). 스킬: `create-test`.
- E2E: Maestro (YAML 흐름, 학습 비용이 낮음). 스킬: `create-e2e`.
- 두 도구는 현재 미설치다. 설치는 별도 승인 작업이고, 설치 전에는 "미검증"으로 보고한다.
- 기본 검증은 `frontend/`에서 `pnpm lint`, `pnpm check-types`. 네이티브 동작(제스처, 푸시, 실기기 레이아웃)은 시뮬레이터나 실기기에서 사람이 확인한다.
