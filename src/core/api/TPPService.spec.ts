import { mock } from 'jest-mock-extended';
import { SNAP, TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { TPPLoader } from '../integrations/tpp/TPPLoader';
import { TPPWrapper } from '../integrations/tpp/TPPWrapper';
import { TPPService } from './TPPService';
import { RemoteService } from './RemoteService';
import { FindPageItem } from './Remoteservice.meta';
import { EcomClientError, EcomModuleError, ERROR_CODES } from './errors';
import * as logger from '../utils/logging/Logger';
import { CreatePageResponse } from './TPPService.meta';
import { HookService } from '../integrations/tpp/HookService';
import { EcomHooks } from '../integrations/tpp/HookService.meta';

const tppLoader = new TPPLoader();
const snap = mock<SNAP>();

jest.spyOn(tppLoader, 'getSnap').mockResolvedValue(snap);
jest.spyOn(TPPWrapper, 'createTPPLoader').mockReturnValue(tppLoader);

class TestableTPPService extends TPPService {
  public test_setTPPWrapper(tppWrapper: TPPWrapperInterface): void {
    this.setTPPWrapper(tppWrapper);
  }

  public async test_initPreviewHooks() {
    await this.initPreviewHooks();
  }
}

const API_URL = 'https://api_url:3000';
let tppWrapper: TPPWrapper;

jest.mock('./RemoteService');
const mockRemoteService = new RemoteService(API_URL);
const mockLogger = mock<logger.Logger>();

let service: TestableTPPService;
describe('TPPService', () => {
  beforeEach(() => {
    tppWrapper = new TPPWrapper();
    service = new TestableTPPService();
    service.test_setTPPWrapper(tppWrapper);
    service['logger'] = mockLogger;
  });

  describe('constructor()', () => {
    it('creates an instance', () => {
      // Act
      const service = new TestableTPPService();

      // Assert
      expect(service).toBeInstanceOf(TestableTPPService);
    });
  });

  describe('setElement()', () => {
    it('calls SNAP setPreviewElement with params', async () => {
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);

      const page = {
        previewId: 'PREVIEWID',
        children: [
          {
            name: 'SLOTNAME',
            previewId: 'PREVIEWID',
          },
          {
            name: 'SLOTNAME2',
            previewId: 'PREVIEWID2',
          },
        ],
      } as FindPageItem;
      const previewId = 'PREVIEWID';
      const mockFindPageResponse = {
        previewId: 'testPreviewId',
        children: [],
      } as FindPageItem;
      jest.spyOn(mockRemoteService, 'findPage').mockResolvedValueOnce(mockFindPageResponse);
      const setPreviewElementSpy = jest.spyOn(snap, 'setPreviewElement');
      // Act
      await service.setElement(page);
      // Assert
      expect(setPreviewElementSpy).toBeCalledWith(previewId);
    });

    it('calls SNAP setPreviewElement with null', async () => {
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const findPageSpy = jest.spyOn(mockRemoteService, 'findPage');
      const setPreviewElementSpy = jest.spyOn(snap, 'setPreviewElement');
      // Act
      await service.setElement(null);
      // Assert
      expect(findPageSpy).not.toHaveBeenCalled();
      expect(setPreviewElementSpy).toBeCalledWith(null);
    });

    it('calls SNAP setPreviewElement with null when no fs page is present', async () => {
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      jest.spyOn(mockRemoteService, 'findPage').mockResolvedValueOnce(undefined as any);
      const setPreviewElementSpy = jest.spyOn(snap, 'setPreviewElement');
      // Act
      await service.setElement(null);
      // Assert
      expect(setPreviewElementSpy).toBeCalledWith(null);
    });
  });

  describe('createPage()', () => {
    it('it should create a page', async () => {
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const response = { success: true, error: null };
      const spy = jest.spyOn(snap, 'execute').mockResolvedValue(`Json ${JSON.stringify(response)}`);

      // Act
      const result = await service.createPage({
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
      expect(result).toEqual(true);
    });

    it('it should throw an error (general TPP error)', async () => {
      expect.assertions(5);
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'execute').mockResolvedValue(true).mockRejectedValueOnce(new Error());

      // Act
      try {
        await service.createPage({
          fsPageTemplate: 'product',
          id: 'testUid',
          type: 'product',
          displayNames: {
            en: 'Display Name EN',
            de: 'Display Name DE',
          },
        });
      } catch (err: unknown) {
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
        expect(err).toBeInstanceOf(EcomClientError);
        expect((err as EcomClientError).code).toEqual(ERROR_CODES.CREATE_PAGE_FAILED);
        expect((err as EcomClientError).message).toEqual('Cannot create page');
        expect(mockLogger.error).toBeCalledWith('Failed to execute executable', expect.anything());
      }
    });
    it('it should throw an error (invalid module response)', async () => {
      expect.assertions(5);
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'execute').mockResolvedValue(true).mockResolvedValueOnce('Not valid response');

      // Act
      try {
        await service.createPage({
          fsPageTemplate: 'product',
          id: 'testUid',
          type: 'product',
          displayNames: {
            en: 'Display Name EN',
            de: 'Display Name DE',
          },
        });
      } catch (err: unknown) {
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
        expect(err).toBeInstanceOf(EcomClientError);
        expect((err as EcomClientError).code).toEqual(ERROR_CODES.CREATE_PAGE_FAILED);
        expect((err as EcomClientError).message).toEqual('Cannot create page');
        expect(mockLogger.error).toBeCalledWith('Invalid module response', 'Not valid response');
      }
    });
    it('it should throw an error (invalid JSON as module response)', async () => {
      expect.assertions(5);
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'execute').mockResolvedValue(true).mockResolvedValueOnce('Json Not valid JSON');

      // Act
      try {
        await service.createPage({
          fsPageTemplate: 'product',
          id: 'testUid',
          type: 'product',
          displayNames: {
            en: 'Display Name EN',
            de: 'Display Name DE',
          },
        });
      } catch (err: unknown) {
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
        expect(err).toBeInstanceOf(EcomClientError);
        expect((err as EcomClientError).code).toEqual(ERROR_CODES.CREATE_PAGE_FAILED);
        expect((err as EcomClientError).message).toEqual('Cannot create page');
        expect(mockLogger.error).toBeCalledWith('Cannot parse module response', 'Not valid JSON');
      }
    });
    it('it should throw an error (error in module response)', async () => {
      expect.assertions(5);
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const response = { success: false, error: { code: 123, cause: 'Some cause' } } as CreatePageResponse;
      const spy = jest
        .spyOn(snap, 'execute')
        .mockResolvedValue(true)
        .mockResolvedValueOnce(`Json ${JSON.stringify(response)}`);

      // Act
      try {
        await service.createPage({
          fsPageTemplate: 'product',
          id: 'testUid',
          type: 'product',
          displayNames: {
            en: 'Display Name EN',
            de: 'Display Name DE',
          },
        });
      } catch (err: unknown) {
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
        expect(err).toBeInstanceOf(EcomModuleError);
        expect((err as EcomClientError).code).toEqual(response.error?.code.toString());
        expect((err as EcomClientError).message).toEqual('Cannot create page');
        expect(mockLogger.error).toBeCalledWith('Error in module during page creation', response);
      }
    });
  });

  describe('createSection()', () => {
    it('it should create a section', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'createSection').mockResolvedValue(true);

      // Act
      await service.createSection({
        pageId: 'testId',
        slotName: 'SlotName',
      });

      // Assert
      expect(spy).toHaveBeenNthCalledWith(1, 'testId', {
        body: 'SlotName',
        result: true,
      });
    });

    it('it should throw an error', async () => {
      expect.assertions(5);
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const tppError = new Error();
      const spy = jest.spyOn(snap, 'createSection').mockRejectedValueOnce(tppError);

      // Act
      try {
        await service.createSection({
          pageId: 'testId',
          slotName: 'SlotName',
        });
      } catch (err: unknown) {
        // Assert
        expect(spy).toHaveBeenNthCalledWith(1, 'testId', {
          body: 'SlotName',
          result: true,
        });
        expect(err).toBeInstanceOf(EcomClientError);
        expect((err as EcomClientError).code).toEqual(ERROR_CODES.CREATE_SECTION_FAILED);
        expect((err as EcomClientError).message).toEqual('Cannot create section');
        expect(mockLogger.error).toBeCalledWith('Failed to create section', tppError);
      }
    });
  });

  describe('init()', () => {
    // TODO: Find out how to work with dynamic import
    it.todo('returns false if TPP is not loaded');
    it('returns true if successful', async () => {
      // Arrange
      service.test_setTPPWrapper(undefined as any); // Reset

      // Act
      const result = await service.init();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('getTppInstance()', () => {
    // TODO: Find out how to work with dynamic import
    it.todo('waits for TPP to finish loading if currently loading');
    it('returns TPP instance if set', async () => {
      // Act
      const result = await service.getTppInstance();

      // Assert
      expect(result).toBe(tppWrapper);
    });
    it('returns null if no TPP was loaded at all', async () => {
      // Arrange
      service.test_setTPPWrapper(undefined as any); // Reset

      // Act
      const result = await service.getTppInstance();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('handleError()', () => {
    it('display dialog for unknown errors', async () => {
      // Arrange
      const error = 'Not an EcomError';
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);

      // Act
      await service.handleError(error);

      // Assert
      expect(snap.execute).toHaveBeenNthCalledWith(1, 'script:show_error_message_dialog', {
        message: `000 - Unknown error`,
        title: 'Something went wrong',
        ok: false,
      });
      expect(mockLogger.error).toBeCalledWith('An error occured', error);
    });
    it('display dialog for client side errors', async () => {
      // Arrange
      const code = '123';
      const message = 'Error';
      const error = new EcomClientError(code, message);
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);

      // Act
      await service.handleError(error);

      // Assert
      expect(snap.execute).toHaveBeenNthCalledWith(1, 'script:show_error_message_dialog', {
        message: `${code} - ${message}`,
        title: 'Failed to add content',
        ok: false,
      });
      expect(mockLogger.error).toBeCalledWith('An error occured', error);
    });
    it('differently logs module errors', async () => {
      // Arrange
      const code = '123';
      const message = 'Error';
      const error = new EcomModuleError(code, message);
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);

      // Act
      await service.handleError(error);

      // Assert
      expect(snap.execute).toHaveBeenNthCalledWith(1, 'script:show_error_message_dialog', {
        message: `${code} - ${message}`,
        title: 'Failed to add content',
        ok: false,
      });
      expect(mockLogger.error).toBeCalledWith('Error in FirstSpirit Module - see server logs for more details', error);
    });
  });

  describe('initPreviewHooks()', () => {
    it('returns if tpp is not loaded', async () => {
      // Arrange
      //const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(null);
      const onContentChangeSpy = jest.spyOn(snap, 'onContentChange');
      const onRerenderViewSpy = jest.spyOn(snap, 'onRerenderView');
      const onRequestPreviewElementSpy = jest.spyOn(snap, 'onRequestPreviewElement');
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(onContentChangeSpy).not.toHaveBeenCalled();
      expect(onRerenderViewSpy).not.toHaveBeenCalled();
      expect(onRequestPreviewElementSpy).not.toHaveBeenCalled();
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
    it('adds onContentChange handler and invokes CONTENT_CHANGED hook', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'onContentChange');
      const previewId = 'PREVIEWID';
      const node = mock<HTMLElement>();
      const content = 'CONTENT';
      spy.mockImplementation((cb) => {
        // Trigger callback
        cb(node, previewId, content);
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(mockHookService.callHook).toBeCalledWith(
        EcomHooks.CONTENT_CHANGED,
        expect.objectContaining({
          node,
          previewId,
          content,
        })
      );
    });

    it('adds onRerenderView handler and invokes CONTENT_CHANGED hook', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'onRerenderView');
      const previewId = 'PREVIEWID';
      const node = mock<HTMLElement>();
      const content = 'CONTENT';
      spy.mockImplementation((cb) => {
        // Trigger callback
        cb();
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
      const renderElementSpy = jest.spyOn(snap, 'renderElement');
      renderElementSpy.mockResolvedValue(content);
      jest.spyOn(snap, 'getPreviewElement').mockResolvedValue(previewId);
      const querySelectorSpy = jest.spyOn(document, 'querySelector');
      querySelectorSpy.mockReturnValue(node);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(renderElementSpy).toBeCalledWith(previewId);
      expect(querySelectorSpy).toBeCalledWith(`[data-preview-id="${previewId}"]`);
      expect(mockHookService.callHook).toBeCalledWith(
        EcomHooks.CONTENT_CHANGED,
        expect.objectContaining({
          node,
          previewId,
          content,
        })
      );
    });

    it('adds onRequestPreviewElement handler', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'onRequestPreviewElement');
      const previewId = 'PREVIEWID';
      spy.mockImplementation((cb) => {
        // Trigger callback
        cb(previewId);
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(mockHookService.callHook).toBeCalledWith(
        EcomHooks.REQUEST_PREVIEW_ELEMENT,
        expect.objectContaining({
          previewId,
        })
      );
    });
    it('adds openStoreFrontUrl message handler and invokes OPEN_STOREFRONT_URL hook if topic matches', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(window, 'addEventListener');
      const payload = 'PAYLOAD';
      const message = {
        data: {
          fcecom: {
            topic: 'openStoreFrontUrl',
            payload,
          },
        },
      };
      spy.mockImplementation((type, cb) => {
        // Trigger callback
        if (typeof cb === 'function') cb(message as any);
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toBeCalledWith('message', expect.anything());
      expect(mockHookService.callHook).toBeCalledWith(EcomHooks.OPEN_STOREFRONT_URL, payload);
    });
    it('adds openStoreFrontUrl message handler and does nothing if topic doesnt match', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(window, 'addEventListener');
      const payload = 'PAYLOAD';
      const message = {
        data: {
          fcecom: {
            topic: 'ANYOTHERTOPIC',
            payload,
          },
        },
      };
      spy.mockImplementation((type, cb) => {
        // Trigger callback
        if (typeof cb === 'function') cb(message as any);
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toBeCalledWith('message', expect.anything());
      expect(mockHookService.callHook).not.toHaveBeenCalled();
    });
  });

  describe('initPreviewHooks()', () => {
    it('returns if tpp is not loaded', async () => {
      // Arrange
      //const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(null);
      const onContentChangeSpy = jest.spyOn(snap, 'onContentChange');
      const onRerenderViewSpy = jest.spyOn(snap, 'onRerenderView');
      const onRequestPreviewElementSpy = jest.spyOn(snap, 'onRequestPreviewElement');
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(onContentChangeSpy).not.toHaveBeenCalled();
      expect(onRerenderViewSpy).not.toHaveBeenCalled();
      expect(onRequestPreviewElementSpy).not.toHaveBeenCalled();
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
    it('adds onContentChange handler and invokes CONTENT_CHANGED hook', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'onContentChange');
      const previewId = 'PREVIEWID';
      const node = mock<HTMLElement>();
      const content = 'CONTENT';
      spy.mockImplementation((cb) => {
        // Trigger callback
        cb(node, previewId, content);
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(mockHookService.callHook).toBeCalledWith(
        EcomHooks.CONTENT_CHANGED,
        expect.objectContaining({
          node,
          previewId,
          content,
        })
      );
    });

    it('adds onRerenderView handler and invokes CONTENT_CHANGED hook', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'onRerenderView');
      const previewId = 'PREVIEWID';
      const node = mock<HTMLElement>();
      const content = 'CONTENT';
      spy.mockImplementation((cb) => {
        // Trigger callback
        cb();
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
      const renderElementSpy = jest.spyOn(snap, 'renderElement');
      renderElementSpy.mockResolvedValue(content);
      jest.spyOn(snap, 'getPreviewElement').mockResolvedValue(previewId);
      const querySelectorSpy = jest.spyOn(document, 'querySelector');
      querySelectorSpy.mockReturnValue(node);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(renderElementSpy).toBeCalledWith(previewId);
      expect(querySelectorSpy).toBeCalledWith(`[data-preview-id="${previewId}"]`);
      expect(mockHookService.callHook).toBeCalledWith(
        EcomHooks.CONTENT_CHANGED,
        expect.objectContaining({
          node,
          previewId,
          content,
        })
      );
    });

    it('adds onRequestPreviewElement handler', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'onRequestPreviewElement');
      const previewId = 'PREVIEWID';
      spy.mockImplementation((cb) => {
        // Trigger callback
        cb(previewId);
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(mockHookService.callHook).toBeCalledWith(
        EcomHooks.REQUEST_PREVIEW_ELEMENT,
        expect.objectContaining({
          previewId,
        })
      );
    });
    it('adds openStoreFrontUrl message handler and invokes OPEN_STOREFRONT_URL hook if topic matches', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(window, 'addEventListener');
      const payload = 'PAYLOAD';
      const message = {
        data: {
          fcecom: {
            topic: 'openStoreFrontUrl',
            payload,
          },
        },
      };
      spy.mockImplementation((type, cb) => {
        // Trigger callback
        if (typeof cb === 'function') cb(message as any);
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toBeCalledWith('message', expect.anything());
      expect(mockHookService.callHook).toBeCalledWith(EcomHooks.OPEN_STOREFRONT_URL, payload);
    });
    it('adds openStoreFrontUrl message handler and does nothing if topic doesnt match', async () => {
      // Arrange
      const snap = mock<SNAP>();
      // @ts-ignore - TODO: Make properly test possible
      tppWrapper["TPP_SNAP"] = Promise.resolve(snap);
      const spy = jest.spyOn(window, 'addEventListener');
      const payload = 'PAYLOAD';
      const message = {
        data: {
          fcecom: {
            topic: 'ANYOTHERTOPIC',
            payload,
          },
        },
      };
      spy.mockImplementation((type, cb) => {
        // Trigger callback
        if (typeof cb === 'function') cb(message as any);
      });
      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(spy).toBeCalledWith('message', expect.anything());
      expect(mockHookService.callHook).not.toHaveBeenCalled();
    });
  });
});
