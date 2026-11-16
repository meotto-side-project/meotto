---
paths:
  - "backend/src/**/entity/**"
  - "backend/src/**/repository/**"
  - "backend/src/main/resources/**"
  - "backend/scripts/**"
---

# DB 규칙

- 모든 Entity는 `BaseEntity`(id, createdAt, updatedAt, deletedAt)를 상속하고, 삭제는 소프트 딜리트(`softDelete()`)가 기본이다.
- 조회는 `AndDeletedAtIsNull` 조건을 빠뜨리지 않는다.
- 부모를 삭제하면 자식(FK `Long xxxId`로 참조하는 Entity)도 같은 서비스 메서드에서 처리한다. JPA cascade가 없으므로 고아 데이터가 남는다.
- 하드 삭제(`deleteById`, `repository.delete`)는 사용 전에 승인받는다.
- **승인 필요**: 컬럼 추가·삭제·이름 변경, 테이블 추가·삭제, 유니크 제약 변경, 삭제성 DDL/DML. Plan에 "데이터 모델 변경" 항목으로 명시하고 구현 전에 승인받는다.
- 스키마 갭 점검은 `db-sync` 스킬을 쓴다.
- 시드·테스트 데이터 SQL은 `backend/scripts/`에 둔다. 실제 사용자 데이터를 삭제하거나 덮어쓰지 않는다.

## 마이그레이션 (Flyway)

- 스키마 변경 수단은 Flyway다. Hibernate `ddl-auto`는 `validate`로 고정되어 있고(테스트 프로필 제외), 컬럼 추가·삭제·변경은 Entity 수정과 함께 `backend/src/main/resources/db/migration/V{n}__{설명}.sql`을 반드시 같이 작성한다.
  - Spring Boot 4.0.2는 Flyway 자동 설정을 제공하지 않아, `MeottoApiApplication.main()`에서 `FlywayMigrationRunner.run()`으로 `SpringApplication.run()` 전에 직접 마이그레이션을 실행한다 (`global/infrastructure/flyway`).
- 버전 번호는 항상 증가시키고 되돌리지 않는다. 이미 배포에 적용된 `V{n}` 파일은 **절대 수정·삭제하지 않는다** — 체크섬이 깨져 다음 배포 기동이 막힌다. 고칠 내용이 있으면 새 버전 파일을 추가한다.
- `V1__init_member.sql`은 Flyway 도입 당시(`member` 테이블, MEO-46 컬럼 포함) 시점의 베이스라인이다. `baseline-on-migrate`로 구성되어 있어 기존 데이터가 있는 환경에서는 베이스라인만 기록하고, 완전히 새 환경(빈 스키마)에서는 `V1`부터 실제로 실행된다.
- 이 변경 전에는 `ddl-auto: update` 1회 부트스트랩으로 수동 처리했으나, Flyway 도입 이후로는 그 방식을 다시 쓰지 않는다.
