# API 명세서

프론트엔드에서 백엔드로 요청하는 API 엔드포인트 명세입니다.

## Base URL
```
http://localhost:8000/api
```

---

## 1. 상품 (Products)

### 1.1 상품 목록 조회
상품 목록을 페이지네이션과 함께 조회합니다.

**Endpoint**
```
GET /products
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|---------|------|------|------|--------|
| page | number | X | 페이지 번호 | 1 |
| limit | number | X | 페이지당 항목 수 | 20 |
| sort | string | X | 정렬 기준 (latest, popular, price_low, price_high) | latest |

**Request Example**
```bash
GET /products?page=1&limit=20&sort=latest
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "title": "아이폰 15 Pro Max 256GB 블루티타늄",
        "price": 1350000,
        "thumbnail": "https://example.com/images/product1.jpg",
        "likes": 24,
        "views": 342,
        "location": "서울 강남구 역삼동",
        "createdAt": "2025-11-01T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

---

### 1.2 상품 상세 조회
특정 상품의 상세 정보를 조회합니다.

**Endpoint**
```
GET /products/:id
```

**Path Parameters**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | number | 상품 ID |

**Request Example**
```bash
GET /products/1
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "아이폰 15 Pro Max 256GB 블루티타늄",
    "price": 1350000,
    "description": "아이폰 15 Pro Max 256GB 블루티타늄 판매합니다.\n\n작년 11월에 구매했고...",
    "thumbnail": "https://example.com/images/product1.jpg",
    "images": [
      "https://example.com/images/product1-1.jpg",
      "https://example.com/images/product1-2.jpg",
      "https://example.com/images/product1-3.jpg"
    ],
    "likes": 24,
    "views": 342,
    "location": "서울 강남구 역삼동",
    "seller": {
      "id": 101,
      "name": "신뢰판매자",
      "location": "역삼동",
      "profileImage": "https://example.com/profiles/user101.jpg"
    },
    "createdAt": "2025-11-01T10:30:00Z",
    "updatedAt": "2025-11-01T10:30:00Z"
  }
}
```

**Response 404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "상품을 찾을 수 없습니다."
  }
}
```

---

### 1.3 상품 등록
새로운 상품을 등록합니다.

**Endpoint**
```
POST /products
```

**Headers**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Request Body**
```json
{
  "title": "아이폰 15 Pro Max 256GB 블루티타늄",
  "price": 1350000,
  "description": "아이폰 15 Pro Max 256GB 블루티타늄 판매합니다.\n\n작년 11월에 구매했고...",
  "location": "서울 강남구 역삼동",
  "images": [
    "https://example.com/uploads/temp/image1.jpg",
    "https://example.com/uploads/temp/image2.jpg"
  ]
}
```

**Request Body Schema**
| 필드 | 타입 | 필수 | 제약사항 | 설명 |
|------|------|------|----------|------|
| title | string | O | 최대 100자 | 상품 제목 |
| price | number | O | 0 이상 | 상품 가격 |
| description | string | O | 최대 2000자 | 상품 설명 |
| location | string | O | - | 거래 지역 |
| images | string[] | O | 1~10개 | 이미지 URL 배열 (첫번째가 대표 이미지) |

**Response 201 Created**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "아이폰 15 Pro Max 256GB 블루티타늄",
    "price": 1350000,
    "description": "아이폰 15 Pro Max 256GB 블루티타늄 판매합니다...",
    "location": "서울 강남구 역삼동",
    "thumbnail": "https://example.com/images/product123.jpg",
    "images": [
      "https://example.com/images/product123-1.jpg",
      "https://example.com/images/product123-2.jpg"
    ],
    "seller": {
      "id": 101,
      "name": "신뢰판매자",
      "location": "역삼동",
      "profileImage": "https://example.com/profiles/user101.jpg"
    },
    "createdAt": "2025-11-01T12:00:00Z"
  }
}
```

**Response 400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      {
        "field": "title",
        "message": "제목은 필수입니다."
      },
      {
        "field": "images",
        "message": "이미지는 최소 1개 이상 필요합니다."
      }
    ]
  }
}
```

**Response 401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증이 필요합니다."
  }
}
```

---

### 1.4 상품 수정
기존 상품 정보를 수정합니다.

**Endpoint**
```
PUT /products/:id
```

**Headers**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Path Parameters**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | number | 상품 ID |

**Request Body**
```json
{
  "title": "아이폰 15 Pro Max 256GB 블루티타늄 (가격인하)",
  "price": 1250000,
  "description": "가격 인하했습니다!\n\n아이폰 15 Pro Max...",
  "location": "서울 강남구 역삼동",
  "images": [
    "https://example.com/images/product1-1.jpg",
    "https://example.com/images/product1-2.jpg"
  ]
}
```

**Request Body Schema**
| 필드 | 타입 | 필수 | 제약사항 | 설명 |
|------|------|------|----------|------|
| title | string | O | 최대 100자 | 상품 제목 |
| price | number | O | 0 이상 | 상품 가격 |
| description | string | O | 최대 2000자 | 상품 설명 |
| location | string | O | - | 거래 지역 |
| images | string[] | O | 1~10개 | 이미지 URL 배열 |

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "아이폰 15 Pro Max 256GB 블루티타늄 (가격인하)",
    "price": 1250000,
    "description": "가격 인하했습니다!...",
    "location": "서울 강남구 역삼동",
    "thumbnail": "https://example.com/images/product1.jpg",
    "images": [
      "https://example.com/images/product1-1.jpg",
      "https://example.com/images/product1-2.jpg"
    ],
    "updatedAt": "2025-11-01T13:00:00Z"
  }
}
```

**Response 403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "본인의 상품만 수정할 수 있습니다."
  }
}
```

**Response 404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "상품을 찾을 수 없습니다."
  }
}
```

---

### 1.5 상품 삭제
상품을 삭제합니다.

**Endpoint**
```
DELETE /products/:id
```

**Headers**
```
Authorization: Bearer {access_token}
```

**Path Parameters**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | number | 상품 ID |

**Request Example**
```bash
DELETE /products/1
```

**Response 200 OK**
```json
{
  "success": true,
  "message": "상품이 삭제되었습니다."
}
```

**Response 403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "본인의 상품만 삭제할 수 있습니다."
  }
}
```

**Response 404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "상품을 찾을 수 없습니다."
  }
}
```

---

## 2. 좋아요 (Likes)

### 2.1 좋아요 추가
상품에 좋아요를 추가합니다.

**Endpoint**
```
POST /products/:id/like
```

**Headers**
```
Authorization: Bearer {access_token}
```

**Path Parameters**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | number | 상품 ID |

**Request Example**
```bash
POST /products/1/like
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "productId": 1,
    "likes": 25,
    "isLiked": true
  }
}
```

---

### 2.2 좋아요 취소
상품의 좋아요를 취소합니다.

**Endpoint**
```
DELETE /products/:id/like
```

**Headers**
```
Authorization: Bearer {access_token}
```

**Path Parameters**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | number | 상품 ID |

**Request Example**
```bash
DELETE /products/1/like
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "productId": 1,
    "likes": 24,
    "isLiked": false
  }
}
```

---

## 3. 이미지 업로드 (Upload)

### 3.1 이미지 업로드
상품 이미지를 업로드합니다. (등록/수정 전 임시 업로드)

**Endpoint**
```
POST /upload/image
```

**Headers**
```
Content-Type: multipart/form-data
Authorization: Bearer {access_token}
```

**Request Body (Form Data)**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| image | file | O | 이미지 파일 (jpg, jpeg, png, webp) |

**Request Example**
```bash
POST /upload/image
Content-Type: multipart/form-data

image: [binary file data]
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/uploads/temp/abc123def456.jpg",
    "filename": "abc123def456.jpg",
    "size": 245760,
    "mimeType": "image/jpeg"
  }
}
```

**Response 400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "jpg, jpeg, png, webp 파일만 업로드 가능합니다."
  }
}
```

**파일 제약사항**
- 허용 형식: jpg, jpeg, png, webp
- 최대 크기: 10MB
- 이미지 최대 해상도: 4000x4000

---

## 4. 인증 (Auth)

### 4.1 로그인
사용자 로그인

**Endpoint**
```
POST /auth/login
```

**Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 101,
      "email": "user@example.com",
      "name": "신뢰판매자",
      "profileImage": "https://example.com/profiles/user101.jpg",
      "location": "역삼동"
    }
  }
}
```

**Response 401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

---

### 4.2 회원가입
새 사용자 등록

**Endpoint**
```
POST /auth/register
```

**Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "홍길동",
  "location": "서울 강남구 역삼동"
}
```

**Request Body Schema**
| 필드 | 타입 | 필수 | 제약사항 | 설명 |
|------|------|------|----------|------|
| email | string | O | 이메일 형식 | 이메일 |
| password | string | O | 최소 8자 | 비밀번호 |
| name | string | O | 2~20자 | 이름 |
| location | string | O | - | 지역 |

**Response 201 Created**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 102,
      "email": "newuser@example.com",
      "name": "홍길동",
      "location": "서울 강남구 역삼동"
    }
  }
}
```

**Response 400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "이미 사용 중인 이메일입니다."
  }
}
```

---

### 4.3 토큰 갱신
Access Token 갱신

**Endpoint**
```
POST /auth/refresh
```

**Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4.4 로그아웃
사용자 로그아웃 (토큰 무효화)

**Endpoint**
```
POST /auth/logout
```

**Headers**
```
Authorization: Bearer {access_token}
```

**Response 200 OK**
```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

---

## 5. 채팅 (Chat)

### 5.1 채팅방 생성
상품에 대한 채팅방 생성

**Endpoint**
```
POST /chat/rooms
```

**Headers**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Request Body**
```json
{
  "productId": 1
}
```

**Response 201 Created**
```json
{
  "success": true,
  "data": {
    "roomId": "room-abc123",
    "productId": 1,
    "seller": {
      "id": 101,
      "name": "신뢰판매자",
      "profileImage": "https://example.com/profiles/user101.jpg"
    },
    "buyer": {
      "id": 102,
      "name": "구매자",
      "profileImage": "https://example.com/profiles/user102.jpg"
    },
    "createdAt": "2025-11-01T14:00:00Z"
  }
}
```

---

### 5.2 채팅방 목록 조회
사용자의 채팅방 목록

**Endpoint**
```
GET /chat/rooms
```

**Headers**
```
Authorization: Bearer {access_token}
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "roomId": "room-abc123",
        "product": {
          "id": 1,
          "title": "아이폰 15 Pro Max",
          "thumbnail": "https://example.com/images/product1.jpg",
          "price": 1350000
        },
        "otherUser": {
          "id": 101,
          "name": "신뢰판매자",
          "profileImage": "https://example.com/profiles/user101.jpg"
        },
        "lastMessage": {
          "content": "안녕하세요, 아직 판매중이신가요?",
          "createdAt": "2025-11-01T14:30:00Z",
          "isRead": false
        },
        "unreadCount": 3
      }
    ]
  }
}
```

---

### 5.3 채팅 메시지 조회
채팅방의 메시지 목록

**Endpoint**
```
GET /chat/rooms/:roomId/messages
```

**Headers**
```
Authorization: Bearer {access_token}
```

**Path Parameters**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| roomId | string | 채팅방 ID |

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| page | number | X | 페이지 번호 |
| limit | number | X | 메시지 개수 (기본 50) |

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-123",
        "senderId": 102,
        "content": "안녕하세요, 아직 판매중이신가요?",
        "createdAt": "2025-11-01T14:30:00Z",
        "isRead": true
      },
      {
        "id": "msg-124",
        "senderId": 101,
        "content": "네, 판매중입니다!",
        "createdAt": "2025-11-01T14:31:00Z",
        "isRead": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 2
    }
  }
}
```

---

### 5.4 메시지 전송
채팅 메시지 전송

**Endpoint**
```
POST /chat/rooms/:roomId/messages
```

**Headers**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Path Parameters**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| roomId | string | 채팅방 ID |

**Request Body**
```json
{
  "content": "네고 가능할까요?"
}
```

**Response 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "msg-125",
    "senderId": 102,
    "content": "네고 가능할까요?",
    "createdAt": "2025-11-01T14:35:00Z",
    "isRead": false
  }
}
```

---

## 공통 에러 응답

모든 API는 다음과 같은 공통 에러 형식을 따릅니다.

**에러 응답 형식**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": []
  }
}
```

**공통 HTTP 상태 코드**
| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 에러 |

**공통 에러 코드**
| 코드 | 설명 |
|------|------|
| VALIDATION_ERROR | 입력값 검증 실패 |
| UNAUTHORIZED | 인증되지 않은 사용자 |
| FORBIDDEN | 권한 없음 |
| NOT_FOUND | 리소스를 찾을 수 없음 |
| INTERNAL_ERROR | 서버 내부 오류 |

---

## 개발 참고사항

### 1. 인증
- 대부분의 API는 JWT 기반 인증이 필요합니다
- `Authorization: Bearer {access_token}` 헤더 필수
- Access Token 만료 시 Refresh Token으로 갱신

### 2. CORS
프론트엔드 개발 서버 주소를 CORS 허용 목록에 추가해주세요:
```
http://localhost:3000
```

### 3. 날짜 형식
모든 날짜는 ISO 8601 형식(UTC)을 사용합니다:
```
2025-11-01T14:30:00Z
```

### 4. 페이지네이션
페이지네이션이 있는 API는 다음 형식을 따릅니다:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

### 5. 파일 업로드
- 이미지 업로드는 먼저 `/upload/image`로 임시 업로드
- 반환된 URL을 상품 등록/수정 시 사용
- 임시 업로드된 파일은 24시간 후 자동 삭제 (상품 등록되지 않은 경우)

---

## 프론트엔드 구현 현황

현재 구현된 페이지:
- ✅ 홈 (상품 목록)
- ✅ 상품 상세
- ✅ 상품 등록
- ✅ 상품 수정
- ✅ 로그인
- 🚧 채팅 (TODO)

필요한 API:
- ✅ 상품 CRUD
- ✅ 이미지 업로드
- ✅ 인증 (로그인/회원가입)
- ✅ 좋아요
- 🚧 채팅 (WebSocket 또는 폴링 필요)
