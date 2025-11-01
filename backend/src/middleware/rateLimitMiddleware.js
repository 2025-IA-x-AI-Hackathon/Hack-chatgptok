import rateLimit from 'express-rate-limit';

const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1500,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

export default rateLimitMiddleware;
