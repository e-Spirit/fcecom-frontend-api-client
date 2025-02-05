/**
 * Gets all elements on a page to view the element with the highest z-index value.
 * Then adds the amount of {plus} (default 10 if not set) and returns this value.
 *
 * This function is needed for elements that need to be shown above all other content
 *  on the page and where styling supported by a Shadow DOM is not available.
 *
 * The Frontend API Client cannot guarantee the CSS of the Storefront, so it has to be a
 *  dynamic approach.
 *
 * @param plus Amount which should be added to the highest z-index value.
 */
export const onTop = (plus: number = 10) => {
  const zIndexes: number[] = [];
  const allElements: Element[] = Array.from(document.querySelectorAll('*'));

  const collectZIndexes = (elements: Element[]) => {
    for (const element of elements) {
      const zIndex = window.getComputedStyle(element, null).getPropertyValue('z-index');

      if (zIndex === undefined) continue;
      else if (zIndex === null) continue;
      else if (zIndex === 'auto') continue;
      else if (isNaN(Number(zIndex))) continue;
      else zIndexes.push(Number(zIndex));
    }
  };

  collectZIndexes(allElements);

  const shadowRoots = allElements.filter((el) => el.shadowRoot);

  for (const root of shadowRoots) {
    if (root.shadowRoot === null) {
      continue;
    }

    collectZIndexes(Array.from(root.shadowRoot.querySelectorAll('*')));
  }

  const highestZIndex = zIndexes.length === 0 ? 0 : Math.max(...zIndexes);

  return highestZIndex + plus;
};
