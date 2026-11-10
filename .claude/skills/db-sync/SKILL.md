---
name: db-sync
description: JPA Entity를 스캔해 도메인 모델과 DB 스키마의 갭, 삭제 종속성(고아 데이터)을 점검하고 동기화 방법을 제안한다. 스키마는 직접 바꾸지 않는다.
argument-hint: "[도메인명, 없으면 전체]"
---

# DB 동기화 점검

대상: $ARGUMENTS

이 Skill은 **점검과 제안**만 한다. 스키마 변경과 DDL 실행은 승인 후에만 한다 (`.claude/rules/database.md`).

## 0. 사전 확인

`backend/src/main/java/com/meotto/api/domain/` 아래에 `*Entity.java`가 있는지 확인한다. **없으면** "점검할 Entity가 없음"을 보고하고 끝낸다 (현재 도메인이 구현되기 전이면 정상이다).

## Step 1: Entity 스캔

`*Entity.java`의 `@Column`, `@Table`, 필드 정의를 수집한다.

## Step 2: BaseEntity 확인

`global/common/entity/BaseEntity.java`에서 공통 컬럼(`id`, `createdAt`, `updatedAt`, `deletedAt`)을 파악한다.

## Step 3: 갭 분석

- `@Column(nullable = false)`인데 기본값이 없는 컬럼 (저장 시 제약 위반 가능). 생성자·팩토리에서 값을 항상 넣는지 확인하고, Java null 문제와 DB 제약 위반을 구분해서 보고한다
- `unique` 선언 여부와 실제 필요성
- FK 필드(`Long xxxId`)에 대응하는 Entity 존재 여부
- `deletedAt` 없는 Entity에서 소프트 딜리트 사용 여부

## Step 4: 삭제 종속성 점검

이 프로젝트는 JPA 연관관계를 쓰지 않고 FK를 `Long xxxId`로만 갖는다. cascade가 없어 부모를 지워도 자식은 서비스 코드가 처리하지 않으면 남는다.

1. 모든 Entity의 `Long xxxId`를 스캔해 부모 → 자식 관계를 역추적한다.
2. 부모에 `softDelete()` 또는 하드 삭제를 호출하는 서비스 메서드를 찾는다.
3. 그 로직이 자식을 함께 처리하는지(소프트 삭제 전파), 또는 조회 시 부모의 `deletedAt`을 확인하는지 본다. 둘 다 없으면 **고아 데이터 위험**이다.
4. 하드 삭제(`deleteById`, `repository.delete`)는 별도 표시하고 우선순위를 높인다.
5. 다단 참조(User → A → B)는 체인 전체를 따라간다.

## Step 5: 결과

- 갭 없음: `✅ Entity 정의 일관성 확인 완료`
- 갭 있음: 수정할 Entity 코드와 조치를 제안한다.
  - 컬럼 삭제/이름 변경은 DDL을 제공하되 **실행하지 않는다**. 실행 여부는 사용자가 결정한다.
  - 삭제 종속성 갭은 별도 섹션으로: 부모/자식 쌍, 고아 데이터 시나리오, 서비스에 추가할 정리 로직

설정(`application*.yml`)의 `ddl-auto` 값을 확인해 제안이 그 모드에서 의미가 있는지 함께 적는다.

## 신규 Entity 템플릿

Entity를 새로 만들 때의 패턴은 `backend/CLAUDE.md`의 "핵심 코드 패턴"이 기준이다 (주석 절대 금지).
