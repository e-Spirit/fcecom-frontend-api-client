import { PreviewDecider } from './PreviewDecider';
import { ReferrerStore } from './ReferrerStore';

const API_URL = 'https://api_url:3000';
const TEST_REFERRER = 'https://referrer_url';

jest.mock('./ReferrerStore');

let fetchResponse: any;

describe('PreviewDecider', () => {
  beforeEach(() => {
    fetchResponse = undefined;
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(fetchResponse),
      })
    );
  });

  describe('isPreview()', () => {
    beforeEach(() => {
      PreviewDecider.setUrl(API_URL);
    });
    describe('in browser', () => {
      beforeEach(() => {
        jest.spyOn(ReferrerStore, 'getReferrer').mockImplementation(() => TEST_REFERRER);
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
          expect.objectContaining({
            url: `${API_URL}/ispreview`,
            headers: {
              map: {
                'x-referrer': TEST_REFERRER,
              }
            },
          })
        );
        expect(result).toEqual(true);
      });
      it('should return false if the server returns true', async () => {
        // Arrange
        fetchResponse = {
          isPreview: false,
        };
        // Act
        const result = await PreviewDecider.isPreview();
        // Assert
        expect(fetch).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            url: `${API_URL}/ispreview`,
            headers: {
              map: {
                'x-referrer': TEST_REFERRER,
              }
            },
          })
        );
        expect(result).toEqual(false);
      });
    });
  });
  describe('not in browser', () => {
    beforeEach(() => {
      jest.spyOn(ReferrerStore, 'getReferrer').mockImplementation(() => '');
      jest.spyOn(window, 'self', 'get').mockImplementation(() => undefined as any);
    });
    it('should return false', async () => {
      // Act
      const result = await PreviewDecider.isPreview();
      // Assert
      expect(result).toEqual(false);
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
