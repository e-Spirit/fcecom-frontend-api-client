## [1.2.1](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v1.2.0...v1.2.1) (2024-10-16)

### Changes
* Fixed security vulnerabilities by updating the relevant dependencies.

## [1.2.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v1.1.0...v1.2.0) (2024-10-09)

### Changes
* Added the ability to fetch project properties directly through the Frontend API.

## [1.1.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v1.0.1...v1.1.0) (2024-07-10)

### Changes
* Updated version number to be consistent with server package.

## [1.0.1](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v1.0.0...v1.0.1) (2024-06-05)

### Changes
* Updated version number to be consistent with server package.

## [1.0.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.25.0...v1.0.0) (2024-05-17)

### Changes
* Frontend API is now generally available.

### UPDATE NOTICE
Version 1.0.0 of the Frontend API uses the new 3.0 release candidate of the OCM API which is integrated in the ContentCreator.

This *requires* the following changes to your project if they have not already been made when updating to version 0.23.0:

1. Adding the [PreviewRenderingPlugin](https://docs.e-spirit.com/module/caas-connect/CaaS_Connect_Releasenotes_EN.html#version-3-41-0-17-11-2023)
2. Disable `Preview: Create Section` in the `CXT ContentCreator: Feature Configuration Project App`.

## [0.25.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.24.0...v0.25.0) (2024-03-22)

### Changes
* Updated documentation on the hooks CONTENT_CHANGED and SECTION_CREATED payloads.

## [0.24.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.23.0...v0.24.0) (2024-02-12)

### Changes
* Updated version number to be consistent with server package.

## [0.23.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.22.0...v0.23.0) (2024-01-30)

### Changes
* Switch to version 3.0 release candidate of the OCM API.
* Updated getting started of API documentation.

### UPDATE NOTICE
Instead of using the OCM API provided by the _FirstSpirit ThirdPartyPreview Module_ we now use the new 3.0 release candidate of the OCM API which is integrated in the ContentCreator.

This *requires* the following changes to your project:

1. Adding the [PreviewRenderingPlugin](https://docs.e-spirit.com/module/caas-connect/CaaS_Connect_Releasenotes_EN.html#version-3-41-0-17-11-2023)
2. Disable `Preview: Create Section` in the `CXT ContentCreator: Feature Configuration Project App`.

## [0.22.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.20.0...v0.22.0) (2024-01-22)

### Changes
* Updated version number to be consistent with server package.

## [0.20.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.19.0...v0.20.0) (2023-12-21)

### Changes
* The origin of received postMessage events is now checked

## [0.19.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.18.0...v0.19.0) (2023-12-20)

### Changes
* No changes or updates in this release.

## [0.18.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.17.0...v0.18.0) (2023-12-01)

### Changes
* Created method `setPage()`, replacing `setElement()` to add enhanced functionality like providing fetched pages directly and creating missing pages on demand.

## [0.17.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.16.0...v0.17.0) (2023-11-27)

### Changes
* Fixed a bug where the name of the slot could not be resolved during the creation of a sibling section.
* The unused name parameter for some OpenStorefrontUrl types was removed to unify the behavior between different triggers.

## [0.16.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.15.0...v0.16.0) (2023-11-16)

### Changes
* Moved the array access for `findPage()` from the client to the server package.
* Improved mapping of store languages to FirstSpirit languages.
* Updated information about language attributes in API documentation.

### UPDATE NOTICE
* For single element access in `findPage()`, we moved the array access to the Server package to support server side rendering. As by definition `findPage()` can only find one item, `findPage()` now returns a single FindPageItem instead of an Array with one FindPageItem.

## [0.15.0](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.13.1...v0.15.0) (2023-11-02)

### Changes
* Added the `triggerChange` function to the TPP_BROKER object.

## [0.13.1](https://github.com/e-Spirit/fcecom-frontend-api-client/compare/v0.13.0...v0.13.1) (2023-10-25)

### Changes
* Fixed a bug in the static.js file that resulted in missing display names for reference pages.

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
