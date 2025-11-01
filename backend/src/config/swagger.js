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
                        id: {
                            type: 'integer',
                            description: '사용자 ID',
                        },
                        email: {
                            type: 'string',
                            description: '이메일',
                        },
                        username: {
                            type: 'string',
                            description: '사용자 이름',
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
                        id: {
                            type: 'integer',
                            description: '상품 ID',
                        },
                        title: {
                            type: 'string',
                            description: '상품 제목',
                        },
                        description: {
                            type: 'string',
                            description: '상품 설명',
                        },
                        price: {
                            type: 'number',
                            description: '가격',
                        },
                        image_url: {
                            type: 'string',
                            description: '이미지 URL',
                        },
                        user_id: {
                            type: 'integer',
                            description: '작성자 ID',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: '생성일',
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: '수정일',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: '에러 메시지',
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
                name: 'Products',
                description: '상품 관련 API',
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export default specs;
