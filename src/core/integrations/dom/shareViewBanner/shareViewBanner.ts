/**
 * @internal
 *
 */

import Swal, { SweetAlertResult } from 'sweetalert2';
import { HookService } from '../../../../connect/HookService';
import { EcomHooks } from '../../../../connect/HookService.meta';
import { onTop } from '../domUtils';

const shareViewTokenKey = 'ecom:share:token';

/**
 * This banner is added to the website in case the backend marks a page as shared.
 * A shared page accesses preview content from CaaS even without being in ContentCreator Preview.
 */
export namespace ShareViewBanner {
  let shadowHost: HTMLElement;
  let shadowRoot: ShadowRoot;

  export let isInPreview: boolean = false;

  /**
   * Prevent banner to show up, e.g. in ContentCreator Preview/
   */
  export const disable = () => {
    isInPreview = true;
    endShareView();
  };

  /**
   * Show banner.
   */
  export const spawnBanner = () => {
    removeShareViewBanner();

    if (isInPreview) return;

    // Create the host element
    shadowHost = document.createElement('div');
    shadowHost.setAttribute('id', 'shareViewBanner');
    document.body.prepend(shadowHost);

    // Attach Shadow DOM
    shadowRoot = shadowHost.attachShadow({ mode: 'closed' });

    // Insert content
    createBanner();
  };

  const createBanner = () => {
    // Styles for the banner
    // language=CSS
    const style = `
        :host {
            all: initial;
            font-family: 'Arial', sans-serif;
        }

        .banner {
            position: relative;
            top: 0;
            left: 0;
            background-color: #f4f4f9; /* dezentes, helles Grau */
            border-bottom: 2px solid #0056b3; /* Blau, das zur Doku-Seite passt */
            color: #333; /* Dunkles Grau für Text */
            text-align: center;
            padding: 15px 20px;
            z-index: ${onTop(5)};
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .banner-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .banner-text {
            font-size: 1rem;
            font-weight: 500;
        }

        .banner button {
            background-color: #0056b3;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 20px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .banner button:hover {
            background-color: #004494;
        }
    `;

    // HTML content for the banner
    const html = `
      <div class="banner">
        <div class="banner-content">
          <div class="banner-text">This version is a <strong>preview</strong>.</div>
          <button id="endShareViewButton">Close Preview</button>
        </div>
      </div>
    `;

    // Insert style and content into the Shadow DOM
    const styleElement = document.createElement('style');
    styleElement.textContent = style;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    // Style for SweetAlert2
    const swalStyleElement = document.createElement('style');
    // language=CSS
    swalStyleElement.textContent = `
        .fcecom-swal-container {
            z-index: ${onTop(10)};
            padding-top: 4em;
        }
    `;
    document.head.appendChild(swalStyleElement);

    shadowRoot.appendChild(styleElement);
    shadowRoot.appendChild(wrapper);

    // Event listener for the button
    const button = shadowRoot.querySelector('#endShareViewButton') as HTMLButtonElement;
    button.addEventListener('click', () => {
      Swal.fire({
        title: 'End Preview?',
        text: 'A new preview session can be created with a new link, but this session will be deactivated.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0073e6',
        cancelButtonColor: '#555555',
        confirmButtonText: 'Yes, end it!',
        customClass: {
          container: 'fcecom-swal-container',
        },
      }).then(async (result: SweetAlertResult) => {
        if (result.isConfirmed) {
          const undo = endShareView();

          await Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'warning',
            html: `
              Preview mode has been ended.<br/>
              <strong>
                  <a id="undoPreviewClose" href="#">Undo</a>
              </strong>
            `,
            showConfirmButton: false,
            timer: 6000,
            timerProgressBar: true,
            customClass: {
              container: 'fcecom-swal-container',
            },
            didOpen: (toast) => {
              // Add the event listener for the link
              const link = toast.querySelector('#undoPreviewClose');
              if (link) {
                link.addEventListener('click', (event) => {
                  event.preventDefault(); // Prevents the default behavior of the link
                  Swal.close();
                  undo();
                });
              }

              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
          });
        }
      });
    });
  };

  type UndoHandler = () => boolean;

  /**
   * On specific request, clear all ShareView information and remove the banner.
   */
  const endShareView = (): UndoHandler => {
    const token = localStorage.getItem(shareViewTokenKey);

    ShareViewBanner.removeShareViewBanner();
    localStorage.removeItem(shareViewTokenKey);
    // Notify Storefront that the ShareView mode was ended
    HookService.getInstance().callHook(EcomHooks.END_SHARED_PREVIEW, {});
    console.log('ShareView mode ended.');

    // undo
    return () => {
      if (!token) return false;

      localStorage.setItem(shareViewTokenKey, token);
      HookService.getInstance().callHook(EcomHooks.START_SHARED_PREVIEW, {});

      return true;
    };
  };

  /**
   * Remove the banner, e.g. for a release page or when ShareView is ended.
   */
  export const removeShareViewBanner = () => {
    document.querySelectorAll('#shareViewBanner').forEach((element) => element.remove());
  };
}
