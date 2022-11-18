import { removeNullishObjectProperties } from './helper';

describe('helper', () => {
  describe('removeEmptyObjectProperties()', () => {
    it('removes undefined and null properties', () => {
      // Arrange
      const obj = {
        undefinedProperty: undefined,
        nullProperty: null,
        stringProperty: 'STRING',
      };
      // Act
      const result = removeNullishObjectProperties(obj as any);
      // Assert
      expect(result).toBe(obj);
      expect(Object.prototype.hasOwnProperty.call(result, 'undefinedProperty')).toEqual(false);
      expect(Object.prototype.hasOwnProperty.call(result, 'nullProperty')).toEqual(false);
      expect(result.stringProperty).toEqual('STRING');
    });
    it('leaves empty string properties', () => {
      // Arrange
      const obj = {
        emptyProperty: '',
        stringProperty: 'STRING',
      };
      // Act
      const result = removeNullishObjectProperties(obj as any);
      // Assert
      expect(result).toBe(obj);
      expect(result.emptyProperty).toEqual('');
      expect(result.stringProperty).toEqual('STRING');
    });
  });
});
