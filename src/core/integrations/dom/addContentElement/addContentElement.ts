import { AddContentButtonParams } from './addContentElement.meta';

import css from './addContentElement.module.css';
import plusSVG from './plusButton.module.svg';
import { Verbosity } from '../../../utils/debugging/verbosity';

/**
 * Creates the HTML for the "Add content" button.
 *
 * @param param Parameters to create the button with.
 * @returns
 */
export const addContentButton = ({ slotName, handleClick, extraCSS }: AddContentButtonParams): HTMLElement => {
  const addStyle = (style: string) => {
    const styleElement = document.createElement('style');
    styleElement.textContent = style;
    shadow.appendChild(styleElement);
  };

  const frame = document.createElement('div');
  frame.classList.add('fcecom-add-content-button-wrapper');
  const shadow = frame.attachShadow({ mode: 'open' });

  addStyle(css);
  if (extraCSS) addStyle(extraCSS);

  const buttonContainer = document.createElement('button');
  buttonContainer.setAttribute('type', 'button');
  shadow.appendChild(buttonContainer);
  buttonContainer.classList.add('fcecom-add-content-button');
  buttonContainer.addEventListener('click', handleClick);
  // <div class="themed-grid-col"/>

  const buttonIcon = document.createElement('div');
  buttonContainer.appendChild(buttonIcon);
  buttonIcon.classList.add('square-icon');
  buttonIcon.ariaHidden = 'true';

  if (Verbosity.debugMode()) {
    const slotNameElement = document.createElement('span');
    buttonContainer.prepend(slotNameElement);
    slotNameElement.style.paddingBottom = '10px';
    slotNameElement.innerText = `Slot "${slotName}"`;
  }

  const svgTemplate = document.createElement('template');
  svgTemplate.innerHTML = plusSVG;
  buttonIcon.appendChild(svgTemplate.content);
  // <div class="square-icon"><svg>...</svg></div>

  const buttonTitle = document.createElement('span');
  buttonContainer.appendChild(buttonTitle);
  buttonTitle.innerText = 'Add content';

  return frame;
};
