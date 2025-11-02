# Hack-chatgptok

중고 거래 플랫폼 - 3D Gaussian Splatting 및 AI 결함 감지 기능을 포함한 차세대 중고 거래 서비스

**🚀 배포된 서비스**: http://52.79.148.54:3000

## 프로젝트 개요

이 프로젝트는 다음의 핵심 기능을 제공합니다:

- **프론트엔드**: Next.js 기반 중고 거래 플랫폼 웹 인터페이스
- **백엔드**: Express.js 기반 REST API 서버
- **Gaussian AI**: 제품 이미지를 3D 모델로 변환하는 AI 서비스
- **Description AI**: Gemini를 활용한 제품 결함 자동 감지 서비스

## 빠른 시작

### 한 번에 모든 서비스 실행

```bash
# 프로젝트 루트에서 실행
./run.sh
```

이 스크립트는 다음을 자동으로 수행합니다:
- 백엔드 서버 시작 (http://localhost:8000)
- 프론트엔드 서버 시작 (http://localhost:3000)

**참고**: AI 서버들은 외부 서버에서 실행됩니다:
- Gaussian AI (3D 재구성): http://kaprpc.iptime.org:5051
- Description AI (결함 감지): http://kaprpc.iptime.org:5052

**종료**: `Ctrl+C`를 누르면 모든 서비스가 안전하게 종료됩니다.

### 로그 확인

각 서비스의 로그는 프로젝트 루트에 생성됩니다:

```bash
# 백엔드 로그
tail -f backend.log

# 프론트엔드 로그
tail -f frontend.log
```

## 사전 요구사항

### 공통
- Node.js 18.0+
- Python 3.9+

### 백엔드
- MySQL 데이터베이스 (AWS RDS)
- `.env` 파일 설정 필요
- AI 서버 URL 환경 변수:
  - `DESCRIPTION_API_URL` (기본값: http://kaprpc.iptime.org:5052)
  - `RECON_API_URL` (기본값: http://kaprpc.iptime.org:5051)

### 프론트엔드
- `.env.local` 파일 (자동 생성됨, 기본값: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`)

### AI 서버 (외부에서 실행)
**Gaussian AI** (3D 재구성):
- 외부 서버: http://kaprpc.iptime.org:5051
- CUDA 지원 GPU, COLMAP 설치 필요
- 로컬에서 실행하려면 [gaussian_ai/README.md](gaussian_ai/README.md) 참고

**Description AI** (결함 감지):
- 외부 서버: http://kaprpc.iptime.org:5052
- Gemini API 키 필요
- 로컬에서 실행하려면 [description_ai/README.md](description_ai/README.md) 참고

## 개별 서비스 실행

각 서비스를 개별적으로 실행하려면 해당 디렉토리로 이동하여 README를 참고하세요.

### 백엔드

```bash
cd backend
npm install
npm start
```

자세한 내용: [backend/README.md](backend/README.md)

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

자세한 내용: [frontend/README.md](frontend/README.md)

### AI 서버 (외부 서버에서 실행 중)

AI 서버들은 현재 외부 서버에서 실행되고 있습니다:
- **Gaussian AI**: http://kaprpc.iptime.org:5051
- **Description AI**: http://kaprpc.iptime.org:5052

로컬에서 AI 서버를 실행하려면:
- Gaussian AI: [gaussian_ai/README.md](gaussian_ai/README.md) 참고
- Description AI: [description_ai/README.md](description_ai/README.md) 참고

## 프로젝트 구조

```
Hack-chatgptok/
├── backend/              # Express.js 백엔드 서버
├── frontend/             # Next.js 프론트엔드
├── gaussian_ai/          # 3D Gaussian Splatting AI 서비스
├── description_ai/       # 제품 결함 감지 AI 서비스
├── docs/                 # 프로젝트 문서
├── run.sh               # 전체 서비스 실행 스크립트
├── init.sql             # 데이터베이스 초기화 SQL
└── sample_data.sql      # 샘플 데이터
```

## 환경 변수 설정

### 백엔드 (.env)
```env
# 데이터베이스 설정
DB_HOST=mysql.cnsqy2cmsbsj.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_password
DB_NAME=marketplace

# AI 서버 URL (기본값 사용 가능)
DESCRIPTION_API_URL=http://kaprpc.iptime.org:5052
RECON_API_URL=http://kaprpc.iptime.org:5051

# AWS S3
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=ss-s3-project
```

### 프론트엔드 (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## 주요 기능

### 1. 3D 제품 뷰어
- 제품 이미지를 360도 회전 가능한 3D 모델로 자동 변환
- Gaussian Splatting 기술 활용
- PlayCanvas 뷰어로 실시간 렌더링

### 2. AI 결함 감지
- Google Gemini 1.5 Flash를 활용한 자동 결함 분석
- 상태 등급 평가 (S/A/B/C/D)
- 가격 조정 비율 자동 제안

### 3. 중고 거래 플랫폼
- 상품 등록/수정/삭제
- 실시간 채팅
- 사용자 인증
- 좋아요 기능

## 서비스 주소

### 프로덕션 (AWS EC2)
**배포된 서비스**: http://52.79.148.54:3000

### 개발 환경

| 서비스 | 위치 | URL |
|--------|------|-----|
| 백엔드 | 로컬 | http://localhost:8000 |
| 프론트엔드 | 로컬 | http://localhost:3000 |
| Gaussian AI | 외부 서버 | http://kaprpc.iptime.org:5051 |
| Description AI | 외부 서버 | http://kaprpc.iptime.org:5052 |
| MySQL RDS | AWS | mysql.cnsqy2cmsbsj.ap-northeast-2.rds.amazonaws.com:3306 |
| S3 버킷 | AWS | ss-s3-project (ap-northeast-2) |

## 문제 해결

### run.sh 실행 권한 오류
```bash
chmod +x run.sh
```

### 포트 충돌
이미 사용 중인 포트가 있다면:
```bash
# 프로세스 확인
lsof -i :8000
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

### 환경 변수 누락
각 서비스의 README를 참고하여 필요한 `.env` 파일을 생성하세요.

## 기여

자세한 개발 가이드는 각 서비스의 README를 참고하세요.

## 라이센스

이 프로젝트는 다음 오픈소스 프로젝트를 사용합니다:
- [Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting) - Inria License
- [COLMAP](https://colmap.github.io/) - BSD License
- [PlayCanvas Model Viewer](https://github.com/playcanvas/model-viewer) - MIT License

## 팀원

- 백엔드: [README-jeongyounghyeon.md](README-jeongyounghyeon.md)
- AI: [README_kwon.md](README_kwon.md)

## 문의

문제가 있거나 기능 요청이 있으시면 이슈를 등록해주세요.

---

**마지막 업데이트**: 2025-11-02
