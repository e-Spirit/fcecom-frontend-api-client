import { mock } from 'jest-mock-extended';
import { HookService } from './HookService';
import { EcomHooks } from './HookService.meta';

describe('HookService.getInstance()', () => {
  describe('callHook()', () => {
    it('calls registered Hooks', () => {
      // Arrange
      const testMethod = jest.fn();
      const payload = { 
        content: 'CONTENT',
        node: mock<HTMLElement>(),
        previewId: 'PREVIEWID'
      };
      HookService.getInstance().addHook(EcomHooks.CONTENT_CHANGE, testMethod);
      // Act
      HookService.getInstance().callHook(EcomHooks.CONTENT_CHANGE, payload);
      // Assert
      expect(testMethod).toBeCalledWith(payload);
    });
    it('does not fail if no hook is set for the given type', () => {
      // Arrange
      const payload = { 
        content: 'CONTENT',
        node: mock<HTMLElement>(),
        previewId: 'PREVIEWID'
      };
      expect(() => {
        // Act
        HookService.getInstance().callHook(EcomHooks.CONTENT_CHANGE, payload);
        // Assert
      }).not.toThrow();
    });
  });
});
