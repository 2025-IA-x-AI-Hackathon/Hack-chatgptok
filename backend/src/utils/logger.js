import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';
import colors from 'colors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 로그 디렉토리 경로
const logDir = path.join(__dirname, '../../logs');

// 로그 디렉토리가 없으면 생성
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

/**
 * 로그 레벨
 */
export const LOG_LEVEL = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    QUERY: 'QUERY',
};

/**
 * 상세한 타임스탬프 생성 (한국 시간 기준)
 * @returns {string} YYYY-MM-DD HH:mm:ss.SSS [KST] 형식
 */
const getDetailedTimestamp = () => {
    const now = moment().utcOffset('+09:00');
    return now.format('YYYY-MM-DD HH:mm:ss.SSS') + ' [KST]';
};

/**
 * 로그 파일 경로 생성 (일별)
 * @param {string} level - 로그 레벨
 * @returns {string} 로그 파일 경로
 */
const getLogFilePath = (level) => {
    const date = moment().utcOffset('+09:00').format('YYYY-MM-DD');
    const filename = `${date}-${level.toLowerCase()}.log`;
    return path.join(logDir, filename);
};

/**
 * 로그 파일에 기록
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} meta - 추가 메타데이터
 */
const writeToFile = (level, message, meta = {}) => {
    const timestamp = getDetailedTimestamp();
    const logEntry = {
        timestamp,
        level,
        message,
        ...meta,
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    const filePath = getLogFilePath(level);

    try {
        fs.appendFileSync(filePath, logLine, 'utf8');
    } catch (error) {
        console.error(colors.red(`[Logger] 파일 기록 실패: ${error.message}`));
    }
};

/**
 * 로그 레벨에 따른 색상
 */
const getColorForLevel = (level) => {
    switch (level) {
        case LOG_LEVEL.DEBUG:
            return colors.gray;
        case LOG_LEVEL.INFO:
            return colors.blue;
        case LOG_LEVEL.WARN:
            return colors.yellow;
        case LOG_LEVEL.ERROR:
            return colors.red;
        case LOG_LEVEL.QUERY:
            return colors.cyan;
        default:
            return colors.white;
    }
};

/**
 * 로거 클래스
 */
class Logger {
    /**
     * DEBUG 레벨 로그
     * @param {string} message - 로그 메시지
     * @param {Object} meta - 추가 정보
     */
    debug(message, meta = {}) {
        const timestamp = getDetailedTimestamp();
        const color = getColorForLevel(LOG_LEVEL.DEBUG);
        console.log(color(`[${timestamp}] [DEBUG] ${message}`), meta);
        writeToFile(LOG_LEVEL.DEBUG, message, meta);
    }

    /**
     * INFO 레벨 로그
     * @param {string} message - 로그 메시지
     * @param {Object} meta - 추가 정보
     */
    info(message, meta = {}) {
        const timestamp = getDetailedTimestamp();
        const color = getColorForLevel(LOG_LEVEL.INFO);
        console.log(color(`[${timestamp}] [INFO] ${message}`), meta);
        writeToFile(LOG_LEVEL.INFO, message, meta);
    }

    /**
     * WARN 레벨 로그
     * @param {string} message - 로그 메시지
     * @param {Object} meta - 추가 정보
     */
    warn(message, meta = {}) {
        const timestamp = getDetailedTimestamp();
        const color = getColorForLevel(LOG_LEVEL.WARN);
        console.warn(color(`[${timestamp}] [WARN] ${message}`), meta);
        writeToFile(LOG_LEVEL.WARN, message, meta);
    }

    /**
     * ERROR 레벨 로그
     * @param {string} message - 로그 메시지
     * @param {Error|Object} error - 에러 객체 또는 추가 정보
     * @param {Object} meta - 추가 메타데이터
     */
    error(message, error = null, meta = {}) {
        const timestamp = getDetailedTimestamp();
        const color = getColorForLevel(LOG_LEVEL.ERROR);

        const errorInfo = error
            ? {
                  name: error.name || 'Error',
                  message: error.message || String(error),
                  stack: error.stack || undefined,
              }
            : {};

        console.error(
            color(`[${timestamp}] [ERROR] ${message}`),
            errorInfo,
            meta,
        );

        writeToFile(LOG_LEVEL.ERROR, message, {
            ...errorInfo,
            ...meta,
        });
    }

    /**
     * 쿼리 로그
     * @param {string} query - SQL 쿼리
     * @param {Array} params - 쿼리 파라미터
     * @param {Object|Array} result - 쿼리 결과
     * @param {number} duration - 실행 시간 (밀리초)
     */
    query(query, params = null, result = null, duration = null) {
        const timestamp = getDetailedTimestamp();
        const color = getColorForLevel(LOG_LEVEL.QUERY);

        // 콘솔 출력
        console.log(color('\n─────────────────────────────'));
        console.log(color(`[${timestamp}] [QUERY]`));
        console.log(colors.white('Query:'), query);

        if (params && params.length > 0) {
            console.log(colors.green('Params:'), params);
        }

        if (duration !== null) {
            console.log(colors.magenta(`Duration: ${duration}ms`));
        }

        if (result !== null) {
            if (Array.isArray(result)) {
                console.log(colors.magenta(`Result: ${result.length} rows`));
                if (result.length > 0 && result.length <= 5) {
                    console.log(colors.magenta('Data:'), JSON.stringify(result, null, 2));
                } else if (result.length > 5) {
                    console.log(colors.magenta('Data (first 5):'), JSON.stringify(result.slice(0, 5), null, 2));
                    console.log(colors.gray(`... and ${result.length - 5} more rows`));
                }
            } else if (typeof result === 'object') {
                console.log(colors.magenta('Result:'), JSON.stringify(result, null, 2));
            } else {
                console.log(colors.magenta('Result:'), result);
            }
        }

        console.log(color('─────────────────────────────\n'));

        // 파일 기록
        const queryLog = {
            query,
            params: params || [],
            resultRows: Array.isArray(result) ? result.length : (result ? 1 : 0),
            duration,
            resultSample: Array.isArray(result) && result.length > 0 
                ? result.slice(0, 3) 
                : result,
        };

        writeToFile(LOG_LEVEL.QUERY, 'Database Query', queryLog);
    }

    /**
     * 쿼리 에러 로그
     * @param {string} query - SQL 쿼리
     * @param {Array} params - 쿼리 파라미터
     * @param {Error} error - 에러 객체
     */
    queryError(query, params = null, error = null) {
        const timestamp = getDetailedTimestamp();

        console.error(colors.red('\n─────────────────────────────'));
        console.error(colors.red(`[${timestamp}] [QUERY ERROR]`));
        console.error(colors.white('Query:'), query);
        if (params && params.length > 0) {
            console.error(colors.yellow('Params:'), params);
        }
        if (error) {
            console.error(colors.red('Error:'), {
                name: error.name,
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
                stack: error.stack,
            });
        }
        console.error(colors.red('─────────────────────────────\n'));

        // 파일 기록
        const errorLog = {
            query,
            params: params || [],
            error: error
                ? {
                      name: error.name,
                      message: error.message,
                      code: error.code,
                      errno: error.errno,
                      sqlState: error.sqlState,
                      sqlMessage: error.sqlMessage,
                      stack: error.stack,
                  }
                : null,
        };

        writeToFile(LOG_LEVEL.ERROR, 'Database Query Error', errorLog);
    }
}

// 싱글톤 인스턴스 export
export default new Logger();

