import hookService from './HookService';

describe('HookService', () => {
  it('should call registered Hooks', () => {
    const testMethod = jest.fn();

    hookService.addHook('test', undefined, testMethod);
    hookService.callHook('test');

    expect(testMethod).toBeCalledTimes(1);
  });
  it('should call registered Hooks with scope', () => {
    const objectWithScopedMethod = {
      testMethod: jest.fn(),
      scopedMethod: function () {
        this.testMethod();
      },
    };

    hookService.addHook('test', objectWithScopedMethod, objectWithScopedMethod.scopedMethod);
    hookService.callHook('test');

    expect(objectWithScopedMethod.testMethod).toBeCalledTimes(1);
  });
});
