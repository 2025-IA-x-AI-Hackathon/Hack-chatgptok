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
export interface ProductImage {
    image_id: number;
    s3_url: string;
    sort_order: number;
}

export interface Product {
    product_id: string;  // UUID
    name: string;
    price: number;
    sell_status: 'DRAFT' | 'ACTIVE' | 'DELETED' | 'SOLD';
    ply_url?: string;
    view_cnt: number;
    likes_cnt: number;
    created_at: string;
    updated_at?: string;
    seller?: {
        member_id: number;
        nickname: string;
        img?: string;
    };
    images?: ProductImage[];
}

export interface ProductDetail extends Product {
    description: string;
    job_count: number;
    fault_description?: {
        markdown?: string;
        status: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';
        error_msg?: string;
        completed_at?: string;
    };
    job_3dgs?: {
        status: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';
        log?: string;
        error_msg?: string;
        completed_at?: string;
    };
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
    description?: string;
    images: File[];  // 15-25장의 이미지 파일
}

export interface UpdateProductRequest {
    name?: string;
    price?: number;
    description?: string;
    sell_status?: 'DRAFT' | 'ACTIVE' | 'DELETED' | 'SOLD';
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

export interface AuthResponse {
    message: string;
    user: User;
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
