# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

토마토 도장으로 칭찬을 주고받는 앱. 모노레포 구성: `backend/`(Spring Boot), `frontend/`(web: Next.js, mobile: Expo), `docs/specs/`(기능 스펙).

## 기능 스펙

기능을 구현하거나 수정하기 전에 [docs/specs/README.md](docs/specs/README.md)를 먼저 읽고, 목차에서 작업 대상 기능 파일만 추가로 읽는다.

- 커밋/PR에는 기능 ID(`F-xx`)를 적는다.
- 스펙에 **[논의 필요]**로 표시된 항목은 임의로 정하지 말고 사용자에게 확인한다.
- 구현 중 스펙과 다른 결정을 했다면 해당 스펙 파일도 함께 수정한다.

## 영역별 지침

백엔드·프론트엔드 지침은 각 폴더의 `AGENTS.md`를 따른다.
