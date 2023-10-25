import { mock } from 'jest-mock-extended';
import { HookService, Ready } from './HookService';
import { EcomHooks } from './HookService.meta';
import { SNAP } from '../core/integrations/tpp/TPPWrapper.meta';
import * as LoggingModule from '../core/utils/logging/Logger';
import { TPPBroker } from './TPPBroker';

const { Logger, Logging, LogLevel } = LoggingModule;

describe('HookService.getInstance()', () => {
  describe('callHook()', () => {
    it('calls registered Hooks', () => {
      // Arrange
      const testMethod = jest.fn();
      const payload = {
        content: 'CONTENT',
        node: mock<HTMLElement>(),
        previewId: 'PREVIEWID',
      };
      HookService.getInstance().addHook(EcomHooks.CONTENT_CHANGED, testMethod);
      // Act
      HookService.getInstance().callHook(EcomHooks.CONTENT_CHANGED, payload);
      // Assert
      expect(testMethod).toBeCalledWith(payload);
    });
    it('does not fail if no hook is set for the given type', () => {
      // Arrange
      const payload = {
        content: 'CONTENT',
        node: mock<HTMLElement>(),
        previewId: 'PREVIEWID',
      };
      expect(() => {
        // Act
        HookService.getInstance().callHook(EcomHooks.CONTENT_CHANGED, payload);
        // Assert
      }).not.toThrow();
    });
    it('does not break if a function is undefined', () => {
      // Arrange
      const logger = mock(Logger as any);
      const errorSpy = jest.spyOn(logger, 'error');

      jest.spyOn(LoggingModule, 'getLogger').mockReturnValue(logger as any);

      const errorThrowingFunction = jest.fn().mockImplementation(() => {
        throw new Error('Test Error');
      });

      const correctExecutingFunction = jest.fn();

      const payload = {
        content: 'CONTENT',
        node: mock<HTMLElement>(),
        previewId: 'PREVIEWID',
      };

      // Act
      HookService.getInstance().addHook(EcomHooks.CONTENT_CHANGED, undefined as any);
      HookService.getInstance().addHook(EcomHooks.CONTENT_CHANGED, errorThrowingFunction as any);
      HookService.getInstance().addHook(EcomHooks.CONTENT_CHANGED, correctExecutingFunction as any);

      expect(() => {
        HookService.getInstance().callHook(EcomHooks.CONTENT_CHANGED, payload);
        // Assert
      }).not.toThrow();

      expect(errorSpy).toBeCalledTimes(2);
      expect(errorSpy.mock.calls[0][0]).toContain('The provided hook function is undefined.');

      expect(errorSpy.mock.calls[1][0]).toContain('Problem executing hook function. Moving on.');
      expect((errorSpy.mock.calls[1][1] as Error).message).toEqual('Test Error');

      expect(correctExecutingFunction).toBeCalledWith(payload);
    });
  });
  describe('callExtraHook()', () => {
    it('runs lately added hook function directly with already initialized snap', async () => {
      // Arrange
      const snap = mock<SNAP>();

      const callHook = jest.spyOn(HookService.getInstance(), 'callHook');
      const callExtraHook = jest.spyOn(HookService.getInstance(), 'callExtraHook');

      const handlePreviewInitialized = jest.fn();

      // act
      Ready.snap = snap;
      HookService.getInstance().addHook(EcomHooks.PREVIEW_INITIALIZED, handlePreviewInitialized);

      // assert
      expect(callHook).not.toBeCalled();
      expect(callExtraHook).toBeCalledWith(
        EcomHooks.PREVIEW_INITIALIZED,
        expect.objectContaining({ TPP_BROKER: TPPBroker.getInstance() }),
        handlePreviewInitialized
      );
      expect(Ready.snap).toBe(snap);
    });
  });
});
