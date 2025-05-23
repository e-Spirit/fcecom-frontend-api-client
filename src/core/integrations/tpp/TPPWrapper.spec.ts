import { TPPWrapper } from './TPPWrapper';
import { SNAP } from './TPPWrapper.meta';
import { TPPLoader } from './TPPLoader';
import { mock } from 'jest-mock-extended';

// Types for MessagePort and MessageChannel mocks
interface MockMessagePort {
  postMessage: jest.Mock;
  onmessage: ((event: MessageEvent) => void) | null;
  close: jest.Mock;
  start: jest.Mock;
}

describe('TPPWrapper', () => {
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
  });

  afterEach(() => {
    global.MessageChannel = originalMessageChannel;
  });

  describe('constructor', () => {
    it('it should initialize with no arguments provided', async () => {
      // act + arrange
      const tppLoader = new TPPLoader();
      const snap = mock<SNAP>();

      jest.spyOn(tppLoader, 'waitForContentCreator').mockResolvedValue();
      jest.spyOn(tppLoader, 'getSnap').mockResolvedValue(snap);
      jest.spyOn(TPPWrapper, 'createTPPLoader').mockReturnValue(tppLoader);

      const tppWrapper = new TPPWrapper();

      // assert
      expect(typeof (await tppWrapper.TPP_SNAP)).toBe('object');

      expect(typeof tppWrapper.debug).toBe('boolean');
      expect(tppWrapper.debug).toBe(false);
    });
  });

  describe('logIAmAlive', () => {
    it('it should say hello to the world', async () => {
      // arrange
      const tppLoader = new TPPLoader();
      const snap = mock<SNAP>();

      jest.spyOn(tppLoader, 'waitForContentCreator').mockResolvedValue();
      jest.spyOn(tppLoader, 'getSnap').mockResolvedValue(snap);
      const tppWrapper = new TPPWrapper({ tppLoader });

      // act
      await tppWrapper.logIAmAlive();

      // assert
      expect(snap.onInit).toHaveBeenCalledTimes(1);
    });
  });
});
