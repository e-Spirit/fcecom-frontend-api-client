import { ReferrerStore } from '../../utils/ReferrerStore';
import { Ready } from '../../../connect/HookService';
import { fireEvent } from '@testing-library/react';
import { TPPLoader } from './TPPLoader';

describe('TPPLoader', () => {
  describe('postMessage origin validation', () => {
    it('it should not run events on wrong postMessage origin', () => {
      // Arrange
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const getReferrerSpy = jest.spyOn(ReferrerStore, 'getReferrer');

      Ready.allowedMessageOrigin = 'http://example.com';

      // Act
      const messageEvent = new MessageEvent('message', {
        data: {
          tpp: {
            _response: {
              version: 'v3',
            },
          },
        },
        origin: 'http://whatever.com',
      });

      fireEvent(window, messageEvent);

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(0);
      expect(getReferrerSpy).toHaveBeenCalledTimes(0);
    });
    it('it should run events on correct postMessage origin', async () => {
      // Arrange
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const getReferrerSpy = jest.spyOn(ReferrerStore, 'getReferrer');

      Ready.allowedMessageOrigin = 'http://example.com';

      // Act
      new TPPLoader().getSnap().then((result) => {});

      const messageEvent = new MessageEvent('message', {
        data: {
          tpp: {
            _response: {
              version: 'v3',
            },
          },
        },
        origin: 'http://example.com',
      });

      fireEvent(window, messageEvent);

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(getReferrerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
