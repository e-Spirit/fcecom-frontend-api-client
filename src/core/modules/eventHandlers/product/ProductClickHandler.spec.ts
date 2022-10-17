import { EcomFSXAProxyApi } from '../../../api/ecomFSXAProxyApi';
import { ProductClickHandler, rejectionCause } from './ProductClickHandler';
import {
  correctPayload,
  withDifferentTopic,
  withIncorrectTemplateReplacement,
  withIncorrectUrlFormat,
  withoutNamespace,
  withoutTopic,
  withoutUrl,
} from './ProductClickHandler.spec.data';

const proxyApi = new EcomFSXAProxyApi('http://localhost:3001/api').setDefaultLocale('de_DE');

describe('test product click event gets handled correctly', () => {
  it('it should handle window events', async () => {
    // arrange
    const productClickHandler = new ProductClickHandler(proxyApi);
    const spy = jest.spyOn(productClickHandler, 'processMessageEvent');

    // act
    productClickHandler.enable();
    window.dispatchEvent(new MessageEvent('message', { data: correctPayload }));
    window.dispatchEvent(new MessageEvent('message', { data: correctPayload }));

    // assert
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('it should run normally if input payload is correct', async () => {
    // arrange
    const productClickHandler = new ProductClickHandler(proxyApi);
    productClickHandler.handle = jest.fn();

    // act
    await productClickHandler.processMessageEvent(correctPayload);

    // assert
    expect(productClickHandler.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          fcecom: {
            topic: 'openStoreFrontUrl',
            payload: {
              url: expect.any(String),
              type: expect.any(String),
              identifier: expect.any(String),
              name: expect.any(String),
            },
          },
        },
      })
    );
  });

  it('it should reject execution if input payload misses namespace', async () => {
    // arrange
    const productClickHandler = new ProductClickHandler(proxyApi);
    productClickHandler.handle = jest.fn();

    try {
      // act
      await productClickHandler.bouncer(withoutNamespace);

      expect(true).toBe(false);
    } catch (error: any) {
      // assert
      expect(error).toBe(rejectionCause.NAMESPACE_NOT_FOUND);
    }

    await productClickHandler.processMessageEvent(withoutNamespace);
    expect(productClickHandler.handle).toBeCalledTimes(0);
  });

  it('it should reject execution if input payload misses topic', async () => {
    // arrange
    const productClickHandler = new ProductClickHandler(proxyApi);
    productClickHandler.handle = jest.fn();

    try {
      // act
      await productClickHandler.bouncer(withoutTopic);

      expect(true).toBe(false);
    } catch (error: any) {
      // assert
      expect(error).toBe(rejectionCause.TOPIC_NOT_MATCHING);
    }

    await productClickHandler.processMessageEvent(withoutTopic);
    expect(productClickHandler.handle).toBeCalledTimes(0);
  });

  it('it should reject execution if input payload contains different topic', async () => {
    // arrange
    const productClickHandler = new ProductClickHandler(proxyApi);
    productClickHandler.handle = jest.fn();

    try {
      // act
      await productClickHandler.bouncer(withDifferentTopic);

      expect(true).toBe(false);
    } catch (error: any) {
      // assert
      expect(error).toBe(rejectionCause.TOPIC_NOT_MATCHING);
    }

    await productClickHandler.processMessageEvent(withDifferentTopic);
    expect(productClickHandler.handle).toBeCalledTimes(0);
  });

  it('it should reject execution if input payload misses url', async () => {
    // arrange
    const productClickHandler = new ProductClickHandler(proxyApi);
    productClickHandler.handle = jest.fn();

    try {
      // act
      await productClickHandler.bouncer(withoutUrl);

      expect(true).toBe(false);
    } catch (error: any) {
      // assert
      expect(error).toBe(rejectionCause.URL_NOT_FOUND);
    }

    await productClickHandler.processMessageEvent(withoutUrl);
    expect(productClickHandler.handle).toBeCalledTimes(0);
  });

  it('it should reject execution if input payload contains corrupt url', async () => {
    // arrange
    const productClickHandler = new ProductClickHandler(proxyApi);
    productClickHandler.handle = jest.fn();

    try {
      // act
      await productClickHandler.bouncer(withIncorrectUrlFormat);

      expect(true).toBe(false);
    } catch (error: any) {
      // assert
      expect(error).toBe(rejectionCause.URL_FORMAT_ERROR);
    }

    await productClickHandler.processMessageEvent(withIncorrectUrlFormat);
    expect(productClickHandler.handle).toBeCalledTimes(0);
  });

  it('it should reject execution if input payload contains url without correct template replacement', async () => {
    // arrange
    const productClickHandler = new ProductClickHandler(proxyApi);
    productClickHandler.handle = jest.fn();

    try {
      // act
      await productClickHandler.bouncer(withIncorrectTemplateReplacement);

      expect(true).toBe(false);
    } catch (error: any) {
      // assert
      expect(error).toBe(rejectionCause.URL_MISSING_TEMPLATE_REPLACEMENT);
    }

    await productClickHandler.processMessageEvent(withIncorrectTemplateReplacement);
    expect(productClickHandler.handle).toBeCalledTimes(0);
  });
});
