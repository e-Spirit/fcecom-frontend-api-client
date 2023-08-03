import { addContentButton } from './addContentElement';

const svgElementMock = document.createElement('SVG');
jest.mock('./addContentElement.module.css', () => 'BASICCSS');
jest.mock('./plusButton.module.svg', () => jest.fn(() => svgElementMock));

describe('addContentElement', () => {
  describe('addContentButton', () => {
    it('returns an element', () => {
      // Arrange
      const params = {
        slotName: 'sub_content',
        handleClick: jest.fn(),
        extraCSS: 'EXTRACSS',
      };
      // Act
      const result = addContentButton(params);
      // Assert
      expect(result).toBeInstanceOf(HTMLElement);
      const shadow = result.shadowRoot;
      expect(shadow).toBeInstanceOf(ShadowRoot);
      expect(shadow?.querySelectorAll<HTMLStyleElement>('style').item(0)?.textContent).toEqual('BASICCSS'); // Regular style
      expect(shadow?.querySelector<HTMLButtonElement>('.fcecom-add-content-button')).toBeInstanceOf(HTMLButtonElement);
      expect(shadow?.querySelector<HTMLButtonElement>('.fcecom-add-content-button')?.getAttribute('type')).toEqual('button');
      const squareIcon = shadow?.querySelector<HTMLDivElement>('.fcecom-add-content-button > .square-icon');
      expect(squareIcon).toBeInstanceOf(HTMLDivElement);
      expect(squareIcon?.innerHTML).toMatch(svgElementMock.innerHTML);
      expect(shadow?.querySelector<HTMLDivElement>('.fcecom-add-content-button > .square-icon')?.ariaHidden).toBe('true');
      expect(shadow?.querySelector<HTMLSpanElement>('.fcecom-add-content-button > span')).toBeInstanceOf(HTMLSpanElement);
      expect(shadow?.querySelector<HTMLDivElement>('.fcecom-add-content-button > span')?.innerText).toEqual('Add content');
      expect(shadow?.querySelectorAll<HTMLStyleElement>('style').item(1)?.textContent).toEqual(params.extraCSS); // Extra CSS
      expect(shadow?.querySelectorAll<HTMLStyleElement>('style').item(1)?.textContent).toEqual(params.extraCSS);
      const clickTarget = shadow?.querySelector<HTMLDivElement>('.fcecom-add-content-button');
      const event = new Event('click');
      clickTarget?.dispatchEvent(event);
      expect(params.handleClick.mock.calls[0][0]).toBe(event);
    });
  });
});
