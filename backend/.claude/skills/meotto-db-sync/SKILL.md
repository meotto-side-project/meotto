---
name: meotto-db-sync
description: JPA Entity 스캔으로 도메인 모델과 DB 스키마 갭 감지 및 동기화 제안
---

# MEOTTO DB 동기화

대상 도메인: $ARGUMENTS (없으면 전체)

## Step 1: Entity 코드 스캔

`src/main/java/com/meotto/api/domain/` 하위 `*Entity.java` 파일 탐색.
각 Entity의 `@Column`, `@Table`, 필드 정의 수집.

## Step 2: BaseEntity 확인

`global/common/entity/BaseEntity.java` → 공통 컬럼(`id`, `createdAt`, `updatedAt`, `deletedAt`) 파악.

## Step 3: 갭 분석

- `@Column(nullable = false)`인데 DB default 없는 컬럼 → NPE 위험
- `@Column(unique = true)` 선언 여부 vs 실제 유니크 제약 필요성
- FK 필드(`Long xxxId`)에 대응하는 다른 Entity 존재 여부
- `deletedAt` 없는 Entity에서 소프트 딜리트 패턴 사용 여부

## Step 4: 삭제 종속성 점검 (연쇄 삭제 체크)

이 프로젝트는 JPA 연관관계 매핑을 쓰지 않고 FK를 `Long xxxId` 필드로만 들고 있어 `CascadeType`이
존재하지 않는다. 즉 부모 데이터를 지워도 자식 데이터는 Service 코드가 직접 처리하지 않는 한 그대로 남는다.

1. 모든 Entity의 `Long xxxId` 필드를 스캔해 "부모 Entity → 자식 Entity" 참조 관계 역추적
2. 부모 Entity에 `softDelete()`(또는 하드 `deleteById`/`.delete()`)를 호출하는 Service 메서드 탐색
3. 해당 삭제 로직에서 자식 Entity(부모 id를 FK로 참조)에 대한 처리가 있는지 확인
   - 소프트 삭제 전파: 자식도 함께 `softDelete()` 하는가
   - 또는 조회 시 부모의 `deletedAt`을 조인/체크해서 고아 자식을 걸러내는가
   - 둘 다 없으면 **고아 데이터 위험**: 부모는 삭제됐는데 자식이 조회 API에 그대로 노출됨
4. 하드 삭제(`deleteById`, `repository.delete(entity)`) 사용처는 별도 표시 — FK 무결성이 아예 깨질 수 있어 우선순위 높게 보고
5. 다단 참조 구조(User → A → B → C)가 생기면 체인 전체를 따라가며 확인

## Step 5: 결과

**갭 없음**: `✅ Entity 정의 일관성 확인 완료`

**갭 있음**: 수정할 Entity 코드 및 조치 제안
- `ddl-auto: update` 환경 → 재시작 후 자동 반영
- 컬럼 삭제/이름 변경은 직접 DDL 제공
- 삭제 종속성 갭(Step 4)은 별도 섹션으로 구분: 영향받는 부모/자식 Entity 쌍, 고아 데이터 시나리오, Service에 추가할 정리 로직 제안

**신규 Entity 생성 요청 시**:

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
        return new Xxx(getId(), userId, getCreatedAt(), getDeletedAt());
    }
}
```

BaseEntity 상속 → `id`, `createdAt`, `updatedAt`, `deletedAt` 자동 포함.
