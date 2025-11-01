// API 타입 정의

// ============ 공통 타입 ============

/**
 * 서버 Envelope 응답 구조
 * 서버에서 반환하는 모든 응답은 이 구조로 감싸져 있음
 */
export interface ServerEnvelope<T> {
    success: boolean;
    message?: string;
    data: T;
}

/**
 * 클라이언트에서 사용하는 API 응답 타입
 */
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
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ============ 상품 타입 ============
export type SellStatus = 'ACTIVE' | 'SOLD' | 'RESERVED';

export interface Product {
    product_id: string;
    member_id: number;
    name: string;
    price: number;
    description: string;
    sell_status: SellStatus;
    job_count: number;
    ply_url: string;
    view_cnt: number;
    likes_cnt: number;
    created_at: string;
    updated_at: string | null;
    seller_nickname: string;
    seller_img: string;
    thumbnail: string | null;
}

export interface ProductDetail extends Product {
    images?: string[];
}

export interface ProductListResponse {
    products: Product[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

export interface CreateProductRequest {
    name: string;
    price: number;
    description: string;
    images: string[];
}

export interface UpdateProductRequest {
    name?: string;
    price?: number;
    description?: string;
    images?: string[];
    sell_status?: SellStatus;
}

// ============ 사용자 타입 ============
export interface User {
    member_id: number;
    email: string;
    nickname: string;
    img?: string;
    created_at: string;
    updated_at?: string;
}

// ============ 인증 타입 ============
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    nickname: string;
    img?: string;
}

/**
 * 인증 응답 데이터 (envelope.data 안에 있는 실제 데이터)
 */
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user?: User;
}

// ============ 좋아요 타입 ============
export interface LikeResponse {
    product_id: string;
    likes_cnt: number;
    is_liked: boolean;
}

// ============ 이미지 업로드 타입 ============
export interface ImageUploadResponse {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}

export interface PresignedUrlsRequest {
    files: Array<{
        filename: string;
        contentType: string;
    }>;
}

export interface PresignedUploadInfo {
    originalFilename: string;
    uploadUrl: string;
    fileUrl: string;
    key: string;
}

/**
 * Presigned URL 응답 데이터 (envelope.data 안에 있는 실제 데이터)
 */
export interface PresignedUrlsResponse {
    uploads: PresignedUploadInfo[];
    expiresIn: number;
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
