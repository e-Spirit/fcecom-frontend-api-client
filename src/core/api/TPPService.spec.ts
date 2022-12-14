import { mock } from 'jest-mock-extended';
import { SNAP, TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { TPPLoader } from '../integrations/tpp/TPPLoader';
import { TPPWrapper } from '../integrations/tpp/TPPWrapper';
import { TPPService } from './TPPService';
import { RemoteService } from './RemoteService';
import { FindPageParams, FindPageResponse } from './Remoteservice.meta';

const tppLoader = new TPPLoader();
const snap = mock<SNAP>();

jest.spyOn(tppLoader, 'getSnap').mockResolvedValue(snap);
jest.spyOn(TPPWrapper, 'createTPPLoader').mockReturnValue(tppLoader);

class TestableTPPService extends TPPService {
  public test_setTPPWrapper(tppWrapper: TPPWrapperInterface): void {
    this.setTPPWrapper(tppWrapper);
  }
}

const API_URL = 'https://api_url:3000';
let tppWrapper: TPPWrapper;

jest.mock('./RemoteService');
const mockRemoteService = new RemoteService(API_URL);

let service: TestableTPPService;
describe('TPPService', () => {
  beforeEach(() => {
    tppWrapper = new TPPWrapper();
    service = new TestableTPPService(mockRemoteService);
    service.test_setTPPWrapper(tppWrapper);
  });

  describe('constructor()', () => {
    it('creates an instance', () => {
      // Act
      const service = new TestableTPPService(mockRemoteService);

      // Assert
      expect(service).toBeInstanceOf(TestableTPPService);
    });
  });

  describe('setElement()', () => {
    it('calls SNAP setPreviewElement', async () => {
      // Arrange
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper.TPP_SNAP = Promise.resolve(snap);
      const params = {
        id: 'ID',
        type: 'content',
        locale: 'en_GB'
      } as FindPageParams;
      const previewId = 'PREVIEWID';
      const mockFindPageResponse = {
        items: [ { previewId } ]
      } as FindPageResponse;
      const findPageSpy = jest.spyOn(mockRemoteService, 'findPage').mockResolvedValueOnce(mockFindPageResponse);
      const setPreviewElementSpy = jest.spyOn(snap, 'setPreviewElement');
      // Act
      await service.setElement(params);
      // Assert
      expect(findPageSpy).toBeCalledWith(params);
      expect(setPreviewElementSpy).toBeCalledWith(previewId);
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
      await service.createPage({
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
      const spy = jest.spyOn(snap, 'execute').mockRejectedValueOnce('Error');

      // Act
      await service.createPage({
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

    it('it should execute a script on error', async () => {
      // Arrange
      const snap = mock<SNAP>();

      // @ts-ignore - TODO: Make properly test possible
      tppWrapper.TPP_SNAP = Promise.resolve(snap);
      const spy = jest.spyOn(snap, 'createSection').mockRejectedValueOnce(new Error());

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
      expect(snap.execute).toHaveBeenNthCalledWith(1, 'script:show_error_message_dialog', {
        message: `Error`,
        title: 'Could not create section',
        ok: false,
      });
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
});
