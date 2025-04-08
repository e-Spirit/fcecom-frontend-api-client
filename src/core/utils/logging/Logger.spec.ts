import { formatOutput, Logger, Logging, LogLevel } from './Logger';

describe('Logger', () => {
  describe('constructor()', () => {
    it('uses fallback log level', () => {
      // Act
      Logging.init(undefined as any);
      // Assert
      expect(Logging.logLevel).toEqual(LogLevel.INFO);
    });
  });
  it('prints correct error message for Error object', () => {
    // Act & Assert
    expect(formatOutput(new Error('Failed formatting'))).toMatch(`Error · Failed formatting`);
  });

  [
    {
      method: 'debug',
      consoleMethod: 'debug',
      loggerConfig: Logging.levels.debug,
      level: LogLevel.DEBUG,
    },
    {
      method: 'log',
      consoleMethod: 'info',
      loggerConfig: Logging.levels.info,
      level: LogLevel.INFO,
    },
    {
      method: 'info',
      consoleMethod: 'info',
      loggerConfig: Logging.levels.info,
      level: LogLevel.INFO,
    },
    {
      method: 'success',
      consoleMethod: 'info',
      loggerConfig: Logging.levels.success,
      level: LogLevel.INFO,
    },
    {
      method: 'warn',
      consoleMethod: 'warn',
      loggerConfig: Logging.levels.warn,
      level: LogLevel.WARNING,
    },
    {
      method: 'error',
      consoleMethod: 'error',
      loggerConfig: Logging.levels.error,
      level: LogLevel.ERROR,
    },
  ].forEach((test) => {
    describe(`${test.method}()`, () => {
      it(`logs to the console if log level is at least ${test.method}`, () => {
        // Arrange
        Logging.init(test.level);
        const logger = new Logger(`MY TEST LOG ${test.method}`);
        const consoleSpy = jest.fn();
        global.console = { [test.consoleMethod]: consoleSpy } as any;
        // @ts-ignore
        test.loggerConfig.log = console[test.consoleMethod];
        // Act
        // @ts-ignore - Makes it easier for testing
        logger[test.method]('MY TEST LOG');
        // Assert
        expect(consoleSpy).toHaveBeenCalled();
      });
      it(`does not log to the console if log level above ${test.method}`, () => {
        // Arrange
        Logging.init(999);
        const logger = new Logger(test.method);
        const spy = jest.fn();
        global.console = { [test.consoleMethod]: spy } as any;
        // Act
        // @ts-ignore - Makes it easier for testing
        logger[test.method]('MY TEST LOG');
        // Assert
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });
});
