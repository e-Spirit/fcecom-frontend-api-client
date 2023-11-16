import { PreviewDecider } from '../utils/PreviewDecider';
import { EcomError, ERROR_CODES, HttpError } from './errors';
import { RemoteService } from './RemoteService';

const API_URL = 'https://api_url:3000';
let fetchResponse: any;
let fetchOk: boolean;
let fetchStatus: number;

let service: RemoteService;
describe('RemoteService', () => {
  beforeEach(() => {
    service = new RemoteService(API_URL);

    jest.spyOn(PreviewDecider, 'isPreview').mockResolvedValue(true);
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(fetchResponse),
        ok: fetchOk,
        status: fetchStatus,
      })
    );
    fetchResponse = undefined;
    fetchOk = true;
  });

  describe('constructor()', () => {
    it('creates an instance', () => {
      // Act
      const api = new RemoteService(API_URL);

      // Assert
      expect(api).toBeInstanceOf(RemoteService);
    });
  });

  describe('findPage()', () => {
    it('it finds a page', async () => {
      // Arrange
      fetchResponse = 'testPage';
      const expectedResult = 'testPage';
      // Act
      const result = await service.findPage({
        id: 'plumber0PIERRE*porch',
        locale: 'de',
        type: 'product',
      });

      // Assert
      expect(result).toEqual(expectedResult);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/findPage?id=plumber0PIERRE*porch&locale=de&type=product`, expect.anything());
    });
    it('it uses default values for parameters when finding a page', async () => {
      // Arrange
      fetchResponse = 'testPage';
      const expectedResult = 'testPage';
      service.setDefaultLocale('en_GB');

      // Act
      const result = await service.findPage({
        id: 'plumber0PIERRE*porch',
        type: 'product',
      });

      // Assert
      expect(result).toEqual(expectedResult);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/findPage?id=plumber0PIERRE*porch&locale=${service.defaultLocale}&type=product`, expect.anything());
    });
    it('throws error if fetch was not ok and status is 401', async () => {
      expect.assertions(2);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 401;

      // Act
      try {
        await service.findPage({
          id: 'plumber0PIERRE*porch',
          type: 'product',
        });
      } catch (err: any) {
        expect((err as EcomError).code).toEqual(ERROR_CODES.FIND_PAGE_UNAUTHORIZED);
        expect((err as EcomError).message).toEqual('Failed to fetch page');
      }
    });
    it('throws error if fetch was not ok and status is 400', async () => {
      expect.assertions(2);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 400;

      // Act
      try {
        await service.findPage({
          id: 'plumber0PIERRE*porch',
          type: 'product',
        });
      } catch (err: any) {
        expect((err as EcomError).code).toEqual(ERROR_CODES.FIND_PAGE_INVALID_REQUEST);
        expect((err as EcomError).message).toEqual('Failed to fetch page');
      }
    });
    it('throws error if fetch was not ok (fallback)', async () => {
      expect.assertions(2);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 500;

      // Act
      try {
        await service.findPage({
          id: 'plumber0PIERRE*porch',
          type: 'product',
        });
      } catch (err: any) {
        expect((err as EcomError).code).toEqual(ERROR_CODES.NO_CAAS_CONNECTION);
        expect((err as EcomError).message).toEqual('Failed to fetch page');
      }
    });
  });

  describe('fetchNavigation()', () => {
    it('it fetches the navigation', async () => {
      // Arrange
      fetchResponse = {};

      // Act
      const result = await service.fetchNavigation({
        locale: 'de_DE',
        initialPath: 'path',
      });

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/fetchNavigation?locale=de_DE&initialPath=path`, expect.anything());
    });
    it('it uses default values for parameters when fetching the navigation', async () => {
      // Arrange
      fetchResponse = {};
      service.setDefaultLocale('en_GB');

      // Act
      const result = await service.fetchNavigation({});

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/fetchNavigation?locale=${service.defaultLocale}`, expect.anything());
    });
    it('throws error if fetch was not ok and status is 401', async () => {
      expect.assertions(2);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 401;

      // Act
      try {
        await service.fetchNavigation({});
      } catch (err: any) {
        expect((err as EcomError).code).toEqual(ERROR_CODES.FETCH_NAVIGATION_UNAUTHORIZED);
        expect((err as EcomError).message).toEqual('Failed to fetch navigation');
      }
    });
    it('throws error if fetch was not ok and status is 400', async () => {
      expect.assertions(2);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 400;

      // Act
      try {
        await service.fetchNavigation({});
      } catch (err: any) {
        expect((err as EcomError).code).toEqual(ERROR_CODES.FETCH_NAVIGATION_INVALID_REQUEST);
        expect((err as EcomError).message).toEqual('Failed to fetch navigation');
      }
    });
    it('throws error if fetch was not ok (fallback)', async () => {
      expect.assertions(2);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 500;

      // Act
      try {
        await service.fetchNavigation({});
      } catch (err: any) {
        expect((err as EcomError).code).toEqual(ERROR_CODES.NO_NAVIGATION_SERVICE_CONNECTION);
        expect((err as EcomError).message).toEqual('Failed to fetch navigation');
      }
    });
  });

  describe('findElement()', () => {
    it('it finds an element', async () => {
      // Arrange
      fetchResponse = {};

      // Act
      const result = await service.findElement({
        fsPageId: 'plumber0PIERRE*porch',
        locale: 'de',
      });

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/findElement?fsPageId=plumber0PIERRE*porch&locale=de`, expect.anything());
    });
    it('it uses default values for parameters when finding a page', async () => {
      // Arrange
      fetchResponse = {};
      service.setDefaultLocale('en_GB');

      // Act
      const result = await service.findElement({
        fsPageId: 'plumber0PIERRE*porch',
      });

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/findElement?fsPageId=plumber0PIERRE*porch&locale=${service.defaultLocale}`, expect.anything());
    });
  });

  describe('setDefaultLocale()', () => {
    it('it should apply default locale correctly', async () => {
      // Arrange
      const locale = 'de_DE';

      // Act
      service.setDefaultLocale(locale);

      // Assert
      expect(service.defaultLocale).toBe(locale);
    });
  });
});
