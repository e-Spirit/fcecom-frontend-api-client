import { PreviewDecider } from '../utils/PreviewDecider';
import { RemoteService } from './RemoteService';

const API_URL = 'https://api_url:3000';
let fetchResponse: any;

let service: RemoteService;
describe('RemoteService', () => {
  beforeEach(() => {
    service = new RemoteService(API_URL);

    jest.spyOn(PreviewDecider, 'isPreview').mockResolvedValue(true);
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(fetchResponse),
      })
    );
    fetchResponse = undefined;
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
      fetchResponse = {};

      // Act
      const result = await service.findPage({
        id: 'plumber0PIERRE*porch',
        locale: 'de',
        type: 'product',
      });

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/findPage?id=plumber0PIERRE*porch&locale=de&type=product`, expect.anything());
    });
    it('it uses default values for parameters when finding a page', async () => {
      // Arrange
      fetchResponse = {};
      service.setDefaultLocale('en_GB')

      // Act
      const result = await service.findPage({
        id: 'plumber0PIERRE*porch',
        type: 'product',
      });

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/findPage?id=plumber0PIERRE*porch&locale=${service.defaultLocale}&type=product`, expect.anything());
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
      service.setDefaultLocale('en_GB')

      // Act
      const result = await service.fetchNavigation({});

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/fetchNavigation?locale=${service.defaultLocale}`, expect.anything());
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
