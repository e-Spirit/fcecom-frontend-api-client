import { Logging, LogLevel } from '../logging/Logger';

export namespace Verbosity {
  let previewMode: boolean = false;

  export const enablePreview = () => previewMode = true;

  export const debugMode = () => Logging.logLevel === LogLevel.DEBUG && previewMode;
}