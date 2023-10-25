## [0.13.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.12.1...v0.13.0) (2023-10-06)

### Changes
* `SECTION_CREATED` hook is now called when a sibling section is created via the 'Add Section' button in the ContentCreator frame.
* Added new interface for custom code to access internal APIs.
* Added internal APIs to significantly extend the functionality of the Frontend API.

### UPDATE NOTICE
* In order to use the internal APIs, the hook `PREVIEW_INITIALIZED` must be implemented. This provides a `TPP_BROKER` object. The corresponding instructions can be found in the documentation in the chapter ["Extensibility"](https://docs.e-spirit.com/ecom/fsconnect-com-api/fsconnect-com-frontend-api/latest/showcase/) and in the [Client](https://docs.e-spirit.com/ecom/fsconnect-com-api/fsconnect-com-frontend-api/0.13.0/typedoc-with-title/client/) Reference.
* When adding a sibling section via the 'Add Section' button in the ContentCreator frame, now instead of `CONTENT_CHANGED`, the `SECTION_CREATED` hook is called. Therefore the payload was extended:

```ts
export type CreateSectionHookPayload = {
  /**
   * Preview ID of page in FirstSpirit.
   */
  pageId: string;
  /**
   * Name of slot where the section should be created into as defined in the FirstSpirit template.
   */
  slotName: string;
  /**
   * Identifier of the section.
   */
  identifier: string;
  /**
   * If not the first section in the slot, the sibling of the newly created section.
   */
  siblingPreviewId?: string;
  /**
   * The data of the created section.
   */
  sectionData: any;
};
```

## [0.12.1](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.12.0...v0.12.1) (2023-09-08)

### Changes
* Increased test coverage.
* External links in API documentation are now opened in a new browser tab.


Information on previous releases can be found in the [Release Notes](https://docs.e-spirit.com/ecom/fsconnect-com/FirstSpirit_Connect_for_Commerce_Releasenotes_EN.html).
