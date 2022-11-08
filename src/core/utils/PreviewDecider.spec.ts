import { PreviewDecider } from './PreviewDecider';

describe('PreviewDecider', () => {
  describe('isBrowserEnvironment', () => {
    it('should check for BrowserEnvironment', () => {
      /* set self */
      Object.defineProperty(window, 'self', { get: () => window, configurable: true });
      /* confirm self not to be undefined */
      expect(self).toBeDefined();

      const result = PreviewDecider.isBrowserEnvironment();

      expect(result).toEqual(true);
    });
    it('should check for BrowserEnvironment when self undefined', () => {
      /* confirm self to be undefined */
      Object.defineProperty(window, 'self', { get: () => undefined, configurable: true });
      expect(self).toBeUndefined();

      const result = PreviewDecider.isBrowserEnvironment();

      expect(result).toEqual(false);
    });
  });
  describe.skip('isPreviewNeeded', () => {
    it('should check if preview is needed via the referer', () => {
      const testServer = 'https://localhost.e-spirit.live/';
      /* redefine referrer */
      Object.defineProperty(document, 'referrer', { get: () => testServer, configurable: true });
      Object.defineProperty(window, 'self', { get: () => window, configurable: true });

      /* confirm it is changed */
      expect(document.referrer).toEqual(testServer);

      const result = PreviewDecider.isPreviewNeeded();

      expect(result).toEqual(true);
    });
    it('should return false when referrer does not match the server', () => {
      const testServer = 'notConfiguredServer';
      Object.defineProperty(document, 'referrer', { get: () => testServer, configurable: true });
      Object.defineProperty(window, 'self', { get: () => window, configurable: true });
      /* confirm referer is an empty string */
      expect(document.referrer).toEqual(testServer);

      const result = PreviewDecider.isPreviewNeeded();

      expect(result).toEqual(false);
    });
  });
});
