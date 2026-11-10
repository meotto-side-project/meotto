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
