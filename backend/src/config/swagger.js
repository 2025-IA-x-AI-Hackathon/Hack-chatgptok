import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hack-chatgptok API',
            version: '1.0.0',
            description: 'Hack-chatgptok Backend API 문서',
        },
        servers: [
            {
                url: 'http://localhost:8000',
                description: '개발 서버',
            },
            {
                url: 'http://52.79.148.54:8000',
                description: '프로덕션 서버',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'connect.sid',
                    description: '세션 쿠키 인증',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        member_id: {
                            type: 'integer',
                            description: '회원 ID',
                            example: 1,
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: '이메일',
                            example: 'user@example.com',
                        },
                        nickname: {
                            type: 'string',
                            description: '닉네임',
                            example: '홍길동',
                        },
                        img: {
                            type: 'string',
                            nullable: true,
                            description: '프로필 이미지 URL',
                            example: 'https://example.com/profile.jpg',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: '생성일',
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: '수정일',
                        },
                    },
                },
                ProductImage: {
                    type: 'object',
                    properties: {
                        image_id: {
                            type: 'integer',
                            description: '이미지 ID',
                        },
                        product_id: {
                            type: 'string',
                            format: 'uuid',
                            description: '상품 ID (UUID)',
                        },
                        s3_url: {
                            type: 'string',
                            description: 'S3 이미지 URL',
                            example: 'https://bucket.s3.amazonaws.com/products/image.jpg',
                        },
                        sort_order: {
                            type: 'integer',
                            description: '이미지 정렬 순서',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: '생성일',
                        },
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        product_id: {
                            type: 'string',
                            format: 'uuid',
                            description: '상품 ID (UUID)',
                            example: '550e8400-e29b-41d4-a716-446655440000',
                        },
                        member_id: {
                            type: 'integer',
                            description: '판매자 회원 ID',
                        },
                        name: {
                            type: 'string',
                            description: '상품명',
                            example: '멋진 상품',
                        },
                        price: {
                            type: 'integer',
                            description: '가격 (원)',
                            example: 50000,
                        },
                        description: {
                            type: 'string',
                            description: '상품 설명',
                            example: '이 상품은 정말 멋집니다',
                        },
                        sell_status: {
                            type: 'string',
                            enum: ['DRAFT', 'ACTIVE', 'DELETED', 'SOLD', 'PROCESSING'],
                            description: '판매 상태',
                            example: 'ACTIVE',
                        },
                        job_count: {
                            type: 'integer',
                            description: '작업 카운트',
                            default: 0,
                        },
                        ply_url: {
                            type: 'string',
                            nullable: true,
                            description: 'PLY 파일 URL',
                        },
                        viewer_url: {
                            type: 'string',
                            nullable: true,
                            description: '뷰어 URL',
                        },
                        view_cnt: {
                            type: 'integer',
                            description: '조회수',
                            default: 0,
                        },
                        like_cnt: {
                            type: 'integer',
                            description: '좋아요 수',
                            default: 0,
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: '생성일',
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: '수정일',
                        },
                        seller_nickname: {
                            type: 'string',
                            description: '판매자 닉네임',
                        },
                        seller_email: {
                            type: 'string',
                            description: '판매자 이메일',
                        },
                        seller_img: {
                            type: 'string',
                            nullable: true,
                            description: '판매자 프로필 이미지',
                        },
                        seller_created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: '판매자 가입일',
                        },
                        images: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/ProductImage',
                            },
                            description: '상품 이미지 목록',
                        },
                    },
                },
                ProductListItem: {
                    type: 'object',
                    properties: {
                        product_id: {
                            type: 'string',
                            format: 'uuid',
                            description: '상품 ID (UUID)',
                        },
                        member_id: {
                            type: 'integer',
                            description: '판매자 회원 ID',
                        },
                        name: {
                            type: 'string',
                            description: '상품명',
                        },
                        price: {
                            type: 'integer',
                            description: '가격 (원)',
                        },
                        description: {
                            type: 'string',
                            description: '상품 설명',
                        },
                        sell_status: {
                            type: 'string',
                            enum: ['DRAFT', 'ACTIVE', 'DELETED', 'SOLD', 'PROCESSING'],
                            description: '판매 상태',
                        },
                        view_cnt: {
                            type: 'integer',
                            description: '조회수',
                        },
                        like_cnt: {
                            type: 'integer',
                            description: '좋아요 수',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: '생성일',
                        },
                        seller_nickname: {
                            type: 'string',
                            description: '판매자 닉네임',
                        },
                        seller_img: {
                            type: 'string',
                            nullable: true,
                            description: '판매자 프로필 이미지',
                        },
                        thumbnail: {
                            type: 'string',
                            nullable: true,
                            description: '썸네일 이미지 URL',
                        },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'integer',
                            description: '현재 페이지',
                        },
                        limit: {
                            type: 'integer',
                            description: '페이지당 항목 수',
                        },
                        total: {
                            type: 'integer',
                            description: '전체 항목 수',
                        },
                        totalPages: {
                            type: 'integer',
                            description: '전체 페이지 수',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: '에러 메시지',
                        },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: '성공했습니다.',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Health',
                description: '서버 상태 확인',
            },
            {
                name: 'Auth',
                description: '인증 관련 API',
            },
            {
                name: 'Users',
                description: '사용자 관련 API',
            },
            {
                name: 'Upload',
                description: '파일 업로드 관련 API (S3 Pre-signed URL)',
            },
            {
                name: 'Products',
                description: '상품 관련 API',
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export default specs;
