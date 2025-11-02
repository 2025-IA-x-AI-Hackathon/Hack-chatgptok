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
    ServerEnvelope,
    Product,
    ProductListResponse,
    ProductDetail,
    ProductDetailResponse,
    CreateProductRequest,
    UpdateProductRequest,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    // RefreshTokenResponse,
    LikeResponse,
    ImageUploadResponse,
    PresignedUrlsRequest,
    PresignedUrlsResponse,
    ChatRoom,
    ChatRoomDetail,
    // ChatMessagesResponse,
    CreateChatRoomRequest,
    SendMessageRequest,
    ChatMessage,
    User,
    GenerateDescriptionRequest,
    GenerateDescriptionResponse,
} from "./types";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
const INSPECT_API_URL = "http://kaprpc.iptime.org:5052";

// ============ 헬퍼 함수 ============

/**
 * 세션 스토리지에서 액세스 토큰 가져오기
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
export function clearTokens(): void {
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
 *
 * 서버 응답 구조:
 * - Axios response: response
 * - Server envelope: response.data → { success, message, data }
 * - 실제 페이로드: response.data.data → { 실제 데이터 }
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

        const envelope: ServerEnvelope<T> = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: {
                    code: "API_ERROR",
                    message: envelope.message || "알 수 없는 오류가 발생했습니다.",
                },
            };
        }

        // 서버 envelope에서 실제 데이터 추출
        return {
            success: envelope.success,
            data: envelope.data,
        };
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
    }): Promise<ApiResponse<ProductListResponse>> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.limit) queryParams.set("limit", params.limit.toString());
        if (params?.status) queryParams.set("status", params.status);
        if (params?.search) queryParams.set("search", params.search);

        const query = queryParams.toString();
        const endpoint = `/products${query ? `?${query}` : ""}`;

        return apiRequest<ProductListResponse>(endpoint, { method: "GET" });
    },

    /**
     * 상품 상세 조회
     */
    getProduct: async (id: string): Promise<ApiResponse<ProductDetailResponse>> => {
        return apiRequest<ProductDetailResponse>(`/products/${id}`, { method: "GET" });
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
        productId: string,
        data: UpdateProductRequest
    ): Promise<ApiResponse<ProductDetail>> => {
        return apiRequest<ProductDetail>(
            `/products/${productId}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            },
            true
        );
    },

    /**
     * 상품 삭제
     */
    deleteProduct: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest<{ message: string }>(
            `/products/${id}`,
            {
                method: "DELETE",
            },
            true
        );
    },

    /**
     * 내가 등록한 상품 목록 조회
     */
    getMyProducts: async (): Promise<ApiResponse<Product[]>> => {
        return apiRequest<Product[]>(
            "/my-products",
            {
                method: "GET",
            },
            true // 인증 필요
        );
    },

    /**
     * AI 상품 설명 생성
     */
    generateDescription: async (data: {
        title?: string;
        price?: number;
        category?: string;
    }): Promise<ApiResponse<{ description: string }>> => {
        return apiRequest<{ description: string }>(
            "/products/ai/generate-description",
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
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
        , true);
    },

    /**
     * 좋아요 취소
     */
    removeLike: async (productId: string): Promise<ApiResponse<LikeResponse>> => {
        return apiRequest<LikeResponse>(
            `/products/${productId}/like`,
            {
                method: "DELETE",
            },
            true
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
        return apiRequest<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
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

        // 로그아웃 성공 시 토큰 제거
        if (response.success) {
            clearTokens();
        }

        return response;
    },

    getMe: async (): Promise<ApiResponse<{ user: User }>> => {
        return apiRequest<{ user: User }>("/auth/me", {
            method: "GET",
        }, true); // 인증 필요
    },
};

// ============ 사용자 API ============

export const userApi = {
    /**
     * 프로필 조회
     */
    getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
        return apiRequest<{ user: User }>("/users/me", { method: "GET" }, true);
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
     * Presigned URL 받기
     */
    getPresignedUrls: async (
        request: PresignedUrlsRequest
    ): Promise<ApiResponse<PresignedUrlsResponse>> => {
        return apiRequest<PresignedUrlsResponse>(
            "/upload/presigned-urls",
            {
                method: "POST",
                body: JSON.stringify(request),
            },
            true // 인증 필요
        );
    },

    /**
     * S3에 파일 업로드
     */
    uploadToS3: async (
        uploadUrl: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<boolean> => {
        try {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                // 업로드 진행률 추적
                if (onProgress) {
                    xhr.upload.addEventListener("progress", (e) => {
                        if (e.lengthComputable) {
                            const progress = (e.loaded / e.total) * 100;
                            onProgress(progress);
                        }
                    });
                }

                xhr.addEventListener("load", () => {
                    if (xhr.status === 200) {
                        resolve(true);
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                });

                xhr.addEventListener("error", () => {
                    reject(new Error("Upload failed"));
                });

                xhr.open("PUT", uploadUrl);
                // xhr.setRequestHeader("Content-Type", file.type);
                xhr.send(file);
            });
        } catch (error) {
            console.error("S3 Upload Error:", error);
            return false;
        }
    },

    /**
     * 여러 이미지를 순차적으로 업로드
     */
    uploadImages: async (
        files: File[],
        onProgress?: (current: number, total: number, fileProgress: number) => void
    ): Promise<ApiResponse<string[]>> => {
        try {
            // 1. Presigned URL 받기
            const presignedRequest: PresignedUrlsRequest = {
                files: files.map((file) => ({
                    filename: file.name,
                    contentType: file.type,
                })),
            };

            const presignedResponse = await uploadApi.getPresignedUrls(presignedRequest);

            if (!presignedResponse.success || !presignedResponse.data) {
                return {
                    success: false,
                    error: presignedResponse.error || {
                        code: "PRESIGNED_URL_ERROR",
                        message: "Presigned URL을 받아오는데 실패했습니다.",
                    },
                };
            }

            // 2. 각 파일을 S3에 업로드
            const uploadedKeys: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const uploadInfo = presignedResponse.data.uploads[i];

                const success = await uploadApi.uploadToS3(
                    uploadInfo.uploadUrl,
                    file,
                    (fileProgress) => {
                        if (onProgress) {
                            onProgress(i + 1, files.length, fileProgress);
                        }
                    }
                );

                if (!success) {
                    return {
                        success: false,
                        error: {
                            code: "S3_UPLOAD_ERROR",
                            message: `${file.name} 업로드에 실패했습니다.`,
                        },
                    };
                }

                uploadedKeys.push(uploadInfo.key);
            }

            return {
                success: true,
                data: uploadedKeys,
            };
        } catch (error) {
            console.error("Images Upload Error:", error);
            return {
                success: false,
                error: {
                    code: "UPLOAD_ERROR",
                    message: "이미지 업로드 중 오류가 발생했습니다.",
                },
            };
        }
    },

    /**
     * 이미지 업로드 (레거시)
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

            // 성공 응답을 ApiResponse 형태로 래핑
            return {
                success: true,
                data: data as ImageUploadResponse,
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

// ============ AI 설명 생성 API ============

export const aiApi = {
    /**
     * AI 상품 설명 생성
     * 첫 번째 이미지로부터 자동으로 상품 설명 생성
     */
    generateDescription: async (
        data: GenerateDescriptionRequest
    ): Promise<ApiResponse<GenerateDescriptionResponse>> => {
        try {
            const response = await fetch(`${INSPECT_API_URL}/inspect/analyze_desc`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: {
                        code: "AI_GENERATION_ERROR",
                        message: "AI 설명 생성에 실패했습니다.",
                    },
                };
            }

            const result: GenerateDescriptionResponse = await response.json();

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error("AI Description Generation Error:", error);
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

export const chatApi = {
    /**
     * 채팅방 생성 또는 조회
     */
    createOrGetChatRoom: async (
        data: CreateChatRoomRequest
    ): Promise<ApiResponse<{ data: ChatRoom }>> => {
        return apiRequest<{ data: ChatRoom }>(
            "/chat/rooms",
            {
                method: "POST",
                body: JSON.stringify(data),
            },
            true
        );
    },

    /**
     * 채팅방 목록 조회
     */
    getChatRooms: async (): Promise<ApiResponse<ChatRoom[]>> => {
        return apiRequest<ChatRoom[]>(
            "/chat/rooms",
            {
                method: "GET",
            },true
        );
    },

    /**
     * 채팅방 상세 조회
     */
    getChatRoomDetail: async (
        chatRoomId: string
    ): Promise<ApiResponse<ChatRoomDetail>> => {
        return apiRequest<ChatRoomDetail>(
            `/chat/rooms/${chatRoomId}`,
            {
                method: "GET",
            },
            true
        );
    },

    /**
     * 메시지 목록 조회
     */
    getMessages: async (
        chatRoomId: string
    ): Promise<ApiResponse<ChatMessage[]>> => {
        return apiRequest<ChatMessage[]>(
            `/chat/rooms/${chatRoomId}/messages`,
            {
                method: "GET",
            },
            true
        );
    },

    /**
     * 메시지 전송
     */
    sendMessage: async (
        chatRoomId: string,
        data: SendMessageRequest
    ): Promise<ApiResponse<{ data: ChatMessage }>> => {
        return apiRequest<{ data: ChatMessage }>(
            `/chat/rooms/${chatRoomId}/messages`,
            {
                method: "POST",
                body: JSON.stringify(data),
            },
            true
        );
    },

    /**
     * 메시지 읽음 처리
     */
    markAsRead: async (
        chatRoomId: string
    ): Promise<ApiResponse<{ data: { count: number } }>> => {
        return apiRequest<{ data: { count: number } }>(
            `/chat/rooms/${chatRoomId}/read`,
            {
                method: "POST",
            },
            true
        );
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
    ai: aiApi,
    chat: chatApi
};