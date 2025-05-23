import { mock } from 'jest-mock-extended';
import { CreateSectionResponse, SNAP, TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { TPPLoader } from '../integrations/tpp/TPPLoader';
import { TPPWrapper } from '../integrations/tpp/TPPWrapper';
import { TPPService } from './TPPService';
import { RemoteService } from './RemoteService';
import { FindPageItem } from './Remoteservice.meta';
import { EcomClientError, EcomModuleError, ERROR_CODES } from './errors';
import * as logger from '../utils/logging/Logger';
import { CreatePageResponse, CreateSectionPayload } from './TPPService.meta';
import { HookService, Ready } from '../../connect/HookService';
import { EcomHooks } from '../../connect/HookService.meta';
import { SNAPButton, SNAPButtonScope, SNAPStatus } from '../../connect/TPPBroker.meta';
import { TPPBroker } from '../../connect/TPPBroker';
import { fireEvent } from '@testing-library/react';

class TestableTPPService extends TPPService {
  public test_setTPPWrapper(tppWrapper: TPPWrapperInterface): void {
    this.setTPPWrapper(tppWrapper);
  }

  public async test_initPreviewHooks() {
    await this.initPreviewHooks();
  }

  public async test_getProjectApps(): Promise<any> {
    return await this.getProjectApps();
  }

  public async test_addTranslationstudioButton() {
    await this.addTranslationstudioButton();
  }

  public async test_addAddSiblingSectionButton() {
    await this.addAddSiblingSectionButton();
  }

  public async test_addSiblingSection(node: HTMLElement, previewId: string) {
    await this.addSiblingSection(node, previewId);
  }

  public test_getNodeIndex(node: HTMLElement): number {
    return this.getNodeIndex(node);
  }

  public setCurrentPageRefPreviewId(pageRefPreviewId: string | null) {
    this.currentPageRefPreviewId = pageRefPreviewId;
  }

  public test_parseModuleResponse(response: string): CreatePageResponse {
    return this.parseModuleResponse(response);
  }

  public async test_initMessagesToServer() {
    await this.initMessagesToServer();
  }
}

const API_URL = 'https://api_url:3000';
let tppWrapper: TPPWrapper;

Ready.allowedMessageOrigin = 'http://example.com';

jest.mock('./RemoteService');
const mockRemoteService = new RemoteService(API_URL);
const mockLogger = mock<logger.Logger>();

let service: TestableTPPService;
let snap: SNAP;

// Extend Window interface for TPP_SNAP
declare global {
  interface Window {
    TPP_SNAP?: SNAP;
  }
}

// Types for MessagePort and MessageChannel mocks
interface MockMessagePort {
  postMessage: jest.Mock;
  onmessage: ((event: MessageEvent) => void) | null;
  close: jest.Mock;
  start: jest.Mock;
}

describe('TPPService', () => {
  // MessageChannel-related variables
  let mockPort1: MockMessagePort;
  let mockPort2: MockMessagePort;
  let originalMessageChannel: typeof MessageChannel;

  beforeEach(() => {
    // ===== MessageChannel Mocks =====
    // Mock MessageChannel
    mockPort1 = {
      postMessage: jest.fn(),
      onmessage: null,
      close: jest.fn(),
      start: jest.fn(),
    };
    mockPort2 = {
      postMessage: jest.fn(),
      onmessage: null,
      close: jest.fn(),
      start: jest.fn(),
    };

    originalMessageChannel = global.MessageChannel;

    global.MessageChannel = jest.fn(() => ({
      port1: mockPort1,
      port2: mockPort2,
    })) as unknown as typeof MessageChannel;

    const tppLoader = new TPPLoader();
    snap = mock<SNAP>();

    jest.spyOn(tppLoader, 'getSnap').mockResolvedValue(snap);
    jest.spyOn(TPPWrapper, 'createTPPLoader').mockReturnValue(tppLoader);

    tppWrapper = new TPPWrapper();
    service = new TestableTPPService();
    service.test_setTPPWrapper(tppWrapper);
    service['logger'] = mockLogger;
  });

  afterEach(() => {
    global.MessageChannel = originalMessageChannel;
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

      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);

      const page = {
        previewId: 'PreviewId',
        children: [
          {
            name: 'SlotName',
            previewId: 'PreviewId',
          },
          {
            name: 'SlotName2',
            previewId: 'PreviewId2',
          },
        ],
      } as FindPageItem;
      const previewId = 'PreviewId';
      const mockFindPageResponse = {
        previewId: 'testPreviewId',
        children: [],
      } as FindPageItem;
      jest.spyOn(mockRemoteService, 'findPage').mockResolvedValueOnce(mockFindPageResponse);
      const setPreviewElementSpy = jest.spyOn(snap, 'setPreviewElement');
      // Act
      await service.setElement(page);
      // Assert
      expect(setPreviewElementSpy).toHaveBeenCalledWith(previewId);
    });

    it('calls SNAP setPreviewElement with null', async () => {
      // Arrange
      const snap = mock<SNAP>();

      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const findPageSpy = jest.spyOn(mockRemoteService, 'findPage');
      const setPreviewElementSpy = jest.spyOn(snap, 'setPreviewElement');
      // Act
      await service.setElement(null);
      // Assert
      expect(findPageSpy).not.toHaveBeenCalled();
      expect(setPreviewElementSpy).toHaveBeenCalledWith(null);
    });

    it('calls SNAP setPreviewElement with null when no fs page is present', async () => {
      // Arrange
      const snap = mock<SNAP>();

      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      jest.spyOn(mockRemoteService, 'findPage').mockResolvedValueOnce(undefined as any);
      const setPreviewElementSpy = jest.spyOn(snap, 'setPreviewElement');
      // Act
      await service.setElement(null);
      // Assert
      expect(setPreviewElementSpy).toHaveBeenCalledWith(null);
    });
  });

  describe('createPage()', () => {
    it('it should create a page', async () => {
      // Arrange
      const snap = mock<SNAP>();

      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
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

      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
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
        expect(mockLogger.error).toHaveBeenCalledWith('Failed to execute executable', expect.anything());
      }
    });
    it('it should throw an error (invalid module response)', async () => {
      expect.assertions(5);
      // Arrange
      const snap = mock<SNAP>();

      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
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
        expect(mockLogger.error).toHaveBeenCalledWith('Invalid module response', 'Not valid response');
      }
    });
    it('it should throw an error (invalid JSON as module response)', async () => {
      expect.assertions(5);
      // Arrange
      const snap = mock<SNAP>();

      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
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
        expect(mockLogger.error).toHaveBeenCalledWith('Cannot parse module response', 'Not valid JSON');
      }
    });
    it('it should throw an error (error in module response)', async () => {
      expect.assertions(5);
      // Arrange
      const snap = mock<SNAP>();

      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
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
        expect(mockLogger.error).toHaveBeenCalledWith('Error in module during page creation', response);
      }
    });
  });

  describe('createSection()', () => {
    it('it should create a section', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'createSection').mockResolvedValue({} as CreateSectionResponse);

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

      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
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
        expect(mockLogger.error).toHaveBeenCalledWith('Failed to create section', tppError);
      }
    });
  });

  describe('init()', () => {
    it('returns true if successful', async () => {
      // Arrange
      service.test_setTPPWrapper(undefined as any); // Reset

      // Act
      const result = await service.init();

      // Assert
      expect(result).toBe(true);
    });
    it('returns false if TPP is not loaded', async () => {
      // Arrange
      service.test_setTPPWrapper(undefined as any); // Reset

      jest.mock('../integrations/tpp/TPPWrapper', () => {
        return () => Promise.reject(new Error('Failed to load TPPWrapper'));
      });

      // Act
      const result = await service.init();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getTppInstance()', () => {
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
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);

      // Act
      await service.handleError(error);

      // Assert
      expect(snap.execute).toHaveBeenNthCalledWith(1, 'script:show_error_message_dialog', {
        message: `000 - Unknown error`,
        title: 'Something went wrong',
        ok: false,
      });
      expect(mockLogger.error).toHaveBeenCalledWith('An error occured', error);
    });
    it('display dialog for client side errors', async () => {
      // Arrange
      const code = '123';
      const message = 'Error';
      const error = new EcomClientError(code, message);
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);

      // Act
      await service.handleError(error);

      // Assert
      expect(snap.execute).toHaveBeenNthCalledWith(1, 'script:show_error_message_dialog', {
        message: `${code} - ${message}`,
        title: 'Failed to add content',
        ok: false,
      });
      expect(mockLogger.error).toHaveBeenCalledWith('An error occured', error);
    });
    it('differently logs module errors', async () => {
      // Arrange
      const code = '123';
      const message = 'Error';
      const error = new EcomModuleError(code, message);
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);

      // Act
      await service.handleError(error);

      // Assert
      expect(snap.execute).toHaveBeenNthCalledWith(1, 'script:show_error_message_dialog', {
        message: `${code} - ${message}`,
        title: 'Failed to add content',
        ok: false,
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Error in FirstSpirit Module - see server logs for more details', error);
    });
  });

  describe('initPreviewHooks()', () => {
    it('returns if tpp is not loaded', async () => {
      // Arrange
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(null);
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
      expect(Ready.snap).toBeUndefined();
    });
    it('adds onContentChange handler and invokes CONTENT_CHANGED hook', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'onContentChange');
      const previewId = 'PreviewId';
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
      expect(mockHookService.callHook).toHaveBeenCalledWith(
        EcomHooks.CONTENT_CHANGED,
        expect.objectContaining({
          node,
          previewId,
          content,
        })
      );
      expect(mockHookService.callHook).toHaveBeenCalledWith(EcomHooks.PREVIEW_INITIALIZED, expect.objectContaining({ TPP_BROKER: TPPBroker.getInstance() }));
      expect(Ready.snap).toBe(snap);
    });

    it('adds onRerenderView handler', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);

      const rerenderSpy = jest.spyOn(snap, 'onRerenderView');
      const previewId = 'PreviewId';
      rerenderSpy.mockImplementation((cb) => {
        // Trigger callback
        cb();
      });

      const previewElementSpy = jest.spyOn(snap, 'getPreviewElement');
      previewElementSpy.mockReturnValue(Promise.resolve(previewId));

      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // act
      await service.test_initPreviewHooks();

      // assert
      expect(rerenderSpy).toHaveBeenCalled();
      expect(mockHookService.callHook).toHaveBeenCalledWith(
        EcomHooks.RERENDER_VIEW,
        expect.objectContaining({
          previewElement: previewId,
        })
      );
      expect(mockHookService.callHook).toHaveBeenCalledWith(EcomHooks.PREVIEW_INITIALIZED, expect.objectContaining({ TPP_BROKER: TPPBroker.getInstance() }));
      expect(Ready.snap).toBe(snap);
    });

    it('adds onRequestPreviewElement handler', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'onRequestPreviewElement');
      const previewId = 'PreviewId';
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
      expect(mockHookService.callHook).toHaveBeenCalledWith(
        EcomHooks.REQUEST_PREVIEW_ELEMENT,
        expect.objectContaining({
          previewId,
        })
      );
      expect(mockHookService.callHook).toHaveBeenCalledWith(EcomHooks.PREVIEW_INITIALIZED, expect.objectContaining({ TPP_BROKER: TPPBroker.getInstance() }));
      expect(Ready.snap).toBe(snap);
    });
    it('adds openStoreFrontUrl message handler and invokes OPEN_STOREFRONT_URL hook if topic matches', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const spy = jest.spyOn(window, 'addEventListener');
      const payload = 'PAYLOAD';
      Ready.allowedMessageOrigin = 'http://example.com';
      const message = {
        data: {
          fcecom: {
            topic: 'openStoreFrontUrl',
            payload,
          },
        },
        origin: 'http://example.com',
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
      expect(spy).toHaveBeenCalledWith('message', expect.anything());
      expect(mockHookService.callHook).toHaveBeenCalledWith(EcomHooks.OPEN_STOREFRONT_URL, payload);
      expect(mockHookService.callHook).toHaveBeenCalledWith(EcomHooks.PREVIEW_INITIALIZED, expect.objectContaining({ TPP_BROKER: TPPBroker.getInstance() }));
      expect(Ready.snap).toBe(snap);
    });
    it('adds openStoreFrontUrl message handler and does nothing if topic doesnt match', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
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
      expect(spy).toHaveBeenCalledWith('message', expect.anything());
      expect(mockHookService.callHook).not.toHaveBeenCalledWith(EcomHooks.OPEN_STOREFRONT_URL, expect.anything());
      expect(mockHookService.callHook).toHaveBeenCalledWith(EcomHooks.PREVIEW_INITIALIZED, expect.objectContaining({ TPP_BROKER: TPPBroker.getInstance() }));
      expect(Ready.snap).toBe(snap);
    });
    describe('postMessage origin validation', () => {
      it('it should not run events on wrong postMessage origin', async () => {
        // Arrange
        const mockHookService = mock<HookService>();
        jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

        const payload = {};
        Ready.allowedMessageOrigin = 'http://example.com';
        const snap = mock<SNAP>();

        (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);

        await service.test_initPreviewHooks();

        // Act
        const messageEvent = new MessageEvent('message', {
          data: {
            fcecom: {
              topic: 'openStoreFrontUrl',
              payload,
            },
          },
          origin: 'http://whatever.com',
        });

        fireEvent(window, messageEvent);

        // Assert
        expect(mockHookService.callHook).toHaveBeenNthCalledWith(1, EcomHooks.PREVIEW_INITIALIZED, expect.objectContaining({ TPP_BROKER: {} }));
        expect(mockHookService.callHook).not.toHaveBeenCalledWith(EcomHooks.OPEN_STOREFRONT_URL);
      });
      it('it should run events on correct postMessage origin', async () => {
        // Arrange
        const mockHookService = mock<HookService>();
        jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

        const payload = {};
        Ready.allowedMessageOrigin = 'http://example.com';
        const snap = mock<SNAP>();

        (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);

        const service = new TestableTPPService();

        jest.spyOn(service, 'getTppInstance').mockReturnValue(Promise.resolve(tppWrapper));
        await service.test_initPreviewHooks();

        // Act
        const messageEvent = new MessageEvent('message', {
          data: {
            fcecom: {
              topic: 'openStoreFrontUrl',
              payload,
            },
          },
          origin: 'http://example.com',
        });

        fireEvent(window, messageEvent);

        // Assert
        expect(mockHookService.callHook).toHaveBeenNthCalledWith(
          1,
          EcomHooks.PREVIEW_INITIALIZED,
          expect.objectContaining({
            TPP_BROKER: {},
          })
        );
        expect(mockHookService.callHook).toHaveBeenLastCalledWith(EcomHooks.OPEN_STOREFRONT_URL, expect.objectContaining({}));
      });
    });
  });
  describe('TranslationStudio Integration', () => {
    const testProjectAppsWithTS = ['TranslationStudio', 'Module_1', 'Module_2'];
    const testProjectAppsWithoutTS = ['Module_1', 'Module_2', 'Moduule_3'];

    describe('getProjectApps', () => {
      it('executes list project apps script on server', async () => {
        // Arrange
        const snap = mock<SNAP>();
        (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
        const spy = jest.spyOn(snap, 'execute').mockResolvedValue(testProjectAppsWithTS);

        // Act
        const result = await service.test_getProjectApps();

        // Assert
        expect(spy).toHaveBeenCalledWith('script:tpp_list_projectapps');
        expect(result).toEqual(testProjectAppsWithTS);
      });

      it('returns if tpp is not available', async () => {
        // Arrange
        (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(null);
        const spy = jest.spyOn(snap, 'execute');

        // Act
        await service.test_getProjectApps();

        // Assert
        expect(spy).not.toHaveBeenCalled();
      });
    });
    describe('addTranslationstudioButton', () => {
      it('adds a ts studio button when ts studio is installed', async () => {
        // Arrange
        const snap = mock<SNAP>();
        (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
        const executeSpy = jest.spyOn(snap, 'execute').mockResolvedValueOnce(testProjectAppsWithTS);
        const registerButtonSpy = jest.spyOn(snap, 'registerButton');

        const button: SNAPButton = {
          _name: 'translation_studio',
          label: 'Translate',
          css: 'tpp-icon-translate',
          execute: ({ status: { id: elementId }, language }) => snap.execute('script:translationstudio_ocm_translationhelper', { language, elementId }),
          isEnabled(scope: SNAPButtonScope): Promise<boolean> {
            return Promise.resolve(true);
          },
        };

        // Act
        await service.test_addTranslationstudioButton();

        // Assert
        expect(executeSpy).toHaveBeenCalledWith('script:tpp_list_projectapps');
        // JSON stringify for deep equality check
        expect(JSON.stringify(registerButtonSpy.mock.calls[0][0])).toEqual(JSON.stringify(button));
        expect(registerButtonSpy.mock.calls[0][1]).toEqual(2);
      });

      it('does not add a button if TranslationStudio is not available', async () => {
        // Arrange
        const snap = mock<SNAP>();
        (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
        jest.spyOn(snap, 'execute').mockResolvedValue(testProjectAppsWithoutTS);
        const registerButtonSpy = jest.spyOn(snap, 'registerButton');
        // Act
        await service.test_addTranslationstudioButton();

        // Assert
        expect(registerButtonSpy).not.toHaveBeenCalled();
      });

      it('returns if tpp is not available', async () => {
        // Arrange
        (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(null);
        const executeSpy = jest.spyOn(snap, 'execute').mockResolvedValueOnce(testProjectAppsWithTS);
        const registerButtonSpy = jest.spyOn(snap, 'registerButton');

        // Act
        await service.test_addTranslationstudioButton();

        // Assert
        expect(executeSpy).not.toHaveBeenCalled();
        expect(registerButtonSpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('Custom create sibling section', () => {
    describe('overrideAddSiblingSectionButton', () => {
      it('returns if tpp is not available', async () => {
        // Arrange
        (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(null);
        const spy = jest.spyOn(snap, 'registerButton');

        // Act
        await service.test_addAddSiblingSectionButton();

        // Assert
        expect(spy).not.toHaveBeenCalled();
      });
    });
    it('overrides the create section button', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const registerButtonSpy = jest.spyOn(snap, 'registerButton');

      const button: SNAPButton = {
        label: 'Add Section',
        css: 'tpp-icon-add-section',
        isEnabled: (scope: SNAPButtonScope) => {
          return Promise.resolve(true);
        },
        isVisible: (scope: SNAPButtonScope) => {
          return Promise.resolve(true);
        },
        execute: async ({ $node, previewId }: SNAPButtonScope) => {
          return await service.test_addSiblingSection($node, previewId);
        },
      };

      // Act
      await service.test_addAddSiblingSectionButton();

      // Assert
      // JSON stringify for deep equality check
      expect(JSON.stringify(registerButtonSpy.mock.calls[0][0])).toEqual(JSON.stringify(button));
      expect(registerButtonSpy.mock.calls[0][1]).toEqual(1);
    });

    describe('addSiblingSection', () => {
      describe('calls section created hook', () => {
        // Arrange
        const siblingPreviewId = 'previewId';

        const sectionData: CreateSectionResponse = {
          displayName: 'test',
          displayed: true,
          formData: {},
          fsType: 'Section',
          identifier: 'identifier',
          name: 'name',
          template: {},
          metaFormData: {},
        };

        const expectedHookPayload = {
          pageId: 'pageID',
          identifier: 'identifier',
          slotName: 'slotName',
          siblingPreviewId,
          sectionData,
        };

        const expectedCreateSectionPayload: CreateSectionPayload = {
          pageId: expectedHookPayload.pageId,
          slotName: expectedHookPayload.slotName,
        };

        it('when section is direct child of slot', async () => {
          // Arrange
          const parentElement = document.createElement('div');

          const node = document.createElement('div');
          node.setAttribute('data-preview-id', 'previewId-0');
          parentElement.appendChild(node);

          const mockHookService = mock<HookService>();
          jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
          const serviceSpy = jest.spyOn(service, 'createSection').mockResolvedValue(sectionData);
          parentElement.setAttribute('data-fcecom-slot-name', expectedHookPayload.slotName);
          service.setCurrentPageRefPreviewId(expectedHookPayload.pageId);

          // Act
          await service.test_addSiblingSection(node, siblingPreviewId);
          // Assert
          expect(serviceSpy.mock.calls[0][0]).toEqual(expectedCreateSectionPayload); // payload
          expect(serviceSpy.mock.calls[0][1]).toEqual(0); // index
          expect(mockHookService.callHook).toHaveBeenCalledWith(EcomHooks.SECTION_CREATED, expectedHookPayload);
        });

        it('when section is wrapped in another div in slot', async () => {
          // Arrange
          const parentElement = document.createElement('div');

          const wrapper = document.createElement('div');

          const node = document.createElement('div');
          node.setAttribute('data-preview-id', 'previewId-0');
          parentElement.appendChild(wrapper);
          wrapper.appendChild(node);

          const mockHookService = mock<HookService>();
          jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
          const serviceSpy = jest.spyOn(service, 'createSection').mockResolvedValue(sectionData);
          parentElement.setAttribute('data-fcecom-slot-name', expectedHookPayload.slotName);
          service.setCurrentPageRefPreviewId(expectedHookPayload.pageId);

          // Act
          await service.test_addSiblingSection(node, siblingPreviewId);
          // Assert
          expect(serviceSpy.mock.calls[0][0]).toEqual(expectedCreateSectionPayload); // payload;
          expect(serviceSpy.mock.calls[0][1]).toEqual(0); // index;
          expect(mockHookService.callHook).toHaveBeenCalledWith(EcomHooks.SECTION_CREATED, expectedHookPayload);
        });

        describe('creates sibling right next to existing ones', () => {
          it('2nd element: should be 2 of 2', async () => {
            // Arrange
            const parentElement = document.createElement('div');

            const node = document.createElement('div');
            node.setAttribute('data-preview-id', 'previewId-0');
            parentElement.appendChild(node);

            const mockHookService = mock<HookService>();
            jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
            const serviceSpy = jest.spyOn(service, 'createSection').mockResolvedValue(sectionData);
            parentElement.setAttribute('data-fcecom-slot-name', expectedHookPayload.slotName);
            service.setCurrentPageRefPreviewId(expectedHookPayload.pageId);

            // Act
            await service.test_addSiblingSection(node, siblingPreviewId);
            // Assert
            expect(serviceSpy.mock.calls[0][0]).toEqual(expectedCreateSectionPayload); // payload
            expect(serviceSpy.mock.calls[0][1]).toEqual(0); // index
          });

          it('3 elements · append to first node: should be 2 of 3', async () => {
            // Arrange
            const parentElement = document.createElement('div');

            const firstNode = document.createElement('div');
            firstNode.setAttribute('data-preview-id', 'previewId-0');
            parentElement.appendChild(firstNode);

            const secondNode = document.createElement('div');
            secondNode.setAttribute('data-preview-id', 'previewId-1');
            parentElement.appendChild(secondNode);

            const mockHookService = mock<HookService>();
            jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
            const serviceSpy = jest.spyOn(service, 'createSection').mockResolvedValue(sectionData);
            parentElement.setAttribute('data-fcecom-slot-name', expectedHookPayload.slotName);
            service.setCurrentPageRefPreviewId(expectedHookPayload.pageId);

            // Act
            await service.test_addSiblingSection(firstNode, siblingPreviewId);
            // Assert
            expect(serviceSpy.mock.calls[0][0]).toEqual(expectedCreateSectionPayload); // payload
            expect(serviceSpy.mock.calls[0][1]).toEqual(0); // index
          });

          it('4 elements · append to first node: should be 2 of 4', async () => {
            // Arrange
            const parentElement = document.createElement('div');

            const firstNode = document.createElement('div');
            firstNode.setAttribute('data-preview-id', 'previewId-0');
            parentElement.appendChild(firstNode);

            const secondNode = document.createElement('div');
            secondNode.setAttribute('data-preview-id', 'previewId-1');
            parentElement.appendChild(secondNode);

            const thirdNode = document.createElement('div');
            thirdNode.setAttribute('data-preview-id', 'previewId-2');
            parentElement.appendChild(thirdNode);

            const mockHookService = mock<HookService>();
            jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
            const serviceSpy = jest.spyOn(service, 'createSection').mockResolvedValue(sectionData);
            parentElement.setAttribute('data-fcecom-slot-name', expectedHookPayload.slotName);
            service.setCurrentPageRefPreviewId(expectedHookPayload.pageId);

            // Act
            await service.test_addSiblingSection(firstNode, siblingPreviewId);
            // Assert
            expect(serviceSpy.mock.calls[0][0]).toEqual(expectedCreateSectionPayload); // payload
            expect(serviceSpy.mock.calls[0][1]).toEqual(0); // index
          });

          it('4 elements · append to second node: should be 3 of 4', async () => {
            // Arrange
            const parentElement = document.createElement('div');

            const firstNode = document.createElement('div');
            firstNode.setAttribute('data-preview-id', 'previewId-0');
            parentElement.appendChild(firstNode);

            const secondNode = document.createElement('div');
            secondNode.setAttribute('data-preview-id', 'previewId-1');
            parentElement.appendChild(secondNode);

            const thirdNode = document.createElement('div');
            thirdNode.setAttribute('data-preview-id', 'previewId-2');
            parentElement.appendChild(thirdNode);

            const mockHookService = mock<HookService>();
            jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
            const serviceSpy = jest.spyOn(service, 'createSection').mockResolvedValue(sectionData);
            parentElement.setAttribute('data-fcecom-slot-name', expectedHookPayload.slotName);
            service.setCurrentPageRefPreviewId(expectedHookPayload.pageId);

            // Act
            await service.test_addSiblingSection(secondNode, siblingPreviewId);
            // Assert
            expect(serviceSpy.mock.calls[0][0]).toEqual(expectedCreateSectionPayload); // payload
            expect(serviceSpy.mock.calls[0][1]).toEqual(1); // index
          });

          it('4 elements · append to third node: should be 4 of 4', async () => {
            // Arrange
            const parentElement = document.createElement('div');

            const firstNode = document.createElement('div');
            firstNode.setAttribute('data-preview-id', 'previewId-0');
            parentElement.appendChild(firstNode);

            const secondNode = document.createElement('div');
            secondNode.setAttribute('data-preview-id', 'previewId-1');
            parentElement.appendChild(secondNode);

            const thirdNode = document.createElement('div');
            thirdNode.setAttribute('data-preview-id', 'previewId-2');
            parentElement.appendChild(thirdNode);

            const mockHookService = mock<HookService>();
            jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
            const serviceSpy = jest.spyOn(service, 'createSection').mockResolvedValue(sectionData);
            parentElement.setAttribute('data-fcecom-slot-name', expectedHookPayload.slotName);
            service.setCurrentPageRefPreviewId(expectedHookPayload.pageId);

            // Act
            await service.test_addSiblingSection(thirdNode, siblingPreviewId);
            // Assert
            expect(serviceSpy.mock.calls[0][0]).toEqual(expectedCreateSectionPayload); // payload
            expect(serviceSpy.mock.calls[0][1]).toEqual(2); // index
          });
        });
      });

      it('does not call section created hook if slotName is undefined', async () => {
        // Arrange
        const siblingPreviewId = 'previewId';
        const parentElement = document.createElement('div');
        const node = document.createElement('div');
        parentElement.appendChild(node);

        const pageId = 'pageID';

        const mockHookService = mock<HookService>();
        jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
        jest.spyOn(service, 'createSection');
        service.setCurrentPageRefPreviewId(pageId);

        // Act
        await service.test_addSiblingSection(node, siblingPreviewId);
        // Assert
        expect(mockHookService.callHook).not.toHaveBeenCalled();
        expect(service.createSection).not.toHaveBeenCalled();
      });

      it('does not call section created hook if slotName is null', async () => {
        // Arrange
        const siblingPreviewId = 'previewId';
        const parentElement = document.createElement('div');
        const node = document.createElement('div');
        parentElement.appendChild(node);

        const slotName = null;
        const pageId = 'pageID';

        const mockHookService = mock<HookService>();
        jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
        jest.spyOn(service, 'createSection');
        jest.spyOn(parentElement, 'getAttribute').mockReturnValue(slotName);
        service.setCurrentPageRefPreviewId(pageId);

        // Act
        await service.test_addSiblingSection(node, siblingPreviewId);
        // Assert
        expect(mockHookService.callHook).not.toHaveBeenCalled();
        expect(service.createSection).not.toHaveBeenCalled();
      });

      it('does not call section created hook if currentPagerefPreviewId is null', async () => {
        // Arrange
        const siblingPreviewId = 'previewId';
        const parentElement = document.createElement('div');
        const node = document.createElement('div');
        parentElement.appendChild(node);

        const slotName = 'slotName';

        const mockHookService = mock<HookService>();
        jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
        jest.spyOn(service, 'createSection');
        jest.spyOn(parentElement, 'getAttribute').mockReturnValue(slotName);
        service.setCurrentPageRefPreviewId(null);

        // Act
        await service.test_addSiblingSection(node, siblingPreviewId);
        // Assert
        expect(mockHookService.callHook).not.toHaveBeenCalled();
        expect(service.createSection).not.toHaveBeenCalled();
      });

      it('does not call section created hook if createSectionResult is undefined', async () => {
        // Arrange
        const siblingPreviewId = 'previewId';
        const parentElement = document.createElement('div');
        const node = document.createElement('div');
        parentElement.appendChild(node);

        const slotName = 'slotName';
        const pageId = 'pageID';

        const mockCreateSection = jest.fn(() => {
          return Promise.resolve(undefined);
        });

        const mockHookService = mock<HookService>();
        jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);
        jest.spyOn(service, 'createSection').mockImplementationOnce(mockCreateSection);
        jest.spyOn(parentElement, 'getAttribute').mockReturnValue(slotName);
        service.setCurrentPageRefPreviewId(pageId);

        // Assert
        expect(mockHookService.callHook).not.toHaveBeenCalled();
        expect(service.createSection).not.toHaveBeenCalled();
      });
    });

    describe('getNodeIndex', () => {
      const slotname = 'slotName';
      it('return the index of the given node in the parent when first node', () => {
        // Arrange
        const parentElement = document.createElement('div');
        parentElement.setAttribute('data-fcecom-slot-name', slotname);
        const node = document.createElement('div');
        node.setAttribute('data-preview-id', 'previewId-0');
        parentElement.appendChild(node);

        // Act
        const result = service.test_getNodeIndex(node);
        // Assert
        expect(result).toEqual(0);
      });

      it('return the index of the given node in the parent when when second node', () => {
        // Arrange
        const parentElement = document.createElement('div');
        parentElement.setAttribute('data-fcecom-slot-name', slotname);
        const previousNode = document.createElement('div');
        previousNode.setAttribute('data-preview-id', 'previewId-0');
        const node = document.createElement('div');
        node.setAttribute('data-preview-id', 'previewId-1');
        parentElement.appendChild(previousNode);
        parentElement.appendChild(node);

        // Act
        const result = service.test_getNodeIndex(node);
        // Assert
        expect(result).toEqual(1);
      });

      it('return -1 when node has no parent', () => {
        // Arrange
        const node = document.createElement('div');
        // Act
        const result = service.test_getNodeIndex(node);
        // Assert
        expect(result).toEqual(-1);
      });
    });
  });
  describe('isPreviewInitialized()', () => {
    it('returns true when TPP is initialized', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);

      // Act
      const result = await service.isPreviewInitialized();

      // Assert
      expect(result).toBe(true);
    });

    it('returns false when TPP is not initialized', async () => {
      // Arrange
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(null);

      // Act
      const result = await service.isPreviewInitialized();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('parseModuleResponse()', () => {
    it('parses valid JSON response', () => {
      // Arrange
      const moduleResponse = { success: true };
      const response = `Json ${JSON.stringify(moduleResponse)}`;

      // Act
      const result = service.test_parseModuleResponse(response);

      // Assert
      expect(result).toEqual(moduleResponse);
    });

    it('throws error for invalid response format', () => {
      // Arrange
      const response = 'Not a valid Json response';

      // Act & Assert
      expect(() => service.test_parseModuleResponse(response)).toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid module response', response);
    });

    it('throws error when JSON parsing fails', () => {
      // Arrange
      const response = 'Json {invalid json}';

      // Act & Assert
      expect(() => service.test_parseModuleResponse(response)).toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('Cannot parse module response', '{invalid json}');
    });
  });

  describe('initMessagesToServer()', () => {
    it('returns early if TPP is not available', async () => {
      // Arrange
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(null);
      const onRequestPreviewElementSpy = jest.spyOn(snap, 'onRequestPreviewElement');

      // Act
      await service.test_initMessagesToServer();

      // Assert
      expect(onRequestPreviewElementSpy).not.toHaveBeenCalled();
    });

    it('executes with SITESTORE element', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const previewId = 'NEW_PREVIEW_ID';
      const spy = jest.spyOn(snap, 'onRequestPreviewElement');

      spy.mockImplementation((callback) => {
        callback(previewId);
      });

      const status = {
        storeType: 'SITESTORE',
        id: '123',
        language: 'en',
      } as SNAPStatus;

      jest.spyOn(snap, 'getElementStatus').mockResolvedValue(status);
      const executeSpy = jest.spyOn(snap, 'execute');
      const setPreviewElementSpy = jest.spyOn(snap, 'setPreviewElement');

      // Act
      await service.test_initMessagesToServer();

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(
        'class:FirstSpirit Connect for Commerce - Preview Message Receiver',
        {
          topic: 'requestedPreviewElement',
          pageRefId: status.id,
          language: status.language,
        },
        false
      );
      expect(setPreviewElementSpy).toHaveBeenCalledWith(previewId);
    });

    it('does nothing when previewId has not changed', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const previewId = 'SAME_PREVIEW_ID';
      const spy = jest.spyOn(snap, 'onRequestPreviewElement');

      service['lastRequestedPreviewId'] = previewId;

      spy.mockImplementation((callback) => {
        callback(previewId);
      });

      const getElementStatusSpy = jest.spyOn(snap, 'getElementStatus');

      // Act
      await service.test_initMessagesToServer();

      // Assert
      expect(getElementStatusSpy).not.toHaveBeenCalled();
    });
  });

  describe('initPreviewHooks() with navigation', () => {
    it('registers onNavigationChange handler', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const onNavigationChangeSpy = jest.spyOn(snap, 'onNavigationChange');
      const previewId = 'NAVIGATION_PREVIEW_ID';

      onNavigationChangeSpy.mockImplementation((callback) => {
        callback(previewId);
      });

      const mockHookService = mock<HookService>();
      jest.spyOn(HookService, 'getInstance').mockReturnValue(mockHookService);

      // Act
      await service.test_initPreviewHooks();

      // Assert
      expect(onNavigationChangeSpy).toHaveBeenCalled();
      expect(mockHookService.callHook).toHaveBeenCalledWith(
        EcomHooks.PAGE_CREATED,
        expect.objectContaining({
          previewId,
        })
      );
    });
  });

  describe('addTranslationstudioButton() execute', () => {
    it('tests button execute function', async () => {
      // Arrange
      const snap = mock<SNAP>();
      (tppWrapper as { TPP_SNAP: Promise<SNAP | null> }).TPP_SNAP = Promise.resolve(snap);
      const executeSpy = jest.spyOn(snap, 'execute').mockResolvedValue(['TranslationStudio']);
      const registerButtonSpy = jest.spyOn(snap, 'registerButton');

      // Act
      await service.test_addTranslationstudioButton();

      // Assert
      expect(registerButtonSpy).toHaveBeenCalled();
      expect(executeSpy).toHaveBeenCalledWith('script:tpp_list_projectapps');

      // Get the registered button from the spy call
      const button = registerButtonSpy.mock.calls[0][0];

      // Verify button properties
      expect(button).toBeDefined();
      expect(button._name).toBe('translation_studio');
      expect(button.label).toBe('Translate');
      expect(button.css).toBe('tpp-icon-translate');

      // Verify button position
      expect(registerButtonSpy.mock.calls[0][1]).toBe(2);

      // Test button's isEnabled function
      // @ts-ignore
      const isEnabledResult = await button.isEnabled({} as SNAPButtonScope);
      expect(isEnabledResult).toBe(true);

      // Test execute function with a mock scope
      const mockScope = {
        status: { id: 'test-id' },
        language: 'en',
      };

      // Verify execute functionality
      // @ts-ignore
      button.execute(mockScope);
      expect(snap.execute).toHaveBeenCalledWith('script:translationstudio_ocm_translationhelper', {
        language: 'en',
        elementId: 'test-id',
      });
      expect(executeSpy).toHaveBeenCalledTimes(2); // Once for getProjectApps, once for the button execution
    });
  });
});
