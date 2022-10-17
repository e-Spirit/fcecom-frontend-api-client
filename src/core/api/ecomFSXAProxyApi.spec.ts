import { mock } from 'jest-mock-extended';
import { SNAP, TPPWrapperInterface } from '../integrations/tpp/TPPWrapper.meta';
import { EcomFSXAProxyApi } from './ecomFSXAProxyApi';
import { TPPLoader } from '../integrations/tpp/TPPLoader';
import { TPPWrapper } from '../integrations/tpp/TPPWrapper';
import { productFilterQuery } from './ecomFSXAProxyApi.spec.data';

const tppLoader = new TPPLoader();
const snap = mock<SNAP>();

jest.spyOn(tppLoader, 'getSnap').mockResolvedValue(snap);
jest.spyOn(TPPWrapper, 'createTPPLoader').mockReturnValue(tppLoader);

const tppWrapper = new TPPWrapper();
class TestableEcomFSXAProxyApi extends EcomFSXAProxyApi {
  public test_setTPPWrapper(tppWrapper: TPPWrapperInterface): void {
    this.setTPPWrapper(tppWrapper);
  }
}

const proxyApi = new TestableEcomFSXAProxyApi('http://localhost:3001/api');
proxyApi.test_setTPPWrapper(tppWrapper);

describe('test ecom FSXA API should work as expected', () => {
  it('it should say hello to the world', async () => {
    // arrange
    const spy = jest.spyOn(tppWrapper, 'logIAmAlive').mockImplementation(jest.fn());

    // act
    await proxyApi.logIAmAlive();

    // assert
    expect(spy).toHaveBeenCalledTimes(1);
  });

  // it('it should create a product page', async () => {
  //   // arrange
  //   const spy = jest.spyOn(tppWrapper, 'createPage').mockImplementation(jest.fn());

  //   // act
  //   await proxyApi.createProductPage('teeter3CREOSOTE*essay', 'product');

  //   // assert
  //   expect(spy).toHaveBeenNthCalledWith(1, {
  //     fsPageTemplate: 'product',
  //     id: 'teeter3CREOSOTE*essay',
  //     type: 'product'
  //   });
  // });

  // it('it should create a category page', async () => {
  //   // arrange
  //   const spy = jest.spyOn(tppWrapper, 'createPage').mockImplementation(jest.fn());

  //   // act
  //   await proxyApi.createCategoryPage('plumber0PIERRE*porch', 'category');

  //   // assert
  //   expect(spy).toHaveBeenNthCalledWith(1, {
  //     fsPageTemplate: 'category',
  //     id: 'plumber0PIERRE*porch',
  //     type: 'category'
  //   });
  // });

  it('it should create a page', async () => {
    // arrange
    const snap = mock<SNAP>();

    // @ts-ignore - TODO: Make properly test possible
    tppWrapper.TPP_SNAP = Promise.resolve(snap);
    const spy = jest.spyOn(snap, 'execute').mockResolvedValue(snap);

    // act
    await proxyApi.createPage({
      fsPageTemplate: 'product',
      id: 'testUid',
      type: 'product',
      displayNames: {
        en: 'Display Name EN',
        de: 'Display Name DE',
      },
    });

    // assert
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
    // arrange
    const snap = mock<SNAP>();

    // @ts-ignore - TODO: Make properly test possible
    tppWrapper.TPP_SNAP = Promise.resolve(snap);
    const spy = jest.spyOn(snap, 'execute').mockRejectedValueOnce(new Error());

    // act
    await proxyApi.createPage({
      fsPageTemplate: 'product',
      id: 'testUid',
      type: 'product',
      displayNames: {
        en: 'Display Name EN',
        de: 'Display Name DE',
      },
    });

    // assert
    expect(snap.execute).toHaveBeenNthCalledWith(1, 'class:FirstSpirit Connect for Commerce - Create Reference Page', {
      fsPageTemplate: 'product',
      id: 'testUid',
      type: 'product',
      displayNames: {
        en: 'Display Name EN',
        de: 'Display Name DE',
      },
    });

    expect(snap.execute).toHaveBeenNthCalledWith(2, 'script:show_error_message_dialog', {
      message: `Error`,
      title: 'Could not create page',
      ok: false,
    });
  });

  it('it should find a product page', async () => {
    // arrange
    const spy = jest.spyOn(proxyApi, 'fetchByFilter').mockImplementation(jest.fn());

    // act
    await proxyApi.findPage({
      id: 'plumber0PIERRE*porch',
      locale: 'de',
      type: 'product',
    });

    // assert
    expect(spy).toHaveBeenNthCalledWith(1, productFilterQuery);
  });

  it('it should apply default locale correctly', async () => {
    // arrange
    const locale = 'de_DE';

    // act
    proxyApi.setDefaultLocale(locale);

    // assert
    expect(proxyApi.defaultLocale).toBe(locale);
  });
});
