import timeout from 'connect-timeout';

const timeoutMiddleware = [
    timeout('3s'),
    (req, res, next) => {
        console.log('이벤트 리스너 등록');
        req.on('timeout', () => {
            console.log('타임아웃 이벤트 발생');
            res.status(408).send('Timeout from event listener');
        });
        next();
    },
];

export default timeoutMiddleware;
