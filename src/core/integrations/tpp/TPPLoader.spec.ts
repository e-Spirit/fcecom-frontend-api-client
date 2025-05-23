import { quickId } from '../../utils/helper';
import { ReferrerStore } from '../../utils/ReferrerStore';
import { TPPLoader } from './TPPLoader';
import { SNAP } from './TPPWrapper.meta';

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

describe('TPPLoader', () => {
  // Constant values
  const fsHost = 'http://referrer';
  const handle = quickId();

  // MessageChannel-related variables
  let mockPort1: MockMessagePort;
  let mockPort2: MockMessagePort;
  let originalMessageChannel: typeof MessageChannel;

  // DOM-related variables
  let scriptTagMock: HTMLScriptElement;
  let appendChildSpy: jest.SpyInstance;

  // Window-related variables
  let mockParentPostMessage: jest.Mock;
  let originalParent: Window;

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

    // ===== Window Mocks =====
    originalParent = window.parent;

    // Mock window.parent.postMessage
    mockParentPostMessage = jest.fn();
    Object.defineProperty(window, 'parent', {
      value: {
        ...window,
        postMessage: mockParentPostMessage,
      },
      writable: true,
      configurable: true,
    });

    // Remove TPP_SNAP from window if it exists
    if ('TPP_SNAP' in window) {
      delete window.TPP_SNAP;
    }

    // ===== ReferrerStore Mock =====
    jest.spyOn(ReferrerStore, 'getReferrer').mockReturnValue(fsHost);

    // ===== DOM Mocks =====
    // Setup document.body
    if (!document.body) {
      document.body = document.createElement('body');
    }

    // Create a script tag mock with custom event handlers
    scriptTagMock = createMockScriptElement();

    // Spy on appendChild to return our controlled mock script
    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockReturnValue(scriptTagMock);
  });

  afterEach(() => {
    // Restore mocks and original objects
    Object.defineProperty(window, 'parent', {
      value: originalParent,
      writable: true,
      configurable: true,
    });
    global.MessageChannel = originalMessageChannel;
    jest.restoreAllMocks();

    // Clean up TPP_SNAP
    if ('TPP_SNAP' in window) {
      delete window.TPP_SNAP;
    }
  });

  /**
   * Creates a mocked script element with overridden onload/onerror properties
   */
  function createMockScriptElement(): HTMLScriptElement {
    const scriptElement = document.createElement('script');
    let onloadHandler: ((event: Event) => void) | null = null;
    let onerrorHandler: ((event: ErrorEvent) => void) | null = null;

    // Override the script tag's onload and onerror properties
    Object.defineProperties(scriptElement, {
      onload: {
        get: () => onloadHandler,
        set: (handler) => {
          onloadHandler = handler;
        },
        configurable: true,
      },
      onerror: {
        get: () => onerrorHandler,
        set: (handler) => {
          onerrorHandler = handler;
        },
        configurable: true,
      },
    });

    return scriptElement;
  }

  /**
   * Helper function to set up a successful ContentCreator connection
   */
  async function setupContentCreatorConnection(loader: TPPLoader): Promise<void> {
    const connectionPromise = loader.waitForContentCreator();

    // Simulate successful response from ContentCreator
    if (mockPort1.onmessage) {
      mockPort1.onmessage(
        createMessageEvent({
          handle,
          category: 'success',
          payload: {},
        })
      );
    }

    return connectionPromise;
  }

  /**
   * Creates a MessageEvent with the specified data
   */
  function createMessageEvent(data: any): MessageEvent {
    return {
      data,
    } as MessageEvent;
  }

  describe('TPP loading', () => {
    // Create a mock SNAP object that will resolve isConnected to true
    const mockSnap: SNAP = {
      isConnected: Promise.resolve(true),
    } as unknown as SNAP;

    it('should load TPP script and successfully initialize SNAP', async () => {
      // Arrange
      const loader = new TPPLoader();
      loader.setHandle(handle);

      // Successful ContentCreator connection
      await setupContentCreatorConnection(loader);

      // Act
      const snapPromise = loader.getSnap(); // Start loading TPP

      // Verify script was added correctly
      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      expect(scriptTagMock.src).toBe(`${fsHost}/fs5webedit/live/live.js`);

      // Before triggering onload, set TPP_SNAP on window
      window.TPP_SNAP = mockSnap;

      // Now trigger the onload event
      if (typeof scriptTagMock.onload === 'function') {
        await scriptTagMock.onload(new Event('load'));
      } else {
        throw new Error('onload handler was not set on the script tag');
      }

      // Assert that SNAP was returned successfully
      const result = await snapPromise;
      expect(result).toBe(mockSnap);
    });

    it('should reject when TPP_SNAP is not available after script loads', async () => {
      // Arrange
      const loader = new TPPLoader();
      loader.setHandle(handle);

      // Successful ContentCreator connection
      await setupContentCreatorConnection(loader);

      // Act
      const snapPromise = loader.getSnap();

      // Verify script was added
      expect(appendChildSpy).toHaveBeenCalledTimes(1);

      // Trigger onload WITHOUT setting TPP_SNAP on window
      if (typeof scriptTagMock.onload === 'function') {
        await scriptTagMock.onload(new Event('load'));
      } else {
        throw new Error('onload handler was not set on the script tag');
      }

      // Assert that the promise rejects
      await expect(snapPromise).rejects.toThrow('Unable to load TPP_SNAP');
    });

    it('should reject when SNAP.isConnected resolves to false', async () => {
      // Arrange
      const loader = new TPPLoader();
      loader.setHandle(handle);

      // Successful ContentCreator connection
      await setupContentCreatorConnection(loader);

      // Create a mock SNAP that will resolve isConnected to false
      const mockSnapWithFailedConnection: SNAP = {
        isConnected: Promise.resolve(false),
      } as unknown as SNAP;

      // Act
      const snapPromise = loader.getSnap();

      // Set TPP_SNAP but with isConnected resolving to false
      window.TPP_SNAP = mockSnapWithFailedConnection;

      // Trigger onload
      if (typeof scriptTagMock.onload === 'function') {
        await scriptTagMock.onload(new Event('load'));
      } else {
        throw new Error('onload handler was not set on the script tag');
      }

      // Assert rejection
      await expect(snapPromise).rejects.toThrow('Unable to set up TPP_SNAP');
    });

    it('should handle script loading errors', async () => {
      // Arrange
      const loader = new TPPLoader();
      loader.setHandle(handle);

      // Act
      const snapPromise = loader.getSnap();

      // Verify script was added
      expect(appendChildSpy).toHaveBeenCalledTimes(1);

      // Trigger onerror
      if (typeof scriptTagMock.onerror === 'function') {
        scriptTagMock.onerror(new ErrorEvent('error'));
      } else {
        throw new Error('onerror handler was not set on the script tag');
      }

      // Assert that the same promise is used for both onload and onerror
      await expect(snapPromise).rejects.toThrow('Unable to load TPP_SNAP');
    });
  });

  describe('waitForContentCreator', () => {
    it('should resolve when connection established', async () => {
      // Arrange
      const loader = new TPPLoader();
      loader.setHandle(handle);

      // Act & Assert
      await expect(setupContentCreatorConnection(loader)).resolves.not.toThrow();

      // Verify postMessage was called
      expect(mockParentPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'operation',
          type: 'connect',
          handle,
        }),
        '*',
        [mockPort2]
      );
    });

    it('should reject when connection fails', async () => {
      // Arrange
      const loader = new TPPLoader();
      loader.setHandle(handle);

      const promise = loader.waitForContentCreator();

      // Simulate an error response
      if (mockPort1.onmessage) {
        mockPort1.onmessage(
          createMessageEvent({
            handle,
            category: 'error',
            payload: { message: 'Connection failed' },
          })
        );
      }

      // Assert
      await expect(promise).rejects.toEqual(undefined);
    });

    it('should reject on timeout', async () => {
      // Arrange
      jest.useFakeTimers();
      const loader = new TPPLoader();
      loader.setHandle(handle);

      // Act
      const promise = loader.waitForContentCreator(500);

      // Fast-forward until all timers have been executed
      jest.advanceTimersByTime(600);

      // Assert
      await expect(promise).rejects.toEqual(undefined);

      // Clean up
      jest.useRealTimers();
    });
  });
});
