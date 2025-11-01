export const isValidPassword = (req, res, next) => {
    let password;

    // FormData 또는 JSON 요청에서 비밀번호 추출
    if (req.is('multipart/form-data')) {
        password = req.body.password;
    } else {
        password = req.body.password;
    }

    // 디버깅을 위한 로그
    console.log('Password received:', password);

    if (!password) {
        return res.status(400).json({ message: '비밀번호를 입력해주세요.' });
    }

    // 비밀번호 길이 체크 (8-20자)
    if (password.length < 8 || password.length > 20) {
        return res.status(400).json({
            message: '비밀번호는 8자 이상 20자 이하여야 합니다.',
        });
    }

    // 대문자 체크
    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
            message: '비밀번호는 최소 1개의 대문자를 포함해야 합니다.',
        });
    }

    // 소문자 체크
    if (!/[a-z]/.test(password)) {
        return res.status(400).json({
            message: '비밀번호는 최소 1개의 소문자를 포함해야 합니다.',
        });
    }

    // 숫자 체크
    if (!/[0-9]/.test(password)) {
        return res.status(400).json({
            message: '비밀번호는 최소 1개의 숫자를 포함해야 합니다.',
        });
    }

    // 특수문자 체크
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({
            message: '비밀번호는 최소 1개의 특수문자를 포함해야 합니다.',
        });
    }

    next();
};

export default isValidPassword;
