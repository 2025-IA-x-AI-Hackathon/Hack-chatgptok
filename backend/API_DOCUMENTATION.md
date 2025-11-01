# Backend API Documentation

## 기본 정보

### Base URL
```
http://52.78.124.23:4000/api/v1
```

### 공통 헤더
```json
{
  "Content-Type": "application/json"
}
```

### 인증
- 세션 기반 인증 사용 (쿠키)
- 인증이 필요한 API는 로그인 후 자동으로 세션 쿠키가 전송됩니다
- 로그인하지 않은 상태에서 인증이 필요한 API 호출 시 401 에러 반환

### 공통 에러 응답
```json
{
  "error": "에러 메시지"
}
```

**HTTP 상태 코드**
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 필요 (로그인 필요)
- `403`: 권한 없음
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 에러
- `501`: 아직 구현되지 않음

---

## 1. 헬스 체크

### GET /health
서버 상태를 확인합니다.

**인증 필요**: ❌

**요청 예시**
```bash
curl http://52.78.124.23:4000/api/v1/health
```

**응답 예시**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 2. 인증 (Auth)

### POST /auth/signup
새로운 회원을 등록합니다.

**인증 필요**: ❌

**요청 바디**
```json
{
  "email": "user@example.com",
  "password": "password123!",
  "nickname": "사용자닉네임",
  "img": "https://example.com/profile.jpg"  // optional
}
```

**필드 설명**
- `email` (required): 이메일 주소 (최대 100자, 중복 불가)
- `password` (required): 비밀번호 (암호화되어 저장됨)
- `nickname` (required): 닉네임 (최대 30자, 중복 불가)
- `img` (optional): 프로필 이미지 URL (최대 255자)

**성공 응답 예시** (예상)
```json
{
  "message": "회원가입이 완료되었습니다",
  "user": {
    "member_id": 1,
    "email": "user@example.com",
    "nickname": "사용자닉네임",
    "img": "https://example.com/profile.jpg",
    "created_at": "2024-11-01T12:00:00.000Z"
  }
}
```

**에러 응답 예시**
```json
{
  "error": "이미 사용 중인 이메일입니다"
}
```

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

### POST /auth/login
로그인합니다.

**인증 필요**: ❌

**요청 바디**
```json
{
  "email": "user@example.com",
  "password": "password123!"
}
```

**성공 응답 예시** (예상)
```json
{
  "message": "로그인 성공",
  "user": {
    "member_id": 1,
    "email": "user@example.com",
    "nickname": "사용자닉네임",
    "img": "https://example.com/profile.jpg"
  }
}
```

**참고사항**
- 로그인 성공 시 세션 쿠키가 자동으로 설정됩니다
- 이후 API 요청 시 자동으로 인증됩니다

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

### POST /auth/logout
로그아웃합니다.

**인증 필요**: ✅

**요청 예시**
```bash
curl -X POST http://52.78.124.23:4000/api/v1/auth/logout \
  -H "Cookie: session_cookie_here"
```

**성공 응답 예시** (예상)
```json
{
  "message": "로그아웃되었습니다"
}
```

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

## 3. 사용자 (User)

### GET /users/profile
현재 로그인한 사용자의 프로필 정보를 조회합니다.

**인증 필요**: ✅

**요청 예시**
```bash
curl http://52.78.124.23:4000/api/v1/users/profile \
  -H "Cookie: session_cookie_here"
```

**성공 응답 예시** (예상)
```json
{
  "member_id": 1,
  "email": "user@example.com",
  "nickname": "사용자닉네임",
  "img": "https://example.com/profile.jpg",
  "created_at": "2024-11-01T12:00:00.000Z",
  "updated_at": "2024-11-01T12:00:00.000Z"
}
```

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

### PUT /users/profile
현재 로그인한 사용자의 프로필 정보를 수정합니다.

**인증 필요**: ✅

**요청 바디**
```json
{
  "nickname": "새로운닉네임",  // optional
  "password": "newPassword123!",  // optional
  "img": "https://example.com/new-profile.jpg"  // optional
}
```

**필드 설명**
- 수정하고 싶은 필드만 포함하면 됩니다
- `nickname`: 새로운 닉네임 (중복 불가)
- `password`: 새로운 비밀번호
- `img`: 새로운 프로필 이미지 URL

**성공 응답 예시** (예상)
```json
{
  "message": "프로필이 수정되었습니다",
  "user": {
    "member_id": 1,
    "email": "user@example.com",
    "nickname": "새로운닉네임",
    "img": "https://example.com/new-profile.jpg",
    "updated_at": "2024-11-01T13:00:00.000Z"
  }
}
```

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

## 4. 상품 (Product)

### GET /products
상품 목록을 조회합니다. (전체 상품 리스트)

**인증 필요**: ❌

**쿼리 파라미터** (예상)
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 20)
- `status` (optional): 상품 상태 필터 (ACTIVE, SOLD)
- `search` (optional): 검색 키워드 (상품명으로 검색)
- `sort` (optional): 정렬 기준 (latest, popular, price_low, price_high)

**요청 예시**
```bash
curl "http://52.78.124.23:4000/api/v1/products?page=1&limit=20&status=ACTIVE&sort=latest"
```

**성공 응답 예시** (예상)
```json
{
  "products": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "상품명",
      "price": 50000,
      "description": "상품 설명...",
      "sell_status": "ACTIVE",
      "ply_url": "https://example.com/model.ply",
      "view_cnt": 150,
      "likes_cnt": 23,
      "created_at": "2024-11-01T12:00:00.000Z",
      "updated_at": "2024-11-01T12:00:00.000Z",
      "seller": {
        "member_id": 1,
        "nickname": "판매자닉네임",
        "img": "https://example.com/profile.jpg"
      },
      "images": [
        {
          "image_id": 1,
          "s3_url": "https://s3.amazonaws.com/...",
          "sort_order": 1
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "total_pages": 5
  }
}
```

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

### GET /products/:productId
특정 상품의 상세 정보를 조회합니다.

**인증 필요**: ❌

**URL 파라미터**
- `productId`: 상품 UUID

**요청 예시**
```bash
curl http://52.78.124.23:4000/api/v1/products/550e8400-e29b-41d4-a716-446655440000
```

**성공 응답 예시** (예상)
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "상품명",
  "price": 50000,
  "description": "상품 설명...",
  "sell_status": "ACTIVE",
  "job_count": 0,
  "ply_url": "https://example.com/model.ply",
  "view_cnt": 151,
  "likes_cnt": 23,
  "created_at": "2024-11-01T12:00:00.000Z",
  "updated_at": "2024-11-01T12:00:00.000Z",
  "seller": {
    "member_id": 1,
    "nickname": "판매자닉네임",
    "img": "https://example.com/profile.jpg"
  },
  "images": [
    {
      "image_id": 1,
      "s3_url": "https://s3.amazonaws.com/image1.jpg",
      "sort_order": 1
    },
    {
      "image_id": 2,
      "s3_url": "https://s3.amazonaws.com/image2.jpg",
      "sort_order": 2
    }
  ],
  "fault_description": {
    "markdown": "# 결함 분석 결과\n\n...",
    "status": "DONE",
    "completed_at": "2024-11-01T12:30:00.000Z"
  },
  "job_3dgs": {
    "status": "DONE",
    "completed_at": "2024-11-01T13:00:00.000Z"
  }
}
```

**참고사항**
- 조회 시 `view_cnt` (조회수)가 1 증가합니다
- `fault_description`과 `job_3dgs`는 상태에 따라 달라질 수 있습니다

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

### POST /products
새로운 상품을 등록합니다.

**인증 필요**: ✅

**요청 바디** (multipart/form-data 예상)
```json
{
  "name": "상품명",
  "price": 50000,
  "description": "상품 설명...",
  "images": ["이미지 파일 15~25장"]
}
```

**필드 설명**
- `name` (required): 상품명 (최대 80자)
- `price` (required): 가격 (원)
- `description` (optional): 상품 설명
- `images` (required): 상품 이미지 파일들 (15~25장)

**성공 응답 예시** (예상)
```json
{
  "message": "상품이 등록되었습니다",
  "product": {
    "product_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "상품명",
    "price": 50000,
    "description": "상품 설명...",
    "sell_status": "DRAFT",
    "job_count": 0,
    "created_at": "2024-11-01T12:00:00.000Z"
  }
}
```

**참고사항**
- 상품 등록 시 초기 상태는 `DRAFT`입니다
- 이미지 업로드 후 AI 상품 설명 자동 생성이 큐에 등록됩니다
- 3DGS 작업도 큐에 등록됩니다
- 두 작업이 모두 완료되면 상태가 `ACTIVE`로 변경됩니다

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

### PUT /products/:productId
상품 정보를 수정합니다.

**인증 필요**: ✅ (본인의 상품만 수정 가능)

**URL 파라미터**
- `productId`: 상품 UUID

**요청 바디**
```json
{
  "name": "수정된 상품명",  // optional
  "price": 60000,  // optional
  "description": "수정된 상품 설명...",  // optional
  "sell_status": "SOLD"  // optional
}
```

**성공 응답 예시** (예상)
```json
{
  "message": "상품이 수정되었습니다",
  "product": {
    "product_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "수정된 상품명",
    "price": 60000,
    "description": "수정된 상품 설명...",
    "sell_status": "SOLD",
    "updated_at": "2024-11-01T13:00:00.000Z"
  }
}
```

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

### DELETE /products/:productId
상품을 삭제합니다. (soft delete - 상태를 DELETED로 변경)

**인증 필요**: ✅ (본인의 상품만 삭제 가능)

**URL 파라미터**
- `productId`: 상품 UUID

**요청 예시**
```bash
curl -X DELETE http://52.78.124.23:4000/api/v1/products/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: session_cookie_here"
```

**성공 응답 예시** (예상)
```json
{
  "message": "상품이 삭제되었습니다"
}
```

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

### GET /my-products
현재 로그인한 사용자의 판매 내역을 조회합니다.

**인증 필요**: ✅

**쿼리 파라미터** (예상)
- `status` (optional): 상품 상태 필터 (DRAFT, ACTIVE, SOLD, DELETED)
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 20)

**요청 예시**
```bash
curl "http://52.78.124.23:4000/api/v1/my-products?status=ACTIVE&page=1&limit=20" \
  -H "Cookie: session_cookie_here"
```

**성공 응답 예시** (예상)
```json
{
  "products": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "내 상품명",
      "price": 50000,
      "sell_status": "ACTIVE",
      "view_cnt": 150,
      "likes_cnt": 23,
      "created_at": "2024-11-01T12:00:00.000Z",
      "images": [
        {
          "image_id": 1,
          "s3_url": "https://s3.amazonaws.com/...",
          "sort_order": 1
        }
      ],
      "fault_description": {
        "status": "DONE"
      },
      "job_3dgs": {
        "status": "DONE"
      }
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

**참고사항**
- 자신이 등록한 상품만 조회됩니다
- 상태별로 필터링할 수 있습니다 (DRAFT, ACTIVE, SOLD, DELETED)

**현재 상태**: 🚧 구현 중 (501 에러 반환)

---

## 5. 향후 추가 예정 API

아래 API들은 데이터베이스 스키마는 준비되어 있지만 아직 라우트가 구현되지 않았습니다.

### 좋아요 기능
- **POST /products/:productId/like** - 상품 좋아요 추가
- **DELETE /products/:productId/like** - 상품 좋아요 취소
- **GET /my-likes** - 내가 좋아요한 상품 목록

### 채팅 기능
- **GET /chats** - 채팅방 목록
- **GET /chats/:roomId** - 특정 채팅방의 메시지 목록
- **POST /chats/:roomId/messages** - 메시지 전송
- **PUT /chats/:roomId/read** - 메시지 읽음 처리

### 알림 기능
- **GET /notifications** - 알림 목록
- **PUT /notifications/:notifId/read** - 알림 읽음 처리
- **DELETE /notifications/:notifId** - 알림 삭제

### AI 및 3DGS 작업 상태 조회
- **GET /products/:productId/fault-description** - AI 결함 분석 상태 조회
- **GET /products/:productId/3dgs-job** - 3DGS 작업 상태 조회

---

## 데이터베이스 스키마 참고

### 상품 상태 (sell_status)
- `DRAFT`: 작성 중 (AI 분석 및 3DGS 작업 진행 중)
- `ACTIVE`: 판매 중
- `DELETED`: 삭제됨
- `SOLD`: 판매 완료

### AI 결함 분석 상태 (fault_description.status)
- `QUEUED`: 대기 중
- `RUNNING`: 실행 중
- `DONE`: 완료
- `FAILED`: 실패

### 3DGS 작업 상태 (job_3dgs.status)
- `QUEUED`: 대기 중
- `RUNNING`: 실행 중
- `DONE`: 완료
- `FAILED`: 실패

---

## 보안 및 제한사항

### Rate Limiting
- API 호출 제한이 적용되어 있습니다
- 제한 초과 시 429 Too Many Requests 에러 반환

### CORS
- 허용된 Origin: `http://52.78.124.23:3000`
- 쿠키 전송이 활성화되어 있습니다

### 파일 업로드
- 정적 파일은 `/public` 경로에서 제공됩니다
- 프로필 이미지: `/public/uploads/profiles/`
- 상품 이미지: `/public/uploads/posts/`

### 보안 헤더
- Helmet.js를 통한 보안 헤더 적용
- CSP (Content Security Policy) 적용됨

---

## 개발 참고사항

### 로컬 개발 환경
```bash
# 백엔드 서버 실행
cd backend
npm run dev
```

### 환경 변수
백엔드는 다음 환경 변수가 필요합니다:
- `PORT`: 서버 포트 (기본값: 4000)
- 데이터베이스 연결 정보
- AWS S3 자격 증명 (이미지 업로드용)
- 세션 시크릿 키

### API 테스트
현재 대부분의 API가 구현 중이므로 호출 시 `501 Not implemented yet` 응답을 받게 됩니다.

---

## 문의 및 이슈

API 관련 문의사항이나 버그 발견 시 백엔드 팀에 연락해주세요.

**마지막 업데이트**: 2024-11-01
**API 버전**: v1
