import { EcomApi } from './EcomApi';
import { PreviewDecider } from '../utils/PreviewDecider';
import { CreatePagePayload, CreateSectionPayload, SetElementParams } from './TPPService.meta';
import { FindElementParams, FindPageParams } from './Remoteservice.meta';
import { mock } from 'jest-mock-extended';
import { RemoteService } from './RemoteService';
import { TPPService } from './TPPService';
import { SlotParser } from '../integrations/tpp/SlotParser';
import { EcomHooks } from '../integrations/tpp/HookService.meta';
import { HookService } from '../integrations/tpp/HookService';
import { TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { Logging, LogLevel, Logger } from "../utils/logging/Logger";

jest.spyOn(PreviewDecider, 'isPreview').mockResolvedValue(true);

const mockTppService = mock<TPPService>();
const mockRemoteService = mock<RemoteService>();
const mockLogger = mock<Logger>();

const API_URL = 'https://api_url:3000';

let api: EcomApi;
describe('EcomApi', () => {
  beforeEach(() => {
    api = new EcomApi(API_URL);
    api['remoteService'] = mockRemoteService;
    api['logger'] = mockLogger;
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
    it('sets custom logLevel', () => {
      // Arrange & Act
      new EcomApi(API_URL, LogLevel.WARNING);
      // Assert
      expect(Logging.logLevel).toBe(LogLevel.WARNING)
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
    it('it calls TPPService.createPage', async () => {
      // Arrange
      api['tppService'] = mockTppService;
      const payload = {
        fsPageTemplate: 'product',
        id: 'testUid',
        type: 'product',
        displayNames: {
          en: 'Display Name EN',
          de: 'Display Name DE',
        },
      } as CreatePagePayload;
      // Act
      await api.createPage(payload);
      // Assert
      expect(mockTppService.createPage.mock.calls[0][0]).toEqual(payload);
    });
    it('does not throw if no TPPService is set', async () => {
      // Arrange
      api['tppService'] = undefined;
      const payload = {
        fsPageTemplate: 'product',
        id: 'testUid',
        type: 'product',
        displayNames: {
          en: 'Display Name EN',
          de: 'Display Name DE',
        },
      } as CreatePagePayload;
      // Act
      expect(async () => {
        await api.createPage(payload);
        // Assert
        expect(mockLogger.warn.mock.calls[0][0]).toEqual('Tried to access TPP while not in preview');
      }).not.toThrow();
    });
  });

  describe('createSection()', () => {
    it('it calls TPPService.createSection', async () => {
      // Arrange
      api['tppService'] = mockTppService;
      const payload = {
        pageId: 'testId',
        slotName: 'SlotName',
      } as CreateSectionPayload;
      // Act
      await api.createSection(payload);
      // Assert
      expect(mockTppService.createSection.mock.calls[0][0]).toEqual(payload);
    });
    it('does not throw if no TPPService is set', async () => {
      // Arrange
      api['tppService'] = undefined;
      const payload = {
        pageId: 'testId',
        slotName: 'SlotName',
      } as CreateSectionPayload;
      // Act
      expect(async () => {
        await api.createSection(payload);
        expect(mockLogger.warn.mock.calls[0][0]).toEqual('Tried to access TPP while not in preview');
        // Assert
      }).not.toThrow();
    });
  });

  describe('init()', () => {
    afterEach(() => {
      jest.dontMock('../integrations/tpp/SlotParser');
      jest.dontMock('./TPPService');
      jest.resetAllMocks();
    });
    it('loads services if in preview and returns true on success', async () => {
      // Arrange
      const tppServiceInstanceMock = mock<TPPService>();
      jest.spyOn(tppServiceInstanceMock, 'init').mockResolvedValue(true);
      const tppServiceClassMock = jest.fn().mockReturnValue(tppServiceInstanceMock);
      jest.spyOn(PreviewDecider, 'isPreview').mockResolvedValue(true);
      jest.doMock('./TPPService', () => ({
        TPPService: tppServiceClassMock
      }));
      const slotParserInstanceMock = mock<SlotParser>();
      const slotParserClassMock = jest.fn().mockReturnValue(slotParserInstanceMock);
      jest.doMock('../integrations/tpp/SlotParser', () => ({
        SlotParser: slotParserClassMock
      }));
      // Act
      const result = await api.init();
      // Assert
      expect(api['tppService']).toEqual(tppServiceInstanceMock);
      expect(tppServiceInstanceMock.init).toBeCalled();
      expect(api['slotParser']).toEqual(slotParserInstanceMock);
      expect(result).toEqual(true);
    });
    it('loads services if in preview and returns false on failure', async () => {
      // Arrange
      const tppServiceInstanceMock = mock<TPPService>();
      jest.spyOn(tppServiceInstanceMock, 'init').mockResolvedValue(false);
      const tppServiceClassMock = jest.fn().mockReturnValue(tppServiceInstanceMock);
      jest.spyOn(PreviewDecider, 'isPreview').mockResolvedValue(true);
      jest.doMock('./TPPService', () => ({
        TPPService: tppServiceClassMock
      }));
      const slotParserInstanceMock = mock<SlotParser>();
      const slotParserClassMock = jest.fn().mockReturnValue(slotParserInstanceMock);
      jest.doMock('../integrations/tpp/SlotParser', () => ({
        SlotParser: slotParserClassMock
      }));
      // Act
      const result = await api.init();
      // Assert
      expect(result).toEqual(false);
    });
    it('does not load TPP Service and SlotParser if not in preview', async () => {
      // Arrange
      jest.spyOn(PreviewDecider, 'isPreview').mockResolvedValue(false);
      // Act
      await api.init();
      // Assert
      expect(api['tppService']).toEqual(undefined);
      expect(api['slotParser']).toEqual(undefined);
    });
  });

  describe('getTppInstance()', () => {
    it('calls TPPService.getTppInstance', async () => {
      // Arrange
      api['tppService'] = mockTppService;
      const mockTppWrapper = mock<TPPWrapperInterface>();
      jest.spyOn(mockTppService, 'getTppInstance').mockResolvedValueOnce(mockTppWrapper);
      // Act
      const result = await api.getTppInstance();
      // Assert
      expect(mockTppService.getTppInstance.mock.calls.length).toEqual(1);
      expect(result).toBe(mockTppWrapper);
    });
    it('returns null if no TPPService is set', async () => {
      // Arrange
      api['tppService'] = undefined;
      // Act
      const result = await api.getTppInstance();
      // Assert
      expect(mockLogger.warn.mock.calls[0][0]).toEqual('Tried to access TPP while not in preview');
      expect(result).toBeNull();
    });
  });

  describe('findPage()', () => {
    it('it calls RemoteService.findPage', async () => {
      // Arrange
      const payload = {
        id: 'plumber0PIERRE*porch',
        locale: 'de',
        type: 'product',
      } as FindPageParams;
      // Act
      await api.findPage(payload);
      // Assert
      expect(mockRemoteService.findPage.mock.calls[0][0]).toEqual(payload);
    });
  });

  describe('fetchNavigation()', () => {
    it('it calls RemoteService.fetchNavigation()', async () => {
      // Arrange
      const payload = {
        locale: 'de_DE',
        initialPath: 'path',
      };
      // Act
      await api.fetchNavigation(payload);
      // Assert
      expect(mockRemoteService.fetchNavigation.mock.calls[0][0]).toEqual(payload);
    });
  });

  describe('findElement()', () => {
    it('it calls RemoteService.findElement', async () => {
      // Arrange
      const payload = {
        id: 'plumber0PIERRE*porch',
        locale: 'de',
      } as FindElementParams;
      // Act
      await api.findElement(payload);
      // Assert
      expect(mockRemoteService.findElement.mock.calls[0][0]).toEqual(payload);
    });
  });

  describe('setDefaultLocale()', () => {
    it('it should apply default locale correctly', () => {
      // Arrange
      const locale = 'de_DE';
      // Act
      api.setDefaultLocale(locale);
      // Assert
      expect(api.defaultLocale).toBe(locale);
      expect(mockRemoteService.setDefaultLocale).toBeCalledWith(locale);
    });
  });

  describe('setElement()', () => {
    it('it passes calls to TPPService and SlotParser', async () => {
      // Arrange
      api['tppService'] = mockTppService;
      const mockSlotParser = mock<SlotParser>();
      api['slotParser'] = mockSlotParser;
      const params = {
        fsPageTemplate: 'TEMPLATE',
        id: 'ID',
        type: 'content',
        locale: 'LOCALE'
      } as SetElementParams;
      // Act
      await api.setElement(params);
      // Assert
      expect(mockTppService.setElement.mock.calls[0][0]).toEqual({
        id: params.id,
        type: params.type,
        locale: params.locale
      });
      expect(mockSlotParser.parseSlots.mock.calls[0][0]).toEqual(params);
    });
    it('it uses fallback locale', async () => {
      // Arrange
      const locale = 'de_DE';
      api.setDefaultLocale(locale);
      api['tppService'] = mockTppService;
      const params = {
        fsPageTemplate: 'TEMPLATE',
        id: 'ID',
        type: 'content'
      } as SetElementParams;
      // Act
      await api.setElement(params);
      // Assert
      expect(mockTppService.setElement.mock.calls[0][0]).toEqual({
        id: params.id,
        type: params.type,
        locale: locale
      });
    });
    it('does not throw if no params are passed', async () => {
      // Arrange
      api['tppService'] = mockTppService;
      const mockSlotParser = mock<SlotParser>();
      api['slotParser'] = mockSlotParser;
      // Act
      expect(async () => {
        await api.setElement(null);
        // Assert
        expect(mockTppService.setElement).not.toBeCalled();
        expect(mockSlotParser.parseSlots).not.toBeCalled();
      }).not.toThrow();
    });
    it('does not throw if no TPPService is set', async () => {
      // Arrange
      api['tppService'] = undefined;
      const mockSlotParser = mock<SlotParser>();
      api['slotParser'] = mockSlotParser;
      const params = {
        fsPageTemplate: 'TEMPLATE',
        id: 'ID',
        type: 'content'
      } as SetElementParams;
      // Act
      expect(async () => {
        await api.setElement(params);
        // Assert
        expect(mockSlotParser.parseSlots).not.toHaveBeenCalled();
        expect(mockLogger.warn.mock.calls[0][0]).toEqual('Tried to access TPP while not in preview');
      }).not.toThrow();
    });
  });

  describe('clear()', () => {
    it('it passes calls to SlotParser', async () => {
      // Arrange
      const mockSlotParser = mock<SlotParser>();
      api['slotParser'] = mockSlotParser;
      // Act
      api.clear();
      // Assert
      expect(mockSlotParser.clear).toHaveBeenCalled();
    });
    it('does not throw if no SlotParser is set', async () => {
      // Arrange
      api['slotParser'] = undefined;
      // Act
      expect(() => {
        api.clear();
        // Assert
      }).not.toThrow();
    });
  });

  describe('addHook()', () => {
    it('it passes calls to HookService', async () => {
      // Arrange
      api['tppService'] = mockTppService;
      const mockHookService = mock<HookService>();
      jest.spyOn(mockTppService, 'getHookService').mockReturnValueOnce(mockHookService);
      const mockHook = jest.fn();
      // Act
      api.addHook(EcomHooks.CONTENT_CHANGED, mockHook);
      // Assert
      expect(mockHookService.addHook.mock.calls[0][0]).toEqual(EcomHooks.CONTENT_CHANGED);
      expect(mockHookService.addHook.mock.calls[0][1]).toEqual(mockHook);
    });
    it('does not throw if no TPPService is set', async () => {
      // Arrange
      api['tppService'] = undefined;
      const mockHook = jest.fn();
      // Act
      expect(() => {
        api.addHook(EcomHooks.CONTENT_CHANGED, mockHook);
        // Assert
        expect(mockLogger.warn.mock.calls[0][0]).toEqual('Tried to access TPP while not in preview');
      }).not.toThrow();
    });
  });
});
