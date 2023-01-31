/**
 * @module
 * @internal
 */
import { inspect } from 'node-inspect-extracted';
import { EcomError } from '../../api/errors';

/**
 * Logger class.
 *
 * @internal
 * @export
 * @class Logger
 */
export class Logger {
  private readonly _name: string;

  constructor(name: string) {
    this._name = name;
  }

  logWithLevel({logLevel, log, text = 'black', label, bg}: Logging.Level, ...args: any[]) {
    if (Logging.logLevel <= logLevel) {
      log(
        `%c FCECOM API %c ${label} %c ${this._name}`,
        'color: gray;',
        `color: ${text}; background-color: ${bg};`,
        'color: gray;',
        formatOutput(...args),
        '\n',
        ...additionalObjects(...args)
      );
    }
  }

  log(...args: any[]) {
    this.info(args);
  }

  debug(...args: any[]) {
    this.logWithLevel(Logging.levels.debug, ...args);
  }

  info(...args: any[]) {
    this.logWithLevel(Logging.levels.info, ...args);
  }

  success(...args: any[]) {
    this.logWithLevel(Logging.levels.success, ...args);
  }

  warn(...args: any[]) {
    this.logWithLevel(Logging.levels.warn, ...args);
  }

  error(...args: any[]) {
    this.logWithLevel(Logging.levels.error, ...args);
  }
}

export const formatOutput = (...args: any[]) => {
  const entries = args
    .map((entry) => {
      if (entry instanceof EcomError) return `(${entry.code}) ${entry.name} · ${entry.message}`;
      if (entry instanceof Error) return `${entry.name} · ${entry.message}`;
      if (typeof entry === 'object') return '';
      return entry;
    })
    .filter((entry) => entry !== '');

  if (entries.length) {
    return inspect(entries.join(' · '), {
      showHidden: false,
      depth: null,
      colors: false,
      compact: true,
      breakLength: Infinity,
    }).replace(/'/g, '');
  }

  return '';
};

export const additionalObjects = (...args: any[]) => args
  .filter((entry) => typeof entry === 'object');

/**
 * The log level to use.
 *
 * @export
 * @enum {number}
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Create a logger with a specific name.
 *
 * @internal
 * @param loggerName Name of the logger to create.
 * @returns The created logger instance.
 */
export const getLogger = (loggerName: string): Logger => new Logger(loggerName);

/**
 * Namespace for the logging.
 *
 * @internal
 */
export namespace Logging {
  export type Level = {
    bg: string;
    label: string;
    text?: string;
    log: (message?: any, ...optionalParams: any[]) => void;
    logLevel: LogLevel;
  };

  export type Levels = {
    debug: Level;
    info: Level;
    success: Level;
    warn: Level;
    error: Level;
  };

  export const levels: Levels = {
    debug: {
      bg: 'gray',
      text: 'white',
      label: 'DEBUG',
      log: console.debug,
      logLevel: LogLevel.DEBUG,
    },
    info: {
      bg: 'blue',
      text: 'white',
      label: 'INFO',
      log: console.log,
      logLevel: LogLevel.INFO,
    },
    success: {
      bg: 'green',
      text: 'white',
      label: 'SUCCESS',
      log: console.log,
      logLevel: LogLevel.INFO,
    },
    warn: {
      bg: 'yellow',
      label: 'WARN',
      log: console.warn,
      logLevel: LogLevel.WARNING,
    },
    error: {
      bg: 'red',
      text: 'white',
      label: 'ERROR',
      log: console.error,
      logLevel: LogLevel.ERROR,
    },
  };

  export let logLevel = LogLevel.INFO;

  /**
   * Initialize the logger.
   *
   * @param level The log level to set.
   */
  export const init = (level: LogLevel) => {
    logLevel = level ?? LogLevel.INFO;
    getLogger('Logging').info(`LogLevel set to '${LogLevel[logLevel]}'`);
  };
}
