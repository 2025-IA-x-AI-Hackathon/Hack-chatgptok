# Hack-chatgptok: 스마트 중고 거래 플랫폼

![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)

**Hack-chatgptok**은 2025 IA x AI 해커톤에서 개발된 **AI 기반 스마트 중고 거래 플랫폼**입니다. 
상품을 촬영하면 자동으로 설명과 3D 모델을 생성하는 혁신적인 플랫폼입니다.

> 사진 한 장으로 시작하는 스마트한 중고 거래!

---

## 기능 데모

### 상품 목록 페이지
사용자는 등록된 중고 상품들을 한눈에 볼 수 있는 그리드 형식의 목록 페이지에서:
- 상품을 카테고리별로 필터링
- 가격대별 검색
- 지역별 상품 조회
- 관심 상품(위시리스트) 저장

<video width="100%" controls style="max-width: 800px; border-radius: 8px; margin: 20px 0;">
  <source src="./docs/상품_목록.mov" type="video/quicktime">
  <p>상품 목록 데모 영상입니다. 브라우저에서 지원하지 않으면 <a href="./docs/상품%20목록.mov">여기를 클릭</a>하여 다운로드하세요.</p>
</video>

### 상품 상세 페이지
개별 상품을 클릭하면 상세한 정보를 확인할 수 있습니다:
- 다중 이미지 갤러리
- AI가 생성한 상품 설명
- 판매자 정보 및 평점
- 판매자와 실시간 채팅
- 3D 모델 뷰어 (Gaussian Splatting)

<video width="100%" controls style="max-width: 800px; border-radius: 8px; margin: 20px 0;">
  <source src="./docs/상품_상세.mov" type="video/quicktime">
  <p>상품 상세 데모 영상입니다. 브라우저에서 지원하지 않으면 <a href="./docs/상품%20상세.mov">여기를 클릭</a>하여 다운로드하세요.</p>
</video>

---

## 프로젝트 개요

### 핵심 기능

- **이미지 기반 상품 분석**: 상품 사진으로부터 자동 설명 생성 (Google Gemini AI)
- **3D 모델 생성**: Gaussian Splatting을 활용한 3D 시각화
- **실시간 채팅**: WebSocket 기반 구매자-판매자 실시간 소통
- **위시리스트**: 관심 상품 저장 및 관리
- **보안 인증**: JWT 토큰 기반 사용자 인증
- **클라우드 스토리지**: AWS S3 이미지 호스팅
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **다크모드**: 자동 테마 전환 지원

## 프로젝트 구조

```
Hack-chatgptok/
├── frontend/              # React/Next.js 프론트엔드
│   ├── app/                 # Next.js App Router
│   ├── components/          # React 컴포넌트
│   ├── lib/                 # API 클라이언트, 타입 정의
│   ├── public/              # 정적 자산
│   ├── Dockerfile           # 프론트엔드 Docker 이미지
│   └── package.json         # 의존성 관리
│
├── backend/               # Express.js REST API
│   ├── src/
│   │   ├── app.js           # Express 앱 설정
│   │   ├── controllers/     # 비즈니스 로직
│   │   ├── models/          # 데이터 모델
│   │   ├── routes/          # API 라우트
│   │   ├── middleware/      # 미들웨어 (인증, CORS 등)
│   │   ├── config/          # 설정 파일
│   │   ├── socket/          # WebSocket 채팅
│   │   └── utils/           # 유틸리티 함수
│   ├── sql/                 # 데이터베이스 스키마
│   ├── public/              # 업로드 파일 저장
│   ├── Dockerfile           # 백엔드 Docker 이미지
│   ├── Makefile             # Docker 명령어
│   └── package.json
│
├── description_ai/        # 상품 설명 생성 (Google Gemini)
│   ├── app/
│   │   ├── api/             # FastAPI 라우트
│   │   ├── services/        # AI 처리 로직
│   │   ├── db/              # 데이터베이스 연결
│   │   └── schemas/         # Pydantic 스키마
│   ├── main.py              # 애플리케이션 진입점
│   └── requirements.txt      # Python 의존성
│
├── gaussian_ai/           # 3D 모델 생성 (Gaussian Splatting)
│   ├── app/
│   │   ├── api/             # FastAPI 라우트
│   │   ├── core/            # 3D 처리 로직
│   │   ├── services/        # 서비스 계층
│   │   └── schemas/         # Pydantic 스키마
│   ├── viewer/              # 3D 뷰어 웹 인터페이스
│   ├── static/              # HTML 데모 파일
│   ├── scripts/             # 전처리 스크립트
│   ├── main.py              # 애플리케이션 진입점
│   └── requirements.txt      # Python 의존성
│
├── init.sql              # 데이터베이스 초기화
├── sample_data.sql       # 테스트 데이터
└── README.md             # 본 파일
```

## 기술 스택

### 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 16.0 | 풀스택 React 프레임워크 |
| **React** | 19.2 | UI 라이브러리 |
| **TypeScript** | 5 | 정적 타입 지정 |
| **Tailwind CSS** | 4 | 스타일링 |
| **shadcn/ui** | - | UI 컴포넌트 라이브러리 |
| **socket.io-client** | 4.8 | 실시간 통신 |
| **TanStack Query** | 5.90 | 상태 관리 |
| **React Hook Form** | 7.66 | 폼 관리 |
| **Zod** | 4.1 | 스키마 검증 |

### 백엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| **Express.js** | 4.21 | REST API 프레임워크 |
| **Node.js** | 20+ | JavaScript 런타임 |
| **MySQL** | 8.0 | 데이터베이스 |
| **socket.io** | 4.8 | 실시간 양방향 통신 |
| **JWT** | - | 인증 토큰 |
| **AWS S3** | - | 이미지 호스팅 |
| **Bcrypt** | 6.0 | 비밀번호 암호화 |

### AI 모듈
| 기술 | 용도 |
|------|------|
| **FastAPI** | Python 웹 프레임워크 |
| **Google Generative AI** | 상품 설명 자동 생성 |
| **PyTorch** | 3D 모델 처리 |
| **Gaussian Splatting** | 3D 시각화 |
| **COLMAP** | 3D 이미지 프로세싱 |

## 빠른 시작

### 전제 조건

- **Docker & Docker Compose** (권장)
- 또는 다음 설치:
  - Node.js 20+
  - Python 3.11+
  - MySQL 8.0+

### Docker Compose로 실행 (권장)

```bash
# 1. 저장소 클론
git clone https://github.com/2025-IA-x-AI-Hackathon/Hack-chatgptok.git
cd Hack-chatgptok

# 2. 환경 설정
cp .env.example .env
# .env 파일 편집 (API 키 등 설정)

# 3. 전체 스택 실행
docker-compose up -d

# 4. 브라우저에서 접속
# 프론트엔드: http://localhost:3000
# 백엔드: http://localhost:8000
# 설명 AI: http://localhost:8001
# 3D AI: http://localhost:8002
```

### 로컬 개발 환경

#### 1) 데이터베이스 설정

```bash
# MySQL 시작
mysql -u root -p < init.sql

# 샘플 데이터 로드
mysql -u root -p < sample_data.sql
```

#### 2) 백엔드 실행

```bash
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 개발 서버 실행
npm run dev
# 또는 Docker로 실행
make build
make run
```

#### 3) 프론트엔드 실행

```bash
cd frontend

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

#### 4) AI 서비스 실행

**상품 설명 생성 서비스:**
```bash
cd description_ai

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python main.py
# 접속: http://localhost:8001
```

**3D 모델 생성 서비스:**
```bash
cd gaussian_ai

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python main.py
# 접속: http://localhost:8002
```

## 주요 기능 설명

### 1️⃣ 상품 관리

#### 상품 등록
1. 프론트엔드에서 상품 사진 업로드
2. 백엔드에서 AWS S3에 저장
3. Google Gemini AI가 상품 설명 자동 생성
4. 3D Gaussian Splatting으로 3D 모델 생성

```bash
# API 예시
POST /api/products
{
  "title": "아이폰 15 Pro",
  "price": 1300000,
  "location": "서울 강남구",
  "images": ["s3://bucket/image.jpg"],
  "description": "AI가 생성한 설명"
}
```

### 2️⃣ 실시간 채팅

WebSocket을 통한 구매자-판매자 간 실시간 메시지 전송

```typescript
// 프론트엔드 사용
import { chatSocket } from '@/lib/chatSocket';

// 메시지 수신
chatSocket.on('new_message', (message) => {
  console.log(message);
});

// 메시지 전송
chatSocket.emit('send_message', {
  roomId: 'room-123',
  content: '이 상품 판매하시나요?'
});
```

### 3️⃣ AI 기반 상품 분석

#### Google Gemini를 이용한 상품 설명 생성
```python
# description_ai/app/services/ai_service.py
def generate_description(image_path: str) -> str:
    """
    상품 이미지로부터 AI가 상품 설명을 자동 생성
    """
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            image,
            "이 상품을 판매용 설명으로 작성해주세요. "
            "상품의 상태, 특징, 사용 조건 등을 포함해주세요."
        ]
    )
    return response.text
```

#### Gaussian Splatting을 이용한 3D 모델 생성
```python
# gaussian_ai/app/core/3d_processor.py
def process_images_to_3d(image_paths: List[str]) -> str:
    """
    여러 각도의 상품 이미지로부터 3D 모델 생성
    - COLMAP으로 구조 복원
    - Gaussian Splatting으로 3D 메시 생성
    """
    # 처리 과정
    return "model_output.ply"
```

## API 문서

### 백엔드 REST API

#### 상품 API
```bash
# 상품 목록 조회
GET /api/products?page=1&limit=20

# 상품 상세 조회
GET /api/products/:id

# 상품 등록
POST /api/products

# 상품 수정
PUT /api/products/:id

# 상품 삭제
DELETE /api/products/:id
```

#### 사용자 API
```bash
# 회원가입
POST /api/auth/register

# 로그인
POST /api/auth/login

# 로그아웃
POST /api/auth/logout

# 프로필 조회
GET /api/users/:id

# 프로필 수정
PUT /api/users/:id
```

#### 채팅 API
```bash
# 채팅방 생성
POST /api/chat/rooms

# 채팅방 목록
GET /api/chat/rooms

# 메시지 조회
GET /api/chat/rooms/:roomId/messages

# 메시지 전송 (WebSocket)
WS /socket.io/
```

### AI 서비스 API

#### 상품 설명 생성
```bash
POST /api/descriptions/generate
Content-Type: multipart/form-data

# 응답
{
  "description": "AI가 생성한 상품 설명",
  "confidence": 0.95,
  "category": "Electronics"
}
```

#### 3D 모델 생성
```bash
POST /api/3d/generate
Content-Type: multipart/form-data

# 응답
{
  "model_url": "s3://bucket/model.ply",
  "preview_url": "s3://bucket/preview.png",
  "processing_time": 45
}
```

## Docker 배포

### 개별 서비스 배포

#### 백엔드
```bash
cd backend

# 빌드
make build

# 실행
make run

# 재배포
make deploy

# 중지
make stop

# 로그 확인
make logs
```

#### 프론트엔드
```bash
cd frontend

# 빌드
docker build -t hack-chatgptok-frontend .

# 실행
docker run -p 3000:3000 hack-chatgptok-frontend
```

### 전체 스택 배포

```bash
# 루트 디렉토리에서
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

## 데이터베이스 스키마

### 주요 테이블

```sql
-- 사용자
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 상품
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  description TEXT,
  location VARCHAR(255),
  status ENUM('active', 'sold', 'deleted'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 채팅방
CREATE TABLE chat_rooms (
  id VARCHAR(36) PRIMARY KEY,
  product_id INT NOT NULL,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- 메시지
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id VARCHAR(36) NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 보안 기능

- ✅ **JWT 기반 인증**: 토큰으로 사용자 인증
- ✅ **Bcrypt 비밀번호 암호화**: 안전한 비밀번호 저장
- ✅ **CORS 설정**: 허용된 도메인만 접근
- ✅ **Rate Limiting**: API 요청 제한
- ✅ **Helmet.js**: HTTP 보안 헤더
- ✅ **SQL Injection 방지**: 매개변수화된 쿼리
- ✅ **HTTPS**: 프로덕션 환경에서 필수

## 테스트

### 백엔드 테스트
```bash
cd backend
npm test
```

### 프론트엔드 테스트
```bash
cd frontend
pnpm test
```

## 문제 해결

### 자주 묻는 질문

**Q: Docker가 메모리 부족 에러를 발생시킵니다.**
```bash
# Docker 메모리 할당 증가
# Docker Desktop > Preferences > Resources
# Memory: 4GB 이상 권장
```

**Q: MySQL 연결이 거부됩니다.**
```bash
# MySQL 포트 3306이 사용 중인지 확인
lsof -i :3306

# MySQL 재시작
docker-compose restart db
```

**Q: AI 서비스가 응답하지 않습니다.**
```bash
# 환경 변수 확인
echo $GOOGLE_API_KEY
echo $GEMINI_API_KEY

# 서비스 로그 확인
docker logs description_ai
docker logs gaussian_ai
```

## 라이선스

ISC License - 자세한 내용은 LICENSE 파일 참조

## 감사의 말

- 2025 IA x AI Hackathon 주최 기관
- Google Gemini API 제공자
- shadcn/ui 및 오픈소스 커뮤니티

---

**마지막 업데이트**: 2025년 11월 2일  
**프로젝트 상태**: 🔄 진행 중
