/**
 * @internal
 * @module Logger
 */

import chalk from 'chalk';
import { inspect } from 'util';
import { LogLevel } from 'fsxa-api';

/**
 * @internal
 */
const formatOutput = (...args: any[]) => {
  args = args.map((entry) => {
    if (typeof entry === 'object') return JSON.stringify(entry);
    return entry;
  });
  return inspect(args.join(' | '), {
    showHidden: false,
    depth: null,
    colors: false,
    compact: true,
    breakLength: Infinity,
  }).replace(/'/g, '');
};

/**
 * @internal
 */
export class Logger {
  private readonly _logLevel: LogLevel;
  private readonly _name: string;

  constructor(logLevel: LogLevel, name: string) {
    this._logLevel = logLevel;
    this._name = name;
  }

  debug(...args: any[]) {
    if (this._logLevel <= LogLevel.DEBUG) {
      console.debug(chalk.gray(`${chalk.bgWhite.black(' DEBUG ')} ${this._name} | ${formatOutput(...args)}`));
    }
  }

  log(...args: any[]) {
    this.info(args);
  }

  info(...args: any[]) {
    if (this._logLevel <= LogLevel.INFO) {
      console.info(chalk.blue(`${chalk.bgBlue.white(' INFO ')} ${this._name} | ${formatOutput(...args)}`));
    }
  }

  warn(...args: any[]) {
    if (this._logLevel <= LogLevel.WARNING) {
      console.warn(chalk.yellow(`${chalk.bgYellow.black(' WARN ')} ${this._name} | ${formatOutput(...args)}`));
    }
  }

  error(...args: any[]) {
    if (this._logLevel <= LogLevel.ERROR) {
      console.error(chalk.red(`${chalk.bgRed.black(' ERROR ')} ${this._name} | ${formatOutput(...args)}`));
    }
  }
}

export { LogLevel };