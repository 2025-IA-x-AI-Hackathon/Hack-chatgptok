/**
 * API 클라이언트
 *
 * 백엔드와 통신하는 모든 API 호출을 관리합니다.
 * 세션 기반 인증을 사용합니다 (쿠키).
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
    LikeResponse,
    ImageUploadResponse,
    User,
} from "./types";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

// ============ 헬퍼 함수 ============

/**
 * API 요청 헤더 생성
 */
function createHeaders(): HeadersInit {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    return headers;
}

/**
 * API 요청 함수 (공통)
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = createHeaders();

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
            credentials: 'include', // 쿠키 전송 (세션 인증)
        });

        // 응답이 JSON이 아닐 수도 있으므로 체크
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: {
                        code: response.status.toString(),
                        message: data.error || data.message || "알 수 없는 오류가 발생했습니다.",
                    },
                };
            }

            // 성공 응답
            return {
                success: true,
                data: data,
            };
        } else {
            // JSON이 아닌 응답
            if (!response.ok) {
                return {
                    success: false,
                    error: {
                        code: response.status.toString(),
                        message: "서버 오류가 발생했습니다.",
                    },
                };
            }

            return {
                success: true,
                data: {} as T,
            };
        }
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

// ============ 헬스 체크 API ============

export const healthApi = {
    /**
     * 서버 상태 확인
     */
    check: async (): Promise<ApiResponse<{ status: string; message: string }>> => {
        return apiRequest<{ status: string; message: string }>("/health", { method: "GET" });
    },
};

// ============ 상품 API ============

export const productApi = {
    /**
     * 상품 목록 조회
     */
    getProducts: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        sort?: "latest" | "popular" | "price_low" | "price_high";
    }): Promise<ApiResponse<ProductListResponse>> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.limit) queryParams.set("limit", params.limit.toString());
        if (params?.status) queryParams.set("status", params.status);
        if (params?.search) queryParams.set("search", params.search);
        if (params?.sort) queryParams.set("sort", params.sort);

        const query = queryParams.toString();
        const endpoint = `/products${query ? `?${query}` : ""}`;

        return apiRequest<ProductListResponse>(endpoint, { method: "GET" });
    },

    /**
     * 상품 상세 조회
     */
    getProduct: async (productId: string): Promise<ApiResponse<ProductDetail>> => {
        return apiRequest<ProductDetail>(`/products/${productId}`, { method: "GET" });
    },

    /**
     * 상품 등록
     */
    createProduct: async (
        data: CreateProductRequest
    ): Promise<ApiResponse<ProductDetail>> => {
        // FormData 사용 (이미지 업로드)
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("price", data.price.toString());
        if (data.description) {
            formData.append("description", data.description);
        }

        // 이미지 파일들 추가
        data.images.forEach((image, index) => {
            formData.append("images", image);
        });

        return apiRequest<ProductDetail>(
            "/products",
            {
                method: "POST",
                body: formData,
                headers: {}, // FormData는 Content-Type을 자동 설정
            }
        );
    },

    /**
     * 상품 수정
     */
    updateProduct: async (
        productId: string,
        data: UpdateProductRequest
    ): Promise<ApiResponse<ProductDetail>> => {
        return apiRequest<ProductDetail>(
            `/products/${productId}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            }
        );
    },

    /**
     * 상품 삭제
     */
    deleteProduct: async (productId: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest<{ message: string }>(
            `/products/${productId}`,
            {
                method: "DELETE",
            }
        );
    },

    /**
     * 내 상품 목록 조회
     */
    getMyProducts: async (params?: {
        status?: 'DRAFT' | 'ACTIVE' | 'SOLD' | 'DELETED';
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<ProductListResponse>> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set("status", params.status);
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.limit) queryParams.set("limit", params.limit.toString());

        const query = queryParams.toString();
        const endpoint = `/my-products${query ? `?${query}` : ""}`;

        return apiRequest<ProductListResponse>(endpoint, { method: "GET" });
    },
};

// ============ 좋아요 API ============

export const likeApi = {
    /**
     * 좋아요 추가
     */
    addLike: async (productId: string): Promise<ApiResponse<LikeResponse>> => {
        return apiRequest<LikeResponse>(
            `/products/${productId}/like`,
            {
                method: "POST",
            }
        );
    },

    /**
     * 좋아요 취소
     */
    removeLike: async (productId: string): Promise<ApiResponse<LikeResponse>> => {
        return apiRequest<LikeResponse>(
            `/products/${productId}/like`,
            {
                method: "DELETE",
            }
        );
    },
};

// ============ 인증 API ============

export const authApi = {
    /**
     * 로그인
     */
    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
        return apiRequest<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * 회원가입
     */
    signup: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
        return apiRequest<AuthResponse>("/auth/signup", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * 로그아웃
     */
    logout: async (): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest<{ message: string }>(
            "/auth/logout",
            {
                method: "POST",
            }
        );
    },
};

// ============ 사용자 API ============

export const userApi = {
    /**
     * 프로필 조회
     */
    getProfile: async (): Promise<ApiResponse<User>> => {
        return apiRequest<User>("/users/profile", { method: "GET" });
    },

    /**
     * 프로필 수정
     */
    updateProfile: async (data: {
        nickname?: string;
        password?: string;
        img?: string;
    }): Promise<ApiResponse<{ message: string; user: User }>> => {
        return apiRequest<{ message: string; user: User }>(
            "/users/profile",
            {
                method: "PUT",
                body: JSON.stringify(data),
            }
        );
    },
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

            const response = await fetch(`${API_BASE_URL}/upload/image`, {
                method: "POST",
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: {
                        code: "UPLOAD_ERROR",
                        message: data.error || "이미지 업로드에 실패했습니다.",
                    },
                };
            }

            return {
                success: true,
                data: data,
            };
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

// ============ 기본 export ============

export default {
    health: healthApi,
    product: productApi,
    like: likeApi,
    auth: authApi,
    user: userApi,
    upload: uploadApi,
};
