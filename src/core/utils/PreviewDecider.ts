export class PreviewDecider {
 /**
  * Checks if the code is executed in the Browser or on the Server Side (needed to differentiate between SSR and CSR execution)
  */
 static isBrowserEnvironment() {
  return typeof self !== 'undefined';
 }

 /**
  * Checks if the Preview Scripts should be loaded based on the Document referrer
  * (Document referrer Points to the server that is implementing the application as iframe,
  * if the application is not executed in an iframe the referrer is an empty string)
  */
 static isPreviewNeeded() {
  return PreviewDecider.isBrowserEnvironment() && window.document.referrer === 'https://localhost.e-spirit.live/' // TODO: make referrer configurable.
 }
}