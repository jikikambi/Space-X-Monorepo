
import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const logger = pino(
  isProd ? {} 
    : {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: true,
        },
      },
      level: process.env.LOG_LEVEL || 'info',
    });

export default logger;
