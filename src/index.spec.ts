import { enableFetchMocks } from 'jest-fetch-mock';
import { EcomFSXAProxyApi } from './core/api/ecomFSXAProxyApi';
import { initProductHandlers } from './core/modules/eventHandlers/EventHandler';
import { addHook, initEventHandlers } from '.';
import hookService from './core/utils/HookService';

jest.mock('./core/modules/eventHandlers/EventHandler', () => {
  const originalModule = jest.requireActual('./core/modules/eventHandlers/EventHandler');
  return {
    ...originalModule,
    initProductHandlers: jest.fn().mockResolvedValue([]),
  };
});
jest.mock('./core/utils/HookService', () => {
  const originalModule = jest.requireActual('./core/utils/HookService');
  return {
    ...originalModule,
    addHook: jest.fn(),
  };
});

enableFetchMocks();

const baseUrl = 'http://localhost:3001/ecom';
const proxyApi = new EcomFSXAProxyApi(baseUrl);

describe('index', () => {
  describe('initEventHandlers', () => {
    it('should call the specific event Handlers', () => {
      const testRegexpMap = { productUrlPattern: /./ };

      initEventHandlers(proxyApi, testRegexpMap);

      expect(initProductHandlers).toBeCalledWith(proxyApi, testRegexpMap.productUrlPattern);
    });
  });
  describe('addHook', () => {
    it('should return correct base url', () => {
      const testName = 'testName';
      const testScope = 'testScope';
      const testFunction = () => {};

      addHook(testName, testScope, testFunction);

      expect(hookService.addHook).toBeCalledWith(testName, testScope, testFunction);
    });
  });
});
