import UserModel from '../models/userModel.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwtUtil.js';

const authController = {
    // 회원가입
    async register(req, res) {
        console.log('[Auth] 회원가입 요청 시작:', { email: req.body.email, nickname: req.body.nickname });
        try {
            const { email, password, nickname, img } = req.body;

            // 유효성 검사
            if (!email || !password || !nickname) {
                console.log('[Auth] 회원가입 실패 - 필수 항목 누락');
                return res.status(400).json({
                    success: false,
                    message: '이메일, 비밀번호, 닉네임은 필수 항목입니다.',
                });
            }

            // 이메일 형식 검증
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log('[Auth] 회원가입 실패 - 잘못된 이메일 형식:', email);
                return res.status(400).json({
                    success: false,
                    message: '올바른 이메일 형식이 아닙니다.',
                });
            }

            // 비밀번호 길이 검증 (개발용 비활성화)
            // if (password.length < 6) {
            //     return res.status(400).json({
            //         success: false,
            //         message: '비밀번호는 최소 6자 이상이어야 합니다.',
            //     });
            // }

            // 중복 체크
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                console.log('[Auth] 회원가입 실패 - 이메일 중복:', email);
                return res.status(409).json({
                    success: false,
                    message: '이미 사용 중인 이메일입니다.',
                });
            }

            // 사용자 생성
            const newUser = await UserModel.createUser({
                email,
                password,
                nickname,
                img: img || null,
            });
            console.log('[Auth] 신규 사용자 생성 완료 - ID:', newUser.member_id);

            // JWT 토큰 생성
            const accessToken = generateAccessToken({
                memberId: newUser.member_id,
                email: newUser.email,
            });

            const refreshToken = generateRefreshToken({
                memberId: newUser.member_id,
            });

            // 비밀번호 제외하고 응답
            const userResponse = {
                member_id: newUser.member_id,
                email: newUser.email,
                nickname: newUser.nickname,
                img: newUser.img,
                created_at: newUser.created_at,
            };

            console.log('[Auth] 회원가입 성공 - 사용자 ID:', newUser.member_id, '이메일:', email);
            res.status(201).json({
                success: true,
                message: '회원가입이 완료되었습니다.',
                data: {
                    user: userResponse,
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            console.error('[Auth] 회원가입 에러:', error);
            res.status(500).json({
                success: false,
                message: error.message || '회원가입 처리 중 오류가 발생했습니다.',
            });
        }
    },

    // 로그인
    async login(req, res) {
        console.log('[Auth] 로그인 요청 시작:', { email: req.body.email });
        try {
            const { email, password } = req.body;

            // 유효성 검사
            if (!email || !password) {
                console.log('[Auth] 로그인 실패 - 이메일 또는 비밀번호 누락');
                return res.status(400).json({
                    success: false,
                    message: '이메일과 비밀번호를 입력해주세요.',
                });
            }

            // 사용자 조회
            const user = await UserModel.findByEmail(email);
            if (!user) {
                console.log('[Auth] 로그인 실패 - 사용자 없음:', email);
                return res.status(401).json({
                    success: false,
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                });
            }

            // 비밀번호 검증
            const isPasswordValid = await UserModel.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                console.log('[Auth] 로그인 실패 - 비밀번호 불일치:', email);
                return res.status(401).json({
                    success: false,
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                });
            }

            // JWT 토큰 생성
            const accessToken = generateAccessToken({
                memberId: user.member_id,
                email: user.email,
            });

            const refreshToken = generateRefreshToken({
                memberId: user.member_id,
            });

            // 비밀번호 제외하고 응답
            const userResponse = {
                member_id: user.member_id,
                email: user.email,
                nickname: user.nickname,
                img: user.img,
                created_at: user.created_at,
            };

            console.log('[Auth] 로그인 성공 - 사용자 ID:', user.member_id, '이메일:', email);
            res.status(200).json({
                success: true,
                message: '로그인에 성공했습니다.',
                data: {
                    user: userResponse,
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            console.error('[Auth] 로그인 에러:', error);
            res.status(500).json({
                success: false,
                message: '로그인 처리 중 오류가 발생했습니다.',
            });
        }
    },

    // 토큰 갱신
    async refreshToken(req, res) {
        console.log('[Auth] 토큰 갱신 요청 시작');
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                console.log('[Auth] 토큰 갱신 실패 - 리프레시 토큰 누락');
                return res.status(400).json({
                    success: false,
                    message: '리프레시 토큰이 필요합니다.',
                });
            }

            // 리프레시 토큰 검증
            let decoded;
            try {
                decoded = verifyToken(refreshToken);
            } catch (error) {
                console.log('[Auth] 토큰 갱신 실패 - 토큰 검증 실패:', error.message);
                return res.status(401).json({
                    success: false,
                    message: error.message || '유효하지 않은 리프레시 토큰입니다.',
                });
            }

            // 사용자 조회
            const user = await UserModel.findById(decoded.memberId);
            if (!user) {
                console.log('[Auth] 토큰 갱신 실패 - 사용자 없음, memberId:', decoded.memberId);
                return res.status(401).json({
                    success: false,
                    message: '사용자를 찾을 수 없습니다.',
                });
            }

            // 새로운 액세스 토큰 생성
            const newAccessToken = generateAccessToken({
                memberId: user.member_id,
                email: user.email,
            });

            console.log('[Auth] 토큰 갱신 성공 - 사용자 ID:', user.member_id);
            res.status(200).json({
                success: true,
                message: '토큰이 갱신되었습니다.',
                data: {
                    accessToken: newAccessToken,
                },
            });
        } catch (error) {
            console.error('[Auth] 토큰 갱신 에러:', error);
            res.status(500).json({
                success: false,
                message: '토큰 갱신 중 오류가 발생했습니다.',
            });
        }
    },

    // 로그아웃 (클라이언트에서 토큰 삭제로 처리)
    async logout(req, res) {
        console.log('[Auth] 로그아웃 요청');
        res.status(200).json({
            success: true,
            message: '로그아웃되었습니다.',
        });
    },
};

export default authController;
