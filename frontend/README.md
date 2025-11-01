# Frontend - 중고 거래 플랫폼

Next.js 기반 중고 거래 플랫폼 프론트엔드입니다.

## 📁 프로젝트 구조

```
frontend/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 홈 (상품 목록)
│   ├── login/               # 로그인 페이지
│   ├── chat/                # 채팅 페이지
│   └── products/            # 상품 관련 페이지
│       ├── new/             # 상품 등록
│       └── [id]/            # 상품 상세/수정
│           ├── page.tsx     # 상품 상세
│           └── edit/        # 상품 수정
├── components/              # 리액트 컴포넌트
│   ├── home/               # 홈 관련 컴포넌트
│   └── ui/                 # shadcn/ui 컴포넌트
├── lib/                    # 유틸리티 & API
│   ├── api.ts             # API 클라이언트 (백엔드 통신)
│   ├── types.ts           # TypeScript 타입 정의
│   └── utils.ts           # 유틸리티 함수
└── API_SPEC.md            # API 명세서 (백엔드 개발자용)
```

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
# or
yarn install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 백엔드 API URL을 설정합니다:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 3. 개발 서버 실행
```bash
npm run dev
# or
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 📡 API 사용법

### API 클라이언트 임포트

```typescript
import { productApi, authApi, likeApi, uploadApi, chatApi } from '@/lib/api';
```

### 상품 API 사용 예제

#### 1. 상품 목록 조회
```typescript
const response = await productApi.getProducts({
  page: 1,
  limit: 20,
  sort: 'latest'
});

if (response.success) {
  const products = response.data.products;
  console.log(products);
} else {
  console.error(response.error.message);
}
```

#### 2. 상품 상세 조회
```typescript
const response = await productApi.getProduct(1);

if (response.success) {
  const product = response.data;
  console.log(product.title, product.price);
}
```

#### 3. 상품 등록
```typescript
const response = await productApi.createProduct({
  title: "아이폰 15 Pro Max",
  price: 1350000,
  description: "상품 설명...",
  location: "서울 강남구 역삼동",
  images: [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
});

if (response.success) {
  console.log("상품 등록 성공:", response.data.id);
}
```

#### 4. 상품 수정
```typescript
const response = await productApi.updateProduct(1, {
  title: "아이폰 15 Pro Max (가격인하)",
  price: 1250000,
  description: "가격 인하했습니다!",
  location: "서울 강남구 역삼동",
  images: ["https://example.com/image1.jpg"]
});
```

#### 5. 상품 삭제
```typescript
const response = await productApi.deleteProduct(1);

if (response.success) {
  console.log("삭제 완료");
}
```

### 인증 API 사용 예제

#### 1. 로그인
```typescript
const response = await authApi.login({
  email: "user@example.com",
  password: "password123"
});

if (response.success) {
  // 토큰은 자동으로 localStorage에 저장됨
  const user = response.data.user;
  console.log("로그인 성공:", user.name);
}
```

#### 2. 회원가입
```typescript
const response = await authApi.register({
  email: "newuser@example.com",
  password: "password123",
  name: "홍길동",
  location: "서울 강남구"
});
```

#### 3. 로그아웃
```typescript
await authApi.logout();
// 토큰이 자동으로 제거됨
```

#### 4. 로그인 상태 확인
```typescript
const isLoggedIn = authApi.isAuthenticated();

if (!isLoggedIn) {
  router.push('/login');
}
```

### 좋아요 API 사용 예제

#### 1. 좋아요 추가
```typescript
const response = await likeApi.addLike(1);

if (response.success) {
  console.log("좋아요 수:", response.data.likes);
  console.log("좋아요 상태:", response.data.isLiked);
}
```

#### 2. 좋아요 취소
```typescript
const response = await likeApi.removeLike(1);
```

### 이미지 업로드 API 사용 예제

```typescript
// 파일 input에서 파일 가져오기
const file = event.target.files[0];

// 이미지 업로드
const response = await uploadApi.uploadImage(file);

if (response.success) {
  const imageUrl = response.data.url;
  console.log("업로드된 이미지 URL:", imageUrl);

  // 이 URL을 상품 등록 시 사용
  await productApi.createProduct({
    title: "상품명",
    price: 10000,
    description: "설명",
    location: "서울",
    images: [imageUrl]
  });
}
```

### 채팅 API 사용 예제

#### 1. 채팅방 생성
```typescript
const response = await chatApi.createRoom({
  productId: 1
});

if (response.success) {
  const roomId = response.data.roomId;
  router.push(`/chat?room=${roomId}`);
}
```

#### 2. 채팅방 목록 조회
```typescript
const response = await chatApi.getRooms();

if (response.success) {
  const rooms = response.data.rooms;
  rooms.forEach(room => {
    console.log(room.product.title);
    console.log(room.lastMessage?.content);
    console.log(room.unreadCount);
  });
}
```

#### 3. 메시지 조회
```typescript
const response = await chatApi.getMessages("room-abc123", {
  page: 1,
  limit: 50
});

if (response.success) {
  const messages = response.data.messages;
  // 메시지 렌더링
}
```

#### 4. 메시지 전송
```typescript
const response = await chatApi.sendMessage("room-abc123", {
  content: "안녕하세요!"
});
```

## 🎨 UI 컴포넌트

이 프로젝트는 [shadcn/ui](https://ui.shadcn.com/)를 사용합니다.

사용된 컴포넌트:
- Button
- Card
- Input
- Textarea
- Dialog
- Avatar
- Badge
- 등...

## 📝 TypeScript 타입

모든 API 응답과 요청은 타입이 정의되어 있습니다 (`lib/types.ts`).

```typescript
import type { Product, ProductDetail, User } from '@/lib/types';

const product: ProductDetail = {
  id: 1,
  title: "상품명",
  price: 10000,
  // ... 자동 완성 지원
};
```

## 🔐 인증 흐름

1. 사용자가 로그인하면 `accessToken`과 `refreshToken`이 localStorage에 저장됩니다
2. 인증이 필요한 API 호출 시 자동으로 `Authorization` 헤더에 토큰이 추가됩니다
3. 토큰 만료 시 `authApi.refreshToken()`으로 갱신할 수 있습니다
4. 로그아웃 시 토큰이 자동으로 제거됩니다

## 🛠️ 에러 처리

모든 API 응답은 다음 형식을 따릅니다:

```typescript
// 성공
{
  success: true,
  data: { ... }
}

// 실패
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "에러 메시지",
    details: [...]  // 선택적
  }
}
```

사용 예:
```typescript
const response = await productApi.getProduct(1);

if (response.success) {
  // 성공 처리
  console.log(response.data);
} else {
  // 에러 처리
  console.error(response.error.code);
  console.error(response.error.message);

  // 사용자에게 에러 메시지 표시
  alert(response.error.message);
}
```

## 📋 할 일

현재 구현된 기능:
- ✅ 상품 목록 조회
- ✅ 상품 상세 페이지
- ✅ 상품 등록
- ✅ 상품 수정
- ✅ 상품 삭제
- ✅ 로그인
- ✅ API 클라이언트

구현 예정:
- ⏳ 회원가입 페이지
- ⏳ 채팅 기능 (WebSocket 연동)
- ⏳ 좋아요 기능 실제 연동
- ⏳ 이미지 업로드 실제 구현
- ⏳ 마이페이지
- ⏳ 검색 기능

## 📚 백엔드 개발자를 위한 참고 자료

### API 명세서
자세한 API 명세는 [`API_SPEC.md`](./API_SPEC.md) 참조

### 필요한 CORS 설정
```javascript
// 백엔드에서 다음 origin을 허용해주세요
const allowedOrigins = [
  'http://localhost:3000',  // 개발 환경
  'https://yourdomain.com'  // 프로덕션 환경
];
```

### 프론트엔드가 기대하는 응답 형식

모든 API는 다음 형식으로 응답해야 합니다:

**성공 응답:**
```json
{
  "success": true,
  "data": {
    // 실제 데이터
  }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 보여줄 메시지",
    "details": []  // 선택적, validation 에러 등
  }
}
```

### 인증 헤더 형식
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🤝 협업 가이드

### 프론트엔드 → 백엔드 요청사항

새로운 API가 필요한 경우:
1. `API_SPEC.md`에 API 명세 추가
2. `lib/types.ts`에 TypeScript 타입 정의
3. `lib/api.ts`에 API 함수 추가

### 백엔드 → 프론트엔드 알림사항

API 변경 시:
1. `API_SPEC.md` 업데이트
2. 해당 변경사항 공유

## 📞 문의

API나 기능 관련 문의사항이 있으면 언제든지 연락주세요!
