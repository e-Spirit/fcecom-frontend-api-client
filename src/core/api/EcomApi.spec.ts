import { mock } from 'jest-mock-extended';
import { SNAP, TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { EcomApi } from './EcomApi';
import { TPPLoader } from '../integrations/tpp/TPPLoader';
import { TPPWrapper } from '../integrations/tpp/TPPWrapper';
import { PreviewDecider } from '../utils/PreviewDecider';

const tppLoader = new TPPLoader();
const snap = mock<SNAP>();

jest.spyOn(tppLoader, 'getSnap').mockResolvedValue(snap);
jest.spyOn(TPPWrapper, 'createTPPLoader').mockReturnValue(tppLoader);
jest.spyOn(PreviewDecider, 'isPreview').mockResolvedValue(true);

class TestableEcomApi extends EcomApi {
  public test_setTPPWrapper(tppWrapper: TPPWrapperInterface): void {
    this.setTPPWrapper(tppWrapper);
  }
}

const API_URL = 'https://api_url:3000';
let tppWrapper: TPPWrapper;
let fetchResponse: any;
// @ts-ignore
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(fetchResponse),
  })
);

let api: TestableEcomApi;
describe('EcomApi', () => {
  beforeEach(() => {
    tppWrapper = new TPPWrapper();
    api = new TestableEcomApi(API_URL);
    api.test_setTPPWrapper(tppWrapper);

    fetchResponse = undefined;
  });

  describe('constructor', () => {
    it('creates an instance', () => {
      // Arrange
      const spy = jest.spyOn(PreviewDecider, 'setUrl');
      // Act
      const api = new EcomApi(API_URL);
      // Assert
      expect(api).toBeInstanceOf(EcomApi);
      expect(spy).toHaveBeenCalledWith(API_URL);
    });
    it('throws an error if given URL is invalid', () => {
      expect(() => {
        // Act
        new EcomApi('-');
        // Assert
      }).toThrow('Provided baseUrl is invalid.');
    });
    it('throws an error if no URL is given', () => {
      expect(() => {
        // Act
        new EcomApi(' ');
        // Assert
      }).toThrow('You do need to specify a baseUrl.');
    });
  });

  describe('createPage()', () => {
    it('it should create a page', async () => {
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper.TPP_SNAP = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'execute').mockResolvedValue(snap);

      // Act
      await api.createPage({
        fsPageTemplate: 'product',
        id: 'testUid',
        type: 'product',
        displayNames: {
          en: 'Display Name EN',
          de: 'Display Name DE',
        },
      });

      // Assert
      expect(spy).toHaveBeenNthCalledWith(1, 'class:FirstSpirit Connect for Commerce - Create Reference Page', {
        fsPageTemplate: 'product',
        id: 'testUid',
        type: 'product',
        displayNames: {
          en: 'Display Name EN',
          de: 'Display Name DE',
        },
      });
    });

    it('it should execute a script on error', async () => {
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper.TPP_SNAP = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'execute').mockRejectedValueOnce(new Error());

      // Act
      await api.createPage({
        fsPageTemplate: 'product',
        id: 'testUid',
        type: 'product',
        displayNames: {
          en: 'Display Name EN',
          de: 'Display Name DE',
        },
      });
      // Assert
      expect(spy).toHaveBeenNthCalledWith(1, 'class:FirstSpirit Connect for Commerce - Create Reference Page', {
        fsPageTemplate: 'product',
        id: 'testUid',
        type: 'product',
        displayNames: {
          en: 'Display Name EN',
          de: 'Display Name DE',
        },
      });
      expect(spy).toHaveBeenNthCalledWith(2, 'script:show_error_message_dialog', {
        message: `Error`,
        title: 'Could not create page',
        ok: false,
      });
    });
  });

  describe('createSection()', () => {
    it('it should create a section', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper.TPP_SNAP = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'createSection').mockResolvedValue(true);

      // Act
      await api.createSection({
        pageId: 'testId',
        slotName: 'SlotName',
      });

      // Assert
      expect(spy).toHaveBeenNthCalledWith(1, 'testId', {
        body: 'SlotName',
        result: true,
      });
    });

    it('it should execute a script on error', async () => {
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper.TPP_SNAP = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'createSection').mockRejectedValueOnce(new Error());

      // Act
      await api.createSection({
        pageId: 'testId',
        slotName: 'SlotName',
      });

      // Assert
      expect(spy).toHaveBeenNthCalledWith(1, 'testId', {
        body: 'SlotName',
        result: true,
      });
      expect(snap.execute).toHaveBeenNthCalledWith(1, 'script:show_error_message_dialog', {
        message: `Error`,
        title: 'Could not create section',
        ok: false,
      });
    });
  });

  describe('findPage()', () => {
    it('it finds a page', async () => {
      // Arrange
      fetchResponse = {};

      // Act
      const result = await api.findPage({
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

      // Act
      const result = await api.findPage({
        id: 'plumber0PIERRE*porch',
        type: 'product',
      });

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/findPage?id=plumber0PIERRE*porch&locale=${api.defaultLocale}&type=product`, expect.anything());
    });
  });

  describe('fetchNavigation()', () => {
    it('it fetches the navigation', async () => {
      // Arrange
      fetchResponse = {};

      // Act
      const result = await api.fetchNavigation({
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

      // Act
      const result = await api.fetchNavigation({});

      // Assert
      expect(result).toEqual(fetchResponse);
      expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/fetchNavigation?locale=${api.defaultLocale}`, expect.anything());
    });
  });

  describe('setDefaultLocale()', () => {
    it('it should apply default locale correctly', async () => {
      // Arrange
      const locale = 'de_DE';

      // Act
      api.setDefaultLocale(locale);

      // Assert
      expect(api.defaultLocale).toBe(locale);
    });
  });

  describe('init()', () => {
    // TODO: Find out how to work with dynamic import
    it.todo('returns true if TPP is loaded');
    it.todo('returns false if TPP is not loaded');
    it('returns false if not in preview mode', async () => {
      // Arrange
      api.test_setTPPWrapper(undefined as any); // Reset
      jest.spyOn(PreviewDecider, 'isPreview').mockResolvedValue(false);

      // Act
      const result = await api.init();

      // Assert
      expect(result).toBe(false);
      expect(await api.getTppInstance()).toBeNull();
    });
  });

  describe('getTppInstance()', () => {
    // TODO: Find out how to work with dynamic import
    it.todo('waits for TPP to finish loading if currently loading');
    it('returns TPP instance if set', async () => {
      // Act
      const result = await api.getTppInstance();

      // Assert
      expect(result).toBe(tppWrapper);
    });
    it('returns null if no TPP was loaded at all', async () => {
      // Arrange
      api.test_setTPPWrapper(undefined as any); // Reset

      // Act
      const result = await api.getTppInstance();

      // Assert
      expect(result).toBeNull();
    });
  });
});
