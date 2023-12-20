import { mock } from 'jest-mock-extended';
import { ReferrerStore } from './ReferrerStore';
import { Logger } from './logging/Logger';

const TEST_REFERRER = 'https://referrer_url';
const mockLogger = mock<Logger>();
ReferrerStore['logger'] = mockLogger;

describe('ReferrerStore', () => {
  describe('init()', () => {
    describe('in browser', () => {
      beforeEach(() => {
        jest.spyOn(window, 'self', 'get').mockImplementation(() => window);
      });
      it('sets the current referrer to the SessionStorage if none is set already', async () => {
        // Arrange
        jest.spyOn(document, 'referrer', 'get').mockImplementation(() => TEST_REFERRER);
        const sessionStorageMock = mock<Storage>();
        jest.spyOn(window, 'sessionStorage', 'get').mockReturnValue(sessionStorageMock);
        // Act
        ReferrerStore.init();
        // Assert
        expect(sessionStorageMock.setItem).toHaveBeenCalledWith('fcecom-referrer', TEST_REFERRER);
      });
      it('does not set the current referrer to the SessionStorage if one is set already', async () => {
        // Arrange
        jest.spyOn(document, 'referrer', 'get').mockImplementation(() => TEST_REFERRER);
        const sessionStorageMock = mock<Storage>();
        jest.spyOn(sessionStorageMock, 'getItem').mockReturnValue('SOME_REFERRER');
        jest.spyOn(window, 'sessionStorage', 'get').mockReturnValue(sessionStorageMock);
        // Act
        ReferrerStore.init();
        // Assert
        expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalledWith("Referrer already set to 'SOME_REFERRER'");
      });
    });
    describe('not in browser', () => {
      beforeEach(() => {
        jest.spyOn(window, 'self', 'get').mockImplementation(() => undefined as any);
      });
      it('should return an empty string', async () => {
        // Arrange
        jest.spyOn(document, 'referrer', 'get').mockImplementation(() => TEST_REFERRER);
        const sessionStorageMock = mock<Storage>();
        jest.spyOn(window, 'sessionStorage', 'get').mockReturnValue(sessionStorageMock);
        // Act
        ReferrerStore.init();
        // Assert
        expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('getReferrer()', () => {
    describe('in browser', () => {
      beforeEach(() => {
        jest.spyOn(window, 'self', 'get').mockImplementation(() => window);
      });
      it('returns empty string of no referrer has been set', async () => {
        // Arrange
        const sessionStorageMock = mock<Storage>();
        jest.spyOn(window, 'sessionStorage', 'get').mockReturnValue(sessionStorageMock);
        jest.spyOn(sessionStorageMock, 'getItem').mockReturnValue(null);
        // Act
        const result = ReferrerStore.getReferrer();
        // Assert
        expect(result).toEqual('');
        expect(mockLogger.debug).toHaveBeenCalledWith('Not initialized');
      });
      it('returns previously set referrer', async () => {
        // Arrange
        jest.spyOn(document, 'referrer', 'get').mockImplementation(() => TEST_REFERRER);
        const sessionStorageMock = mock<Storage>();
        jest.spyOn(window, 'sessionStorage', 'get').mockReturnValue(sessionStorageMock);
        let setValue: string | null = null;
        jest.spyOn(sessionStorageMock, 'setItem').mockImplementation((_key, value) => (setValue = value));
        jest.spyOn(sessionStorageMock, 'getItem').mockImplementation(() => setValue);
        ReferrerStore.init();
        // Act
        const result = ReferrerStore.getReferrer();
        // Assert
        expect(result).toEqual(TEST_REFERRER);
      });
    });
    describe('not in browser', () => {
      beforeEach(() => {
        jest.spyOn(window, 'self', 'get').mockImplementation(() => undefined as any);
      });
      it('should return an empty string', async () => {
        // Arrange
        jest.spyOn(document, 'referrer', 'get').mockImplementation(() => TEST_REFERRER);
        const sessionStorageMock = mock<Storage>();
        jest.spyOn(window, 'sessionStorage', 'get').mockReturnValue(sessionStorageMock);
        // Act
        const result = ReferrerStore.getReferrer();
        // Assert
        expect(result).toEqual('');
        expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
      });
    });
  });
});
