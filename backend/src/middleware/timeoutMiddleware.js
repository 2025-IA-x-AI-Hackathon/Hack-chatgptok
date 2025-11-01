import timeout from 'connect-timeout';
import logger from '../utils/logger.js';

const timeoutMiddleware = [
    timeout('3s'),
    (req, res, next) => {
        logger.debug('타임아웃 이벤트 리스너 등록');
        req.on('timeout', () => {
            logger.warn('타임아웃 이벤트 발생', { url: req.originalUrl, method: req.method });
            res.status(408).send('Timeout from event listener');
        });
        next();
    },
];

export default timeoutMiddleware;
