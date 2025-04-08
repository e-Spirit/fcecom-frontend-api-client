import { ReferrerStore } from '../../utils/ReferrerStore';
import { TPPLoader } from './TPPLoader';

describe('TPPLoader', () => {
  describe('TPP loading', () => {
    it('adds a script tag including', async () => {
      // Arrange
      const fsHost = 'http://referer';
      jest.spyOn(ReferrerStore, 'getReferrer').mockReturnValue(fsHost);
      const scriptTagMock = document.createElement('script');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockReturnValue(scriptTagMock);
      // Act
      new TPPLoader().getSnap().then((result) => {});
      // Assert
      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      expect(scriptTagMock.src).toBe(`${fsHost}/fs5webedit/live/live.js`);
      expect(scriptTagMock.onerror).toBeDefined();
      expect(scriptTagMock.onload).toBeDefined();
    });
  });
});
