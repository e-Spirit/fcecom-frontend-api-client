import { extractSlotSections, isDefined, isNonNullable, removeNullishObjectProperties } from './helper';
import { FindPageItem } from '../api/Remoteservice.meta';
import { expectedSection } from './helper.spec.data';

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

  describe('isNonNullable()', () => {
    it('throws for null', () => {
      expect(() => {
        // Act
        isNonNullable(null);
        // Assert
      }).toThrow('Non-nullable value was null / undefined');
    });
    it('throws for undefined', () => {
      expect(() => {
        // Act
        isNonNullable(undefined);
        // Assert
      }).toThrow('Non-nullable value was null / undefined');
    });
    it('throws with custom message', () => {
      // Arrange
      const message = 'MESSAGE';
      expect(() => {
        // Act
        isNonNullable(undefined, message);
        // Assert
      }).toThrow(message);
    });
    it('does not throw for valid values', () => {
      // Arrange
      expect(() => {
        // Act
        isNonNullable(123);
        // Assert
      }).not.toThrow();
    });
  });

  describe('isDefined()', () => {
    it('throws for undefined', () => {
      expect(() => {
        // Act
        isDefined(undefined);
        // Assert
      }).toThrow('Value is undefined');
    });
    it('throws with custom message', () => {
      // Arrange
      const message = 'MESSAGE';
      expect(() => {
        // Act
        isDefined(undefined, message);
        // Assert
      }).toThrow(message);
    });
    it('does not throw for valid values', () => {
      // Arrange
      expect(() => {
        // Act
        isDefined(123);
        // Assert
      }).not.toThrow();
    });
  });
});

describe('extractSlotSections()', () => {
  const slotName = 'sup_content';

  it('it returns correct sections array', async () => {
    // Act & Assert
    expect(
      extractSlotSections(
        {
          previewId: 'test-preview-id',
          children: [
            {
              name: slotName,
              children: [expectedSection],
            },
          ],
        } as FindPageItem,
        slotName
      )[0]
    ).toBe(expectedSection);
  });
  it('throws on invalid parameters', async () => {
    // Act & Assert
    await expect(async () => extractSlotSections(undefined as any, slotName)).rejects.toThrow('page missing');
    await expect(async () => extractSlotSections({} as FindPageItem, undefined as any)).rejects.toThrow('SlotName is missing');
  });
});
