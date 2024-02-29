import winston from 'winston';
import 'winston-daily-rotate-file'
//khởi tạo 1 transport để lưu trữ các lỗi
let transports = [
    new winston.transports.DailyRotateFile(
        {
            filename: './logs/errors-%DATE%.log',
            level: 'error',
            zippedArchive: true,
            maxFiles: '14d',
            maxSize: '20m'
        }
    )
]

transports.push(new winston.transports.Console())
transports.push(new winston.transports.DailyRotateFile(
    {
        filename: './logs/errors-%DATE%.log',
        level: 'debug',
        zippedArchive: true,
        maxFiles: '7d',
        maxSize: '20m'
    }
))
const logger = new winston.createLogger({
    level: 'debug', // các mức độ: error, warn, info, verbose, debug, silly
    transports: transports,
    exitOnError: false
})

export default logger;