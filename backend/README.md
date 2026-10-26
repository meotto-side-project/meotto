# MEOTTO

<b>토마토 도장으로 전하는 마음</b>

<br>

## 프로젝트 소개

MEOTTO 백엔드는 Spring Boot 기반 DDD 아키텍처로 구성된 API 서버입니다.

<br>

## 기술 스택

<table>
    <thead>
        <tr>
            <th>분류</th>
            <th>기술 스택</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><p>백엔드</p></td>
            <td>
                <img src="https://img.shields.io/badge/Java 21-007396?style=for-the-badge&logo=openjdk&logoColor=white">
                <img src="https://img.shields.io/badge/Spring Boot 4.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white">
                <img src="https://img.shields.io/badge/Spring Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white">
                <img src="https://img.shields.io/badge/Spring Data JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white">
            </td>
        </tr>
        <tr>
            <td><p>데이터베이스</p></td>
            <td>
                <img src="https://img.shields.io/badge/MySQL 8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
                <img src="https://img.shields.io/badge/Redis 7-DC382D?style=for-the-badge&logo=redis&logoColor=white">
            </td>
        </tr>
        <tr>
            <td><p>인프라</p></td>
            <td>
                <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">
                <img src="https://img.shields.io/badge/GitHub Actions-000000?style=for-the-badge&logo=githubactions&logoColor=white">
                <img src="https://img.shields.io/badge/AWS S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white">
            </td>
        </tr>
        <tr>
            <td><p>외부 연동</p></td>
            <td>
                <img src="https://img.shields.io/badge/Firebase FCM-FFCA28?style=for-the-badge&logo=firebase&logoColor=black">
                <img src="https://img.shields.io/badge/OAuth2 (Google·Naver·Kakao)-EB5424?style=for-the-badge&logo=auth0&logoColor=white">
                <img src="https://img.shields.io/badge/Discord Webhook-5865F2?style=for-the-badge&logo=discord&logoColor=white">
            </td>
        </tr>
    </tbody>
</table>

<br>

## 로컬 실행 방법

```bash
# 1. 환경 변수 설정
cp .env.example .env
# JWT_SECRET, OAuth 자격증명 입력

# 2. 인프라 실행 (MySQL, Redis)
docker-compose up -d mysql redis

# 3. 애플리케이션 실행
./gradlew bootRun
```

헬스체크: `http://localhost:8080/actuator/health`
