# MEOTTO 프로젝트 컨텍스트

## 프로젝트 개요

MEOTTO — 토마토 도장으로 전하는 마음
- Java 21 + Spring Boot 4.0.2
- DDD 아키텍처 (presentation / application / domain / infrastructure / exception)
- JPA (Hibernate) + MySQL + Redis(캐시)
- 외부 연동: Firebase FCM, Discord(에러 알림), AWS S3, OAuth2(Google/Naver/Kakao)

## 기술 스택 버전

| 항목 | 버전 |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.2 |
| Gradle | 9.2.1 |

## 빌드 및 실행 명령어

```bash
# 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun

# 전체 테스트 실행
./gradlew test

# 단일 테스트 클래스 실행
./gradlew test --tests "com.meotto.api.domain.{도메인}.application.service.XxxServiceTest"
```

## 패키지 구조

```
com.meotto.api
├── domain/
│   └── {domain}/
│       ├── application/
│       │   ├── service/        # @Service @Transactional
│       │   └── scheduler/      # @Scheduled 배치
│       ├── domain/
│       │   ├── entity/         # *Entity extends BaseEntity
│       │   ├── model/          # Java record (불변 도메인 모델)
│       │   │   └── enums/
│       │   └── repository/     # *Repository extends JpaRepository
│       ├── exception/          # *ErrorCode implements ErrorCode
│       ├── infrastructure/     # 외부 연동 구현체
│       └── presentation/
│           ├── request/        # *Request record/class
│           ├── response/       # *Response record/class
│           └── *Controller.java
└── global/
    ├── common/
    │   ├── entity/             # BaseEntity (id, createdAt, updatedAt, deletedAt)
    │   └── response/           # PageResponse<T>
    ├── exception/               # ErrorCode, BusinessException, GlobalExceptionHandler, ErrorResponse
    ├── infrastructure/
    │   ├── async/              # AsyncConfig
    │   ├── fcm/                # FcmSender, FcmConfig
    │   ├── file/                # FileStorageService (S3)
    │   ├── notification/        # Notifier (Discord)
    │   └── redis/               # RedisConfig
    ├── log/                     # ApiLoggingFilter
    ├── swagger/                  # SwaggerConfig
    └── security/
        ├── config/              # SecurityConfig
        ├── context/              # SecurityUtil (getCurrentUserId)
        ├── cookie/               # CookieUtil, CookieProperties
        ├── jwt/                  # JwtTokenProvider, JwtAuthenticationFilter
        └── exception/            # SecurityErrorCode
```

## 도메인 맵

| 도메인 | 역할 |
|--------|------|
| (TBD) | 아직 도메인 구현 전 — 기능 개발과 함께 채워 넣기 |

`global/security`에 JWT 발급/검증 스켈레톤(`JwtTokenProvider`, `JwtTokenExtractor`, `JwtAuthenticationFilter`)만
준비되어 있고, 실제 로그인(OAuth2 등)·회원 도메인은 아직 구현되어 있지 않다.
`SecurityConfig`는 `/admin/**`만 `ADMIN` 권한으로 막아두고 나머지는 전부 허용 상태이므로,
도메인 추가 시 `authorizeHttpRequests`에 해당 경로의 인증 규칙을 직접 추가해야 한다.

## 핵심 코드 패턴

### Entity

```java
@Entity
@Table(name = "xxx")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class XxxEntity extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    public static XxxEntity from(Xxx model) {
        return new XxxEntity(model.userId());
    }

    public Xxx toModel() {
        return new Xxx(getId(), userId(), getCreatedAt(), getDeletedAt());
    }

    public void softDelete() {
        super.softDelete();
    }
}
```

### Domain Model (Java record)

```java
public record Xxx(
    Long id,
    Long userId,
    LocalDateTime createdAt,
    LocalDateTime deletedAt
) {}
```

### Repository

```java
public interface XxxRepository extends JpaRepository<XxxEntity, Long> {

    Optional<XxxEntity> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT x FROM XxxEntity x WHERE x.userId = :userId AND x.deletedAt IS NULL ORDER BY x.createdAt DESC")
    List<XxxEntity> findAllByUserId(@Param("userId") Long userId);
}
```

### Service

```java
@Service
@RequiredArgsConstructor
@Transactional
public class XxxService {

    private final XxxRepository xxxRepository;

    @Transactional(readOnly = true)
    public Xxx findById(Long id) {
        return xxxRepository.findByIdAndDeletedAtIsNull(id)
            .map(XxxEntity::toModel)
            .orElseThrow(() -> new BusinessException(XxxErrorCode.XXX_NOT_FOUND));
    }

    public Long create(XxxRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        XxxEntity entity = XxxEntity.from(request.toModel(userId));
        return xxxRepository.save(entity).getId();
    }
}
```

### Controller

```java
@RestController
@RequestMapping("/xxx")
@RequiredArgsConstructor
@Validated
public class XxxController {

    private final XxxService xxxService;

    @GetMapping("/{id}")
    public XxxResponse getXxx(@PathVariable @Positive Long id) {
        return XxxResponse.from(xxxService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createXxx(@RequestBody @Valid XxxRequest request) {
        xxxService.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteXxx(@PathVariable @Positive Long id) {
        xxxService.delete(id);
    }
}
```

### ErrorCode

```java
@Getter
@RequiredArgsConstructor
public enum XxxErrorCode implements ErrorCode {
    XXX_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 xxx를 찾을 수 없습니다."),
    XXX_NOT_OWNER(HttpStatus.FORBIDDEN, "xxx 소유권이 없습니다. (xxxId: %s, userId: %s)");

    private final HttpStatus status;
    private final String message;
}

// 사용
throw new BusinessException(XxxErrorCode.XXX_NOT_FOUND);
throw new BusinessException(XxxErrorCode.XXX_NOT_OWNER, id, userId);

// 응답: { "name": "XXX_NOT_FOUND", "message": "해당 xxx를 찾을 수 없습니다." }
```

### 현재 유저 추출

```java
Long userId = SecurityUtil.getCurrentUserId();
```

### 소프트 딜리트

```java
// 조회 시 필터 필수
xxxRepository.findByIdAndDeletedAtIsNull(id)

// 삭제
entity.softDelete();
```

## API 응답 표준

| 상황 | HTTP Status | Body |
|------|-------------|------|
| 생성 | 201 Created | 없음 또는 생성된 ID |
| 조회 | 200 OK | 데이터 |
| 수정/삭제 | 204 No Content | 없음 |
| 비즈니스 오류 | 4xx | `{ name, message }` |
| 인증 오류 | 401 | `{ name, message }` |
| 권한 오류 | 403 | `{ name, message }` |

## 보안 규칙

불변 조건:
- 현재 사용자: `SecurityUtil.getCurrentUserId()` (요청 파라미터로 userId 수신 금지)
- 리소스 뮤테이션 전 소유자 검증 필수
- ADMIN 전용 엔드포인트 → `SecurityConfig`에 `.hasRole("ADMIN")` 등록 필수
- JWT 시크릿: `JwtProperties`에서만 참조 (하드코딩 금지)
- PII 로깅 없음

## 테스트 패턴

```java
@ExtendWith(MockitoExtension.class)
class XxxServiceTest {

    @InjectMocks private XxxService xxxService;
    @Mock private XxxRepository xxxRepository;

    @Test
    void findById_존재하지_않으면_404_예외() {
        when(xxxRepository.findByIdAndDeletedAtIsNull(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> xxxService.findById(1L))
            .isInstanceOf(BusinessException.class)
            .satisfies(e -> assertThat(((BusinessException) e).getErrorCode())
                .isEqualTo(XxxErrorCode.XXX_NOT_FOUND));
    }
}

// SecurityUtil 목킹 (정적 메서드)
try (MockedStatic<SecurityUtil> mocked = mockStatic(SecurityUtil.class)) {
    mocked.when(SecurityUtil::getCurrentUserId).thenReturn(1L);
    // ...
}
```

테스트 파일 네이밍: `XxxServiceTest.java`, 메서드명은 한국어 (`findById_다른_유저면_403_예외`)

## 프로젝트 규칙

- 커밋 메시지: 제목(첫 줄)은 영어, body는 한글로 작성

### 커밋 컨벤션

**CI(`backend-ci.yml`)가 PR의 모든 커밋 메시지를 검사**합니다 (`.githooks/commit-msg` 로직 재사용).
이 레포는 프론트엔드가 이미 `core.hooksPath`를 `frontend/.husky`로 점유하고 있어
(레포당 hooksPath는 하나뿐) 백엔드용 로컬 git hook을 자동으로 강제하지 않는다 — 로컬에서
커밋 시점에 바로 검증받고 싶다면 개인 로컬에서만 아래처럼 켤 수 있다 (레포에 커밋되는 설정 아님,
단 프론트 쪽에서 `npm install`을 다시 돌리면 조용히 덮어써짐에 유의):

```bash
git config core.hooksPath backend/.githooks
```

- **형식**: `type: subject` (scope 없음, 반드시 제외)
- **type**: `feat|fix|docs|style|refactor|test|chore|revert|merge`
- **subject**: 영어, 50자 이하, 마침표 금지
- **body**: 작성 시 한글, 각 줄을 `-`로 시작, 빈 줄로 제목과 구분

```
feat: add stamp issuance logic

- 토마토 도장 생성 API 구현
- Redis 캐시 만료 시간 자정으로 설정
```

### 코드 포맷팅 / 정적 분석 (Naver 컨벤션)

- **Spotless** (`config/formatter/naver-eclipse-formatter.xml` + `naver.importorder`): `./gradlew spotlessCheck` / `./gradlew spotlessApply`
- **Checkstyle** (`config/checkstyle/naver-checkstyle-rules.xml`): `./gradlew checkstyleMain`
- `.githooks/pre-commit`이 변경된 `.java` 파일이 있으면 커밋 전 `spotlessCheck`를 자동 실행합니다.
- IntelliJ에서 동일한 스타일로 편집하려면 `config/formatter/naver-intellij-formatter.xml`을
  `Preferences > Editor > Code Style > Java > 톱니바퀴 아이콘 > Import Scheme`으로 가져오세요.

## 커맨드 워크플로우

| 상황 | 커맨드 |
|------|--------|
| 새 기능 구현 | `/meotto-codegen` |
| 버그 수정 | `/meotto-fix` |
| 리팩토링 | `/meotto-refactor` |
| DB 갭 감지 | `/meotto-db-sync` |
| 보안 감사 | `/meotto-pentest` |
| 코드 리뷰 | `/meotto-code-reviewer` |
| 커밋 | `/meotto-git-committer` |
| 브랜치 커밋·푸시·PR 생성 | `/meotto-branch-merge` |
| 문서-코드 일치 검사 | `/validate-docs-code` |
| 프론트 테스트 데이터 시드 | `/meotto-frontend-test-data` |
