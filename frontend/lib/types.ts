// API 타입 정의

// ============ 공통 타입 ============
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Array<{
        field: string;
        message: string;
    }>;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

// ============ 상품 타입 ============
export interface Product {
    id: number;
    title: string;
    price: number;
    thumbnail: string;
    likes: number;
    views: number;
    location: string;
    createdAt: string;
}

export interface ProductDetail extends Product {
    description: string;
    images: string[];
    seller: User;
    updatedAt: string;
}

export interface ProductListResponse {
    products: Product[];
    pagination: Pagination;
}

export interface CreateProductRequest {
    title: string;
    price: number;
    description: string;
    location: string;
    images: string[];
}

export interface UpdateProductRequest {
    title: string;
    price: number;
    description: string;
    location: string;
    images: string[];
}

// ============ 사용자 타입 ============
export interface User {
    id: number;
    name: string;
    email?: string;
    location: string;
    profileImage: string;
}

// ============ 인증 타입 ============
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    location: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

// ============ 좋아요 타입 ============
export interface LikeResponse {
    productId: number;
    likes: number;
    isLiked: boolean;
}

// ============ 이미지 업로드 타입 ============
export interface ImageUploadResponse {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}

// ============ 채팅 타입 ============
export interface ChatRoom {
    roomId: string;
    product: {
        id: number;
        title: string;
        thumbnail: string;
        price: number;
    };
    otherUser: User;
    lastMessage?: ChatMessage;
    unreadCount: number;
}

export interface ChatMessage {
    id: string;
    senderId: number;
    content: string;
    createdAt: string;
    isRead: boolean;
}

export interface ChatRoomDetail {
    roomId: string;
    productId: number;
    seller: User;
    buyer: User;
    createdAt: string;
}

export interface ChatMessagesResponse {
    messages: ChatMessage[];
    pagination: Pagination;
}

export interface CreateChatRoomRequest {
    productId: number;
}

export interface SendMessageRequest {
    content: string;
}
