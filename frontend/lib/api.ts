/**
 * API 클라이언트
 *
 * 백엔드와 통신하는 모든 API 호출을 관리합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { productApi } from '@/lib/api';
 *
 * const response = await productApi.getProducts({ page: 1, limit: 20 });
 * if (response.success) {
 *   console.log(response.data.products);
 * }
 * ```
 */

import type {
    ApiResponse,
    ProductListResponse,
    ProductDetail,
    CreateProductRequest,
    UpdateProductRequest,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LikeResponse,
    ImageUploadResponse,
    ChatRoom,
    ChatRoomDetail,
    ChatMessagesResponse,
    CreateChatRoomRequest,
    SendMessageRequest,
    ChatMessage,
} from "./types";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// ============ 헬퍼 함수 ============

/**
 * 로컬 스토리지에서 액세스 토큰 가져오기
 */
function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
}

/**
 * 로컬 스토리지와 쿠키에 액세스 토큰 저장
 */
function setAccessToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", token);
    // 쿠키에도 저장 (middleware에서 사용)
    document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7일
}

/**
 * 로컬 스토리지에서 리프레시 토큰 가져오기
 */
function getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
}

/**
 * 로컬 스토리지와 쿠키에 리프레시 토큰 저장
 */
function setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("refreshToken", token);
    // 쿠키에도 저장 (middleware에서 사용)
    document.cookie = `refreshToken=${token}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30일
}

/**
 * 토큰 제거 (로그아웃 시)
 */
function clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // 쿠키에서도 제거
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "refreshToken=; path=/; max-age=0";
}

/**
 * API 요청 헤더 생성
 */
function createHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (includeAuth) {
        const token = getAccessToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    return headers;
}

/**
 * API 요청 함수 (공통)
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = false
): Promise<ApiResponse<T>> {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = createHeaders(includeAuth);

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || {
                    code: "UNKNOWN_ERROR",
                    message: "알 수 없는 오류가 발생했습니다.",
                },
            };
        }

        return data;
    } catch (error) {
        console.error("API Request Error:", error);
        return {
            success: false,
            error: {
                code: "NETWORK_ERROR",
                message: "네트워크 오류가 발생했습니다.",
            },
        };
    }
}

// ============ 상품 API ============

export const productApi = {
    /**
     * 상품 목록 조회
     */
    getProducts: async (params?: {
        page?: number;
        limit?: number;
        sort?: "latest" | "popular" | "price_low" | "price_high";
    }): Promise<ApiResponse<ProductListResponse>> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.limit) queryParams.set("limit", params.limit.toString());
        if (params?.sort) queryParams.set("sort", params.sort);

        const query = queryParams.toString();
        const endpoint = `/products${query ? `?${query}` : ""}`;

        return apiRequest<ProductListResponse>(endpoint, { method: "GET" });
    },

    /**
     * 상품 상세 조회
     */
    getProduct: async (id: number): Promise<ApiResponse<ProductDetail>> => {
        return apiRequest<ProductDetail>(`/products/${id}`, { method: "GET" });
    },

    /**
     * 상품 등록
     */
    createProduct: async (
        data: CreateProductRequest
    ): Promise<ApiResponse<ProductDetail>> => {
        return apiRequest<ProductDetail>(
            "/products",
            {
                method: "POST",
                body: JSON.stringify(data),
            },
            true // 인증 필요
        );
    },

    /**
     * 상품 수정
     */
    updateProduct: async (
        id: number,
        data: UpdateProductRequest
    ): Promise<ApiResponse<ProductDetail>> => {
        return apiRequest<ProductDetail>(
            `/products/${id}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            },
            true // 인증 필요
        );
    },

    /**
     * 상품 삭제
     */
    deleteProduct: async (id: number): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest<{ message: string }>(
            `/products/${id}`,
            {
                method: "DELETE",
            },
            true // 인증 필요
        );
    },
};

// ============ 좋아요 API ============

export const likeApi = {
    /**
     * 좋아요 추가
     */
    addLike: async (productId: number): Promise<ApiResponse<LikeResponse>> => {
        return apiRequest<LikeResponse>(
            `/products/${productId}/like`,
            {
                method: "POST",
            },
            true // 인증 필요
        );
    },

    /**
     * 좋아요 취소
     */
    removeLike: async (productId: number): Promise<ApiResponse<LikeResponse>> => {
        return apiRequest<LikeResponse>(
            `/products/${productId}/like`,
            {
                method: "DELETE",
            },
            true // 인증 필요
        );
    },
};

// ============ 인증 API ============

export const authApi = {
    /**
     * 로그인
     */
    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
        const response = await apiRequest<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        });

        // 로그인 성공 시 토큰 저장
        if (response.success && response.data) {
            setAccessToken(response.data.accessToken);
            setRefreshToken(response.data.refreshToken);
        }

        return response;
    },

    /**
     * 회원가입
     */
    register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
        const response = await apiRequest<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });

        // 회원가입 성공 시 토큰 저장
        if (response.success && response.data) {
            setAccessToken(response.data.accessToken);
            setRefreshToken(response.data.refreshToken);
        }

        return response;
    },

    /**
     * 토큰 갱신
     */
    refreshToken: async (): Promise<ApiResponse<RefreshTokenResponse>> => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            return {
                success: false,
                error: {
                    code: "NO_REFRESH_TOKEN",
                    message: "리프레시 토큰이 없습니다.",
                },
            };
        }

        const response = await apiRequest<RefreshTokenResponse>("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
        });

        // 토큰 갱신 성공 시 새 토큰 저장
        if (response.success && response.data) {
            setAccessToken(response.data.accessToken);
            setRefreshToken(response.data.refreshToken);
        }

        return response;
    },

    /**
     * 로그아웃
     */
    logout: async (): Promise<ApiResponse<{ message: string }>> => {
        const response = await apiRequest<{ message: string }>(
            "/auth/logout",
            {
                method: "POST",
            },
            true // 인증 필요
        );

        // 로그아웃 후 토큰 제거
        clearTokens();

        return response;
    },

    /**
     * 현재 로그인 상태 확인
     */
    isAuthenticated: (): boolean => {
        return !!getAccessToken();
    },

    /**
     * 토큰 제거 (클라이언트 측에서만)
     */
    clearTokens,
};

// ============ 이미지 업로드 API ============

export const uploadApi = {
    /**
     * 이미지 업로드
     */
    uploadImage: async (file: File): Promise<ApiResponse<ImageUploadResponse>> => {
        try {
            const formData = new FormData();
            formData.append("image", file);

            const token = getAccessToken();
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/upload/image`, {
                method: "POST",
                headers,
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || {
                        code: "UPLOAD_ERROR",
                        message: "이미지 업로드에 실패했습니다.",
                    },
                };
            }

            return data;
        } catch (error) {
            console.error("Image Upload Error:", error);
            return {
                success: false,
                error: {
                    code: "NETWORK_ERROR",
                    message: "네트워크 오류가 발생했습니다.",
                },
            };
        }
    },
};

// ============ 채팅 API ============

export const chatApi = {
    /**
     * 채팅방 목록 조회
     */
    getRooms: async (): Promise<ApiResponse<{ rooms: ChatRoom[] }>> => {
        return apiRequest<{ rooms: ChatRoom[] }>(
            "/chat/rooms",
            {
                method: "GET",
            },
            true // 인증 필요
        );
    },

    /**
     * 채팅방 생성
     */
    createRoom: async (
        data: CreateChatRoomRequest
    ): Promise<ApiResponse<ChatRoomDetail>> => {
        return apiRequest<ChatRoomDetail>(
            "/chat/rooms",
            {
                method: "POST",
                body: JSON.stringify(data),
            },
            true // 인증 필요
        );
    },

    /**
     * 채팅 메시지 조회
     */
    getMessages: async (
        roomId: string,
        params?: { page?: number; limit?: number }
    ): Promise<ApiResponse<ChatMessagesResponse>> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.limit) queryParams.set("limit", params.limit.toString());

        const query = queryParams.toString();
        const endpoint = `/chat/rooms/${roomId}/messages${query ? `?${query}` : ""}`;

        return apiRequest<ChatMessagesResponse>(
            endpoint,
            {
                method: "GET",
            },
            true // 인증 필요
        );
    },

    /**
     * 메시지 전송
     */
    sendMessage: async (
        roomId: string,
        data: SendMessageRequest
    ): Promise<ApiResponse<ChatMessage>> => {
        return apiRequest<ChatMessage>(
            `/chat/rooms/${roomId}/messages`,
            {
                method: "POST",
                body: JSON.stringify(data),
            },
            true // 인증 필요
        );
    },
};

// ============ 기본 export ============

export default {
    product: productApi,
    like: likeApi,
    auth: authApi,
    upload: uploadApi,
    chat: chatApi,
};
