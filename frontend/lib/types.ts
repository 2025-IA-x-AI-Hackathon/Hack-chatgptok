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
    seller_img_url: string;
    thumbnail: string | null;
}

export interface ProductImage {
    image_id: number;
    url: string;
    created_at: string;
}

export interface ProductDetail extends Product {
    images: ProductImage[];
    seller_email: string;
    seller_created_at: string;
}

export interface ProductDetailResponse {
    product: ProductDetail;
}

export interface ProductListResponse {
    products: Product[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
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
    img_url?: string;
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

// ============ AI 설명 생성 타입 ============
export interface GenerateDescriptionRequest {
    s3_path: string;
    product_name: string;
}

export interface GenerateDescriptionResponse {
    description: string;
}

// ============ 채팅 타입 ============
export interface ChatRoom {
    room_id: number;
    product_id: string;
    buyer_id: number;
    seller_id: number;
    created_at: string;
    updated_at: string;
    product_name: string;
    product_price: number;
    product_thumbnail?: string;
    other_user_name: string;
    other_user_img?: string;
    other_user_id: number;
    user_type: 'buyer' | 'seller';
    last_message?: string;
    last_message_time?: string;
    unread_count: number;
}

export interface ChatRoomDetail {
    room_id: number;
    product_id: string;
    buyer_id: number;
    seller_id: number;
    created_at: string;
    updated_at: string;
    product_name: string;
    product_price: number;
    product_thumbnail?: string;
    other_user_name: string;
    other_user_img?: string;
    other_user_id: number;
    buyer_nickname: string;
    seller_nickname: string;
}

export interface ChatMessage {
    msg_id: number;
    room_id: number;
    sender_id: number;
    content: string;
    created_at: string;
    is_read: boolean;
    sender_nickname?: string;
    sender_img?: string;
}

export interface CreateChatRoomRequest {
    productId: string;
}

export interface SendMessageRequest {
    content: string;
}
