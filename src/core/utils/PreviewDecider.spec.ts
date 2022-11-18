import { PreviewDecider } from './PreviewDecider';

const API_URL = 'https://api_url:3000';
const TEST_REFERRER = 'https://referrer_url';

let fetchResponse: any;
// @ts-ignore
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(fetchResponse),
  })
);

describe('PreviewDecider', () => {
  beforeEach(() => {
    fetchResponse = undefined;
  });

  describe('isPreview()', () => {
    beforeEach(() => {
      PreviewDecider.setUrl(API_URL);
    });
    describe('in browser', () => {
      beforeEach(() => {
        jest.spyOn(document, 'referrer', 'get').mockImplementation(() => TEST_REFERRER);
        jest.spyOn(window, 'self', 'get').mockImplementation(() => window);
      });
      it('should return true if the server returns true', async () => {
        // Arrange
        fetchResponse = {
          isPreview: true,
        };
        // Act
        const result = await PreviewDecider.isPreview();
        // Assert
        expect(fetch).toHaveBeenNthCalledWith(
          1,
          `${API_URL}/ispreview`,
          expect.objectContaining({
            headers: {
              'X-Referrer': TEST_REFERRER,
            },
          })
        );
        expect(result).toEqual(true);
      });
      it('should return true if the server returns true', async () => {
        // Arrange
        fetchResponse = {
          isPreview: false,
        };
        // Act
        const result = await PreviewDecider.isPreview();
        // Assert
        expect(fetch).toHaveBeenNthCalledWith(
          1,
          `${API_URL}/ispreview`,
          expect.objectContaining({
            headers: {
              'X-Referrer': TEST_REFERRER,
            },
          })
        );
        expect(result).toEqual(false);
      });
    });
  });
  describe('not in browser', () => {
    beforeEach(() => {
      jest.spyOn(document, 'referrer', 'get').mockImplementation(() => '');
      jest.spyOn(window, 'self', 'get').mockImplementation(() => undefined as any);
    });
    it('should return false', async () => {
      // Act
      const result = await PreviewDecider.isPreview();
      // Assert
      expect(result).toEqual(false);
    });
  });

  describe('getReferrer()', () => {
    describe('in browser', () => {
      beforeEach(() => {
        jest.spyOn(window, 'self', 'get').mockImplementation(() => window);
      });
      it('returns the referrers origin', async () => {
        // Arrange
        jest.spyOn(document, 'referrer', 'get').mockImplementation(() => 'https://referrer.com:3000/mypath');
        // Act
        const result = PreviewDecider.getReferrer();
        // Assert
        expect(result).toEqual('https://referrer.com:3000');
      });
      it('returns referrer if origin cannot be extracted', async () => {
        // Arrange
        jest.spyOn(document, 'referrer', 'get').mockImplementation(() => 'blubb');
        // Act
        const result = PreviewDecider.getReferrer();
        // Assert
        expect(result).toEqual('blubb');
      });
    });
  });
  describe('not in browser', () => {
    beforeEach(() => {
      jest.spyOn(window, 'self', 'get').mockImplementation(() => undefined as any);
    });
    it('should return an empty string', async () => {
      // Act
      const result = PreviewDecider.getReferrer();
      // Assert
      expect(result).toEqual('');
    });
  });
});
