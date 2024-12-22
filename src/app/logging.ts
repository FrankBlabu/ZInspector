//
// logging.ts - Logging utilities
//

import { pino } from 'pino';
import { LogLevel } from './config';

const logger = pino({
    level: LogLevel,
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: true,
        },
    },
    });

export default logger;
