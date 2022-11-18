import { TPPWrapper } from './TPPWrapper';
import { SNAP } from './TPPWrapper.meta';
import { TPPLoader } from './TPPLoader';
import { mock } from 'jest-mock-extended';

describe('TPPWrapper', () => {
  describe('constructor', () => {
    it('it should initialize with no arguments provided', async () => {
      // act + arrange
      const tppLoader = new TPPLoader();
      const snap = mock<SNAP>();

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

      jest.spyOn(tppLoader, 'getSnap').mockResolvedValue(snap);
      const tppWrapper = new TPPWrapper({ tppLoader });

      // act
      await tppWrapper.logIAmAlive();

      // assert
      expect(snap.onInit).toHaveBeenCalledTimes(1);
    });
  });
});
