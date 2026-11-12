// 여기서 시작한 비동기 작업은 하이드레이션 전에 끝난다는 보장이 없다(Next 문서).
// 첫 요청이 워커 활성화보다 빠르면 실서버로 갈 수 있다.
if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  void import("@/mocks/browser").then(({ worker }) =>
    worker.start({ onUnhandledFrame: "bypass" }),
  );
}
