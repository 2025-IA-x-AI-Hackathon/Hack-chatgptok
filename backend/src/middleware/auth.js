export const isAuthenticated = (req, res, next) => {
    console.log('세션 전체:', req.session);
    console.log('세션 ID:', req.sessionID);
    console.log('쿠키:', req.headers.cookie);
    console.log('요청 경로:', req.path);
    console.log('요청 메소드:', req.method);

    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: '인증이 필요합니다.' });
};

export default isAuthenticated;
