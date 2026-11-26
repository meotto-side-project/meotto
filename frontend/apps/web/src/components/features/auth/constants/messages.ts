export const SIGNUP_MESSAGES = {
  nicknameInvalid: "이름은 2~10자의 한글, 영문, 숫자, 공백만 쓸 수 있어요.",
  handleInvalid:
    "아이디는 3~30자의 영문, 숫자, 마침표(.), 밑줄(_)만 쓸 수 있고 마침표는 처음·끝·연속으로 쓸 수 없어요.",
  handleDuplicated: "이미 사용 중인 아이디예요.",
  serverError: "잠시 후 다시 시도해 주세요.",
  photoPermissionDenied: "사진 접근 권한이 필요해요.",
} as const;
