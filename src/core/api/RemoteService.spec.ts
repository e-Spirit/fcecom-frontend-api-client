import { PreviewDecider } from '../utils/PreviewDecider';
import { EcomError, ERROR_CODES, HttpError } from './errors';
import { RemoteService } from './RemoteService';
import { any } from 'jest-mock-extended';
import { ComparisonQueryOperatorEnum, FetchByFilterParams, LogicalQueryOperatorEnum } from './EcomApi.meta';

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
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: `${API_URL}/findPage?id=plumber0PIERRE*porch&locale=de&type=product`,
        })
      );
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
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: `${API_URL}/findPage?id=plumber0PIERRE*porch&locale=${service.defaultLocale}&type=product`,
        })
      );
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
        expect((err as EcomError).code).toEqual(ERROR_CODES.CAAS_UNAUTHORIZED);
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
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: `${API_URL}/fetchNavigation?locale=de_DE&initialPath=path`,
        })
      );
    });
    it('it uses default values for parameters when fetching the navigation', async () => {
      // Arrange
      fetchResponse = {};
      service.setDefaultLocale('en_GB');

      // Act
      const result = await service.fetchNavigation({});

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: `${API_URL}/fetchNavigation?locale=${service.defaultLocale}`,
        })
      );
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
        expect((err as EcomError).code).toEqual(ERROR_CODES.NAVIGATION_INVALID_REQUEST);
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

  describe('fetchProjectProperties()', () => {
    it('it fetches the project properties', async () => {
      // Arrange
      fetchResponse = {};

      // Act
      const result = await service.fetchProjectProperties({
        locale: 'de_DE',
      });

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: `${API_URL}/fetchProjectProperties?locale=de_DE`,
        })
      );
    });
    it('it uses default values for parameters when fetching the project properties', async () => {
      // Arrange
      fetchResponse = {};
      service.setDefaultLocale('en_GB');

      // Act
      const result = await service.fetchProjectProperties({});

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: `${API_URL}/fetchProjectProperties?locale=${service.defaultLocale}`,
        })
      );
    });
    it('throws error if fetch was not ok and status is 401', async () => {
      expect.assertions(2);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 401;

      // Act
      try {
        await service.fetchProjectProperties({});
      } catch (err: any) {
        expect((err as HttpError).status).toEqual(401);
        expect((err as HttpError).message).toEqual('Unauthorized');
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
        await service.fetchProjectProperties({});
      } catch (err: any) {
        expect((err as HttpError).status).toEqual(400);
        expect((err as HttpError).message).toEqual('Failed to fetch');
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
        await service.fetchProjectProperties({});
      } catch (err: any) {
        expect((err as HttpError).status).toEqual(500);
        expect((err as HttpError).message).toEqual('Failed to fetch');
      }
    });
    it('it logs and throws an error when params is not set', async () => {
      // Arrange
      const warningSpy = jest.spyOn(service.logger, 'warn');

      // Act
      await expect(async () => await service.fetchProjectProperties(undefined as any))
        // Assert
        .rejects.toThrow('Invalid params passed');

      expect(warningSpy.mock.calls[0][0]).toContain('Invalid params passed');
    });
  });

  describe('getAvailableLocales()', () => {
    it('it gets available locales', async () => {
      // Arrange
      fetchResponse = ['de_DE', 'en_GB'];
      const expectedResult = ['de_DE', 'en_GB'];
      // Act
      const result = await service.getAvailableLocales();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: `${API_URL}/getAvailableLocales`,
        })
      );
    });
    it('throws error if fetch was not ok and status is 401', async () => {
      expect.assertions(2);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 401;

      // Act
      try {
        await service.getAvailableLocales();
      } catch (err: any) {
        expect((err as EcomError).code).toEqual(ERROR_CODES.CAAS_UNAUTHORIZED);
        expect((err as EcomError).message).toEqual('Failed to get available locales');
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
        await service.getAvailableLocales();
      } catch (err: any) {
        expect((err as EcomError).code).toEqual(ERROR_CODES.NO_CAAS_CONNECTION);
        expect((err as EcomError).message).toEqual('Failed to get available locales');
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
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: `${API_URL}/findElement?fsPageId=plumber0PIERRE*porch&locale=de`,
        })
      );
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
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: `${API_URL}/findElement?fsPageId=plumber0PIERRE*porch&locale=${service.defaultLocale}`,
        })
      );
    });
    it('it logs and throws an error when params is not set', async () => {
      // Arrange
      const warningSpy = jest.spyOn(service.logger, 'warn');

      // Act
      await expect(async () => await service.findElement(undefined as any))
        // Assert
        .rejects.toThrow('Invalid params passed');

      expect(warningSpy.mock.calls[0][0]).toContain('Invalid params passed');
    });
  });

  describe('enrichRequest()', () => {
    it('it enriches a request with new token from URL Parameters', async () => {
      // Arrange
      const initialToken = 'i-am-a-token';
      const request: Request = new Request(new URL(`https://api.example.com/findElement`));

      jest.spyOn(request.headers, 'append');
      jest.spyOn(history, 'pushState').mockImplementation(() => {});
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(initialToken);

      const setItem = jest.spyOn(Storage.prototype, 'setItem');

      window.location.assign(`https://pwa.example.com/homepage?ecomShareToken=${initialToken}`);

      // Act
      RemoteService.enrichRequest(request);

      // Assert
      expect(setItem).toHaveBeenCalledWith('ecom:share:token', initialToken);
      expect(request.headers.append).toHaveBeenCalledWith('ecom-share-token', initialToken);
      expect(history.pushState).toHaveBeenCalledWith(
        any(),
        expect.stringMatching(''),
        expect.objectContaining({
          href: 'https://pwa.example.com/homepage',
        })
      );
    });
    it('it enriches a request with existing token from LocalStorage', async () => {
      // Arrange
      const initialToken = 'i-am-a-token';
      const request: Request = new Request(new URL(`https://backend.example.com/findElement`));

      jest.spyOn(request.headers, 'append');
      jest.spyOn(history, 'pushState').mockImplementation(() => {});
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(initialToken);

      const setItem = jest.spyOn(Storage.prototype, 'setItem');

      window.location.assign(`https://pwa.example.com/homepage`);

      // Act
      RemoteService.enrichRequest(request);

      // Assert
      expect(setItem).not.toHaveBeenCalled();
      expect(request.headers.append).toHaveBeenCalledWith('ecom-share-token', initialToken);
      expect(history.pushState).not.toHaveBeenCalled();
    });
    it("it doesn't enrich a request with missing token in LocalStorage and URL", async () => {
      // Arrange
      const request: Request = new Request(new URL(`https://backend.example.com/findElement`));

      jest.spyOn(request.headers, 'append');
      jest.spyOn(history, 'pushState').mockImplementation(() => {});
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const setItem = jest.spyOn(Storage.prototype, 'setItem');

      window.location.assign(`https://pwa.example.com/homepage`);

      // Act
      RemoteService.enrichRequest(request);

      // Assert
      expect(setItem).not.toHaveBeenCalled();
      expect(request.headers.append).not.toHaveBeenCalled();
      expect(history.pushState).not.toHaveBeenCalled();
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

  describe('fetchByFilter()', () => {
    it('performs a POST request with filter criteria', async () => {
      // Arrange
      fetchResponse = {
        items: [{ id: 'item1', type: 'product' }],
        page: 1,
        pagesize: 10,
        size: 1,
        totalPages: 1
      };

      const filter: FetchByFilterParams = {
        filters: [
          {
            operator: LogicalQueryOperatorEnum.AND,
            filters: [
              {
                field: 'page.formData.type.value',
                operator: ComparisonQueryOperatorEnum.EQUALS,
                value: 'content',
              },
            ],
          },
        ],
        locale: 'de_DE',
        page: 1,
        pagesize: 10,
        normalized: true
      };

      const fetchSpy = jest.spyOn(global, 'fetch');

      // Act
      const result = await service.fetchByFilter(filter);

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenCalledTimes(1);

      const request = fetchSpy.mock.calls[0][0] as Request;

      // @ts-ignore
      expect(JSON.parse(request['_bodyInit'])).toMatchObject(filter);
      expect(request.method).toBe('POST');
    });

    it('applies default locale when not specified', async () => {
      // Arrange
      fetchResponse = {
        items: [],
        page: 1,
        pagesize: 10,
        size: 0,
        totalPages: 0
      };
      service.setDefaultLocale('en_GB');

      const fetchSpy = jest.spyOn(global, 'fetch');

      const filter: FetchByFilterParams = {
        filters: [
          {
            field: 'page.formData.type.value',
            operator: ComparisonQueryOperatorEnum.EQUALS,
            value: 'content',
          }
        ],
        page: 1,
        pagesize: 10
      };

      // Act
      const result = await service.fetchByFilter(filter);
      const request = fetchSpy.mock.calls[0][0] as Request;

      // Assert
      expect(result).toEqual(fetchResponse);

      // @ts-ignore
      expect((JSON.parse(request['_bodyInit']) as FetchByFilterParams).locale).toBe('en_GB');
      expect(request.method).toBe('POST');
    });

    it('logs and throws an error when filter is not provided', async () => {
      // Arrange
      const warningSpy = jest.spyOn(service.logger, 'warn');

      // Act & Assert
      await expect(async () => await service.fetchByFilter(undefined as any))
        .rejects.toThrow('Invalid params passed');

      expect(warningSpy).toHaveBeenCalled();
      expect(warningSpy.mock.calls[0][0]).toContain('Invalid params passed');
    });

    it('throws appropriate error when status is 401', async () => {
      expect.assertions(1);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 401;

      // Act
      try {
        await service.fetchByFilter({});
      } catch (err: any) {
        // Assert
        expect((err as EcomError).message).toEqual('Unauthorized');
      }
    });

    it('throws appropriate error when status is 400', async () => {
      expect.assertions(1);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 400;

      // Act
      try {
        await service.fetchByFilter({});
      } catch (err: any) {
        // Assert
        expect((err as EcomError).message).toEqual('Failed to fetch');
      }
    });

    it('throws fallback error for other error statuses', async () => {
      expect.assertions(1);
      // Arrange
      fetchResponse = {};
      fetchOk = false;
      fetchStatus = 500;

      // Act
      try {
        await service.fetchByFilter({});
      } catch (err: any) {
        // Assert
        expect((err as EcomError).message).toEqual('Failed to fetch');
      }
    });
  });
});
