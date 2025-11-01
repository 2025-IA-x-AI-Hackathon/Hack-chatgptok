# Hack-chatgptok Backend API 가이드라인

## 목차
1. [응답 형식 표준](#응답-형식-표준)
2. [인증 방식](#인증-방식)
3. [에러 처리](#에러-처리)
4. [HTTP 상태 코드](#http-상태-코드)
5. [로깅 규칙](#로깅-규칙)
6. [네이밍 컨벤션](#네이밍-컨벤션)

---

## 응답 형식 표준

### 성공 응답

모든 성공 응답은 다음 형식을 따릅니다:

```json
{
  "success": true,
  "message": "작업이 성공했습니다.",
  "data": {
    // 실제 데이터
  }
}
```

#### 예시

**회원가입 성공 (201)**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user": {
      "member_id": 1,
      "email": "user@example.com",
      "nickname": "홍길동",
      "img": "https://example.com/profile.jpg",
      "created_at": "2025-01-15T12:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**로그인 성공 (200)**
```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "user": {
      "member_id": 1,
      "email": "user@example.com",
      "nickname": "홍길동",
      "img": "https://example.com/profile.jpg",
      "created_at": "2025-01-15T12:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**토큰 갱신 성공 (200)**
```json
{
  "success": true,
  "message": "토큰이 갱신되었습니다.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**내 정보 조회 성공 (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "member_id": 1,
      "email": "user@example.com",
      "nickname": "홍길동",
      "img": "https://example.com/profile.jpg",
      "created_at": "2025-01-15T12:00:00Z"
    }
  }
}
```

### 실패 응답

모든 실패 응답은 다음 형식을 따릅니다:

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

#### 예시

**유효성 검증 실패 (400)**
```json
{
  "success": false,
  "message": "이메일, 비밀번호, 닉네임은 필수 항목입니다."
}
```

**인증 실패 (401)**
```json
{
  "success": false,
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

**리소스 없음 (404)**
```json
{
  "success": false,
  "message": "사용자를 찾을 수 없습니다."
}
```

**이메일 중복 (409)**
```json
{
  "success": false,
  "message": "이미 사용 중인 이메일입니다."
}
```

**서버 에러 (500)**
```json
{
  "success": false,
  "message": "회원가입 처리 중 오류가 발생했습니다."
}
```

---

## 인증 방식

### JWT Bearer Token

모든 인증이 필요한 API는 JWT Access Token을 사용합니다.

#### Request Header
```
Authorization: Bearer <accessToken>
```

#### Token 구조

**Access Token Payload**
```json
{
  "memberId": 1,
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Refresh Token Payload**
```json
{
  "memberId": 1,
  "iat": 1234567890,
  "exp": 1235777490
}
```

#### Token 만료 시간
- **Access Token**: 1시간 (3600초)
- **Refresh Token**: 14일 (1209600초)

#### Token 갱신 플로우

1. Access Token 만료 시 401 에러 발생
2. Client는 Refresh Token을 사용하여 `/api/v1/auth/refresh` 호출
3. 새로운 Access Token 발급
4. 갱신된 Access Token으로 API 재요청

---

## 에러 처리

### 에러 응답 규칙

1. **모든 에러는 `success: false` 포함**
2. **명확한 에러 메시지 제공**
3. **적절한 HTTP 상태 코드 사용**
4. **보안 관련 에러는 일반화된 메시지 사용**

### 보안 관련 에러 메시지

로그인 실패 시 이메일/비밀번호 중 어느 것이 틀렸는지 명시하지 않음:
```json
{
  "success": false,
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

---

## HTTP 상태 코드

### 성공 (2xx)

| 코드 | 설명 | 사용 예시 |
|------|------|-----------|
| 200 | OK | 데이터 조회, 수정, 삭제 성공 |
| 201 | Created | 리소스 생성 성공 (회원가입, 상품 등록) |

### 클라이언트 에러 (4xx)

| 코드 | 설명 | 사용 예시 |
|------|------|-----------|
| 400 | Bad Request | 필수 파라미터 누락, 유효성 검증 실패 |
| 401 | Unauthorized | 인증 실패, 토큰 만료/유효하지 않음 |
| 403 | Forbidden | 권한 없음 (본인 리소스가 아님) |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 409 | Conflict | 리소스 충돌 (이메일 중복 등) |

### 서버 에러 (5xx)

| 코드 | 설명 | 사용 예시 |
|------|------|-----------|
| 500 | Internal Server Error | 예상하지 못한 서버 에러 |

---

## 로깅 규칙

### 로그 형식

모든 로그는 다음 형식을 따릅니다:
```
[카테고리] 작업 설명 - 추가 정보
```

### 로깅 카테고리

- `[Auth]`: 인증 관련 작업
- `[User]`: 사용자 관련 작업
- `[Upload]`: 파일 업로드 관련 작업
- `[Product]`: 상품 관련 작업

### 로깅 레벨

#### 1. 정보 로그 (console.log)

**요청 시작**
```javascript
console.log('[Auth] 회원가입 요청 시작:', { email: req.body.email, nickname: req.body.nickname });
console.log('[Auth] 로그인 요청 시작:', { email: req.body.email });
console.log('[Auth] 토큰 갱신 요청 시작');
```

**성공**
```javascript
console.log('[Auth] 신규 사용자 생성 완료 - ID:', newUser.member_id);
console.log('[Auth] 회원가입 성공 - 사용자 ID:', newUser.member_id, '이메일:', email);
console.log('[Auth] 로그인 성공 - 사용자 ID:', user.member_id, '이메일:', email);
console.log('[Auth] 토큰 갱신 성공 - 사용자 ID:', user.member_id);
```

**실패 (에러가 아닌 정상적인 실패)**
```javascript
console.log('[Auth] 회원가입 실패 - 필수 항목 누락');
console.log('[Auth] 회원가입 실패 - 잘못된 이메일 형식:', email);
console.log('[Auth] 회원가입 실패 - 이메일 중복:', email);
console.log('[Auth] 로그인 실패 - 사용자 없음:', email);
console.log('[Auth] 로그인 실패 - 비밀번호 불일치:', email);
console.log('[Auth] 토큰 갱신 실패 - 리프레시 토큰 누락');
console.log('[Auth] 토큰 갱신 실패 - 토큰 검증 실패:', error.message);
```

#### 2. 에러 로그 (console.error)

**예상하지 못한 에러**
```javascript
console.error('[Auth] 회원가입 에러:', error);
console.error('[Auth] 로그인 에러:', error);
console.error('[Auth] 토큰 갱신 에러:', error);
```

### 로깅 예시

```javascript
// 회원가입 플로우
console.log('[Auth] 회원가입 요청 시작:', { email: 'user@example.com', nickname: '홍길동' });
console.log('[Auth] 신규 사용자 생성 완료 - ID:', 1);
console.log('[Auth] 회원가입 성공 - 사용자 ID:', 1, '이메일:', 'user@example.com');

// 실패 케이스
console.log('[Auth] 회원가입 실패 - 이메일 중복:', 'user@example.com');
console.error('[Auth] 회원가입 에러:', new Error('Database connection failed'));
```

---

## 네이밍 컨벤션

### 1. 변수명

- **camelCase** 사용
- 명확하고 설명적인 이름 사용

```javascript
const accessToken = generateAccessToken({ memberId, email });
const refreshToken = generateRefreshToken({ memberId });
const userResponse = { member_id, email, nickname, img, created_at };
const existingUser = await UserModel.findByEmail(email);
```

### 2. 함수명

- **동사 + 명사** 형식
- async 함수는 async 키워드 명시

```javascript
async register(req, res)
async login(req, res)
async refreshToken(req, res)
async getMe(req, res)
async updateProfile(req, res)
```

### 3. 데이터베이스 필드명

- **snake_case** 사용 (PostgreSQL 컨벤션)

```javascript
{
  member_id: 1,
  email: "user@example.com",
  nickname: "홍길동",
  img: "https://example.com/profile.jpg",
  created_at: "2025-01-15T12:00:00Z",
  updated_at: "2025-01-15T12:00:00Z"
}
```

### 4. API 엔드포인트

- **kebab-case** 사용
- RESTful 규칙 준수

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/users/me
GET    /api/v1/users/:userId/profile
PUT    /api/v1/users/profile
```

---

## 유효성 검증

### 1. 필수 필드 검증

```javascript
if (!email || !password || !nickname) {
    return res.status(400).json({
        success: false,
        message: '이메일, 비밀번호, 닉네임은 필수 항목입니다.',
    });
}
```

### 2. 이메일 형식 검증

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    return res.status(400).json({
        success: false,
        message: '올바른 이메일 형식이 아닙니다.',
    });
}
```

### 3. 중복 검증

```javascript
const existingUser = await UserModel.findByEmail(email);
if (existingUser) {
    return res.status(409).json({
        success: false,
        message: '이미 사용 중인 이메일입니다.',
    });
}
```

---

## 보안 규칙

### 1. 비밀번호 처리

- **절대 평문 비밀번호를 응답에 포함하지 않음**
- 비밀번호는 bcrypt로 해싱하여 저장
- 응답 시 password 필드 제외

```javascript
// 비밀번호 제외하고 응답
const userResponse = {
    member_id: user.member_id,
    email: user.email,
    nickname: user.nickname,
    img: user.img,
    created_at: user.created_at,
};
```

### 2. JWT 토큰

- Access Token과 Refresh Token 분리
- Access Token은 짧은 만료 시간 (1시간)
- Refresh Token은 긴 만료 시간 (14일)
- 토큰에 민감한 정보 포함하지 않음

```javascript
// Access Token - 짧은 수명, 많은 정보
const accessToken = generateAccessToken({
    memberId: user.member_id,
    email: user.email,
});

// Refresh Token - 긴 수명, 최소 정보
const refreshToken = generateRefreshToken({
    memberId: user.member_id,
});
```

### 3. 에러 메시지

- 공격자에게 유용한 정보 노출하지 않음
- 로그인 실패 시 이메일/비밀번호 중 무엇이 틀렸는지 명시하지 않음

```javascript
// 좋은 예
return res.status(401).json({
    success: false,
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
});

// 나쁜 예 (보안 취약)
return res.status(401).json({
    success: false,
    message: '비밀번호가 틀렸습니다.',  // 이메일은 존재한다는 정보 노출
});
```

---

## Swagger 문서화 규칙

### 1. 모든 엔드포인트에 Swagger 주석 추가

```javascript
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               nickname:
 *                 type: string
 *                 example: 홍길동
 *     responses:
 *       201:
 *         description: 회원가입 성공
 */
```

### 2. 인증이 필요한 엔드포인트는 security 명시

```javascript
/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: 내 정보 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
```

---

## 예제 코드

### 완전한 컨트롤러 예시

```javascript
import UserModel from '../models/userModel.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtUtil.js';

const authController = {
    async register(req, res) {
        console.log('[Auth] 회원가입 요청 시작:', { email: req.body.email, nickname: req.body.nickname });
        try {
            const { email, password, nickname, img } = req.body;

            // 유효성 검사
            if (!email || !password || !nickname) {
                console.log('[Auth] 회원가입 실패 - 필수 항목 누락');
                return res.status(400).json({
                    success: false,
                    message: '이메일, 비밀번호, 닉네임은 필수 항목입니다.',
                });
            }

            // 이메일 형식 검증
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log('[Auth] 회원가입 실패 - 잘못된 이메일 형식:', email);
                return res.status(400).json({
                    success: false,
                    message: '올바른 이메일 형식이 아닙니다.',
                });
            }

            // 중복 체크
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                console.log('[Auth] 회원가입 실패 - 이메일 중복:', email);
                return res.status(409).json({
                    success: false,
                    message: '이미 사용 중인 이메일입니다.',
                });
            }

            // 사용자 생성
            const newUser = await UserModel.createUser({ email, password, nickname, img: img || null });
            console.log('[Auth] 신규 사용자 생성 완료 - ID:', newUser.member_id);

            // JWT 토큰 생성
            const accessToken = generateAccessToken({ memberId: newUser.member_id, email: newUser.email });
            const refreshToken = generateRefreshToken({ memberId: newUser.member_id });

            // 비밀번호 제외하고 응답
            const userResponse = {
                member_id: newUser.member_id,
                email: newUser.email,
                nickname: newUser.nickname,
                img: newUser.img,
                created_at: newUser.created_at,
            };

            console.log('[Auth] 회원가입 성공 - 사용자 ID:', newUser.member_id, '이메일:', email);
            res.status(201).json({
                success: true,
                message: '회원가입이 완료되었습니다.',
                data: { user: userResponse, accessToken, refreshToken },
            });
        } catch (error) {
            console.error('[Auth] 회원가입 에러:', error);
            res.status(500).json({
                success: false,
                message: '회원가입 처리 중 오류가 발생했습니다.',
            });
        }
    },
};

export default authController;
```

---

## 체크리스트

새로운 API 엔드포인트를 만들 때 다음을 확인하세요:

- [ ] 응답 형식이 표준을 따르는가? (`success`, `message`, `data`)
- [ ] 적절한 HTTP 상태 코드를 사용하는가?
- [ ] 모든 에러 케이스를 처리했는가?
- [ ] 로깅이 규칙에 맞게 구현되어 있는가?
- [ ] 비밀번호 등 민감한 정보가 응답에 포함되지 않는가?
- [ ] 유효성 검증이 충분히 이루어지는가?
- [ ] Swagger 문서화가 완료되었는가?
- [ ] 인증이 필요한 엔드포인트에 `authenticateToken` 미들웨어를 적용했는가?
- [ ] 변수명과 함수명이 컨벤션을 따르는가?

---

## 참고 문서

- [Swagger 문서](http://localhost:8000/api-docs)
- [JWT 토큰 관리](./src/utils/jwtUtil.js)
- [인증 미들웨어](./src/middleware/authMiddleware.js)
