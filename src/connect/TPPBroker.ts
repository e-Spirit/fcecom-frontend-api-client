import { Ready } from './HookService';
import { SNAPButton, SNAPConnect, SNAPMoveSectionOptions, SNAPStatus } from './TPPBroker.meta';

export class TPPBroker implements SNAPConnect {
  private static instance: TPPBroker;

  public static getInstance(): TPPBroker {
    if (!TPPBroker.instance) TPPBroker.instance = new TPPBroker();
    return TPPBroker.instance;
  }

  /**
   * Executes a project script or an executable.
   * @see See also <a href="https://docs.e-spirit.com/odfs52/dev/de/espirit/firstspirit/webedit/client/api/Common.html#execute-java.lang.String-JavaScriptObject-JavaScriptObject-" target="_blank">WE_API.Common.execute</a>.
   *
   * @example
   *
   * !!! inline tip end "<a href="https://docs.e-spirit.com/odfs/template-develo/contentcreator/functional-scop/index.html#klassen_navigationbearbeit", target="_blank">More information</a>"
   *
   * ```javascript
   * TPP_BROKER.execute('class:EditMenu', { node: 43 })
   *  .then(() => location.reload());
   * ```
   *
   * @param identifier script ("script:script_uid") or executable ("class:full.qualified.executable.ClassName")
   * @param params parameters (e.g. { param1: 42, param2: 'text' })
   * @param result should wait for an result.
   * @returns Promise<any>: the result
   */
  execute(identifier: string, params?: object, result?: boolean): Promise<any> {
    return Ready.snap?.execute(identifier, params, result);
  }

  /**
   * Fetches the {@link SNAPStatus} of the given PreviewId.
   *
   * @since snap 1.2.0
   * @param previewId
   */
  getElementStatus(previewId: string): Promise<SNAPStatus> {
    return Ready.snap?.getElementStatus(previewId);
  }

  /**
   * Returns the PreviewId of the ContentCreator scope.
   *
   * @since snap 1.2.0
   * @returns Promise<string>: the PreviewId
   */
  getPreviewElement(): Promise<string> {
    return Ready.snap?.getPreviewElement();
  }

  /**
   * Move a Section before or after another Section.
   * Triggers SNAP.onRerenderView.
   *
   * @since snap 1.2.4
   * @param source the PreviewId of the source section.
   * @param target the PreviewId of the target section, body or page with a single body.
   * @param options
   * @returns boolean true, if the operation was successful, false otherwise.
   */
  moveSection(source: string, target: string, options?: SNAPMoveSectionOptions): boolean {
    return Ready.snap?.moveSection(source, target, options);
  }

  /**
   * Processes a Workflow transition.
   *
   * @since snap 1.2.0
   * @param previewId The associated PreviewId.
   * @param transition A transition uid, can be found in {@link SNAPStatus}.
   */
  processWorkflow(previewId: string, transition: string): Promise<SNAPStatus> {
    return Ready.snap?.processWorkflow(previewId, transition);
  }

  /**
   * Define a custom button on the element decoration.
   *
   * @example
   * ```javascript
   * // register a debug button, as the first button, on any decorated element
   * TPP_BROKER.registerButton({
   *   css: 'tpp-icon-debug',
   *   execute: async (scope) => console.log(scope),
   * }, 0);
   * ```
   *
   * @since snap 1.2.0
   * @param button
   * @param index The button index, used as rendering order; -1 means at the end.
   */
  registerButton(button: SNAPButton, index: number): void {
    return Ready.snap?.registerButton(button, index);
  }

  /**
   * Renders the given PreviewId.
   *
   * @since snap 1.2.0
   * @param previewId The associated PreviewId; If not set, the StartNode will be rendered.
   * @return Promise<string | object>: The rendering result of the FirstSpirit template; if the result is a JSON, the JSON will automatically be parsed. For FirstSpirit projects based on CaaS v3 the standard FirstSpirit json format is returned.
   */
  renderElement(previewId?: string | null): Promise<string | object> {
    return Ready.snap?.renderElement(previewId);
  }

  /**
   * Opens the "Edit Dialog" of a FirstSpirit StoreElement associated with the PreviewId.
   * Triggers {@link EcomHooks.CONTENT_CHANGED}.
   *
   * @since snap 1.2.0
   * @param previewId The associated PreviewId.
   */
  showEditDialog(previewId: string): void {
    return Ready.snap?.showEditDialog(previewId);
  }

  /**
   * Shows a message in the ContentCreator, either an info or an error dialog.
   *
   * @since snap 1.2.24
   * @param message The message to be displayed.
   * @param kind The type of the message; either "info" or "error".
   * @param title The title of the dialog.
   */
  showMessage(message: string, kind: string, title?: string): void {
    return Ready.snap?.showMessage(message, kind, title);
  }

  /**
   * Opens the Metadata Dialog of an FirstSpirit StoreElement associated with the PreviewId. MetaData providing elements must be allowed in the ContentCreator settings, see {@link https://docs.e-spirit.com/odfs/edocs/admi/firstspirit-ser/project-propert/contentcreator/index.html#text_bild_14 | Content Creator Documentation} .
   * Triggers {@link EcomHooks.CONTENT_CHANGED}
   *
   * @example
   * ```javascript
   * // display the default button
   * TPP_BROKER.overrideDefaultButton('metadata', {
   *   isVisible: ({ status }) => !status.custom && (['PageRef', 'Page', 'Section', 'Media'].includes(status.elementType))
   * })
   * ```
   *
   * @param previewId The associated PreviewId.
   */
  showMetaDataDialog(previewId: string): void {
    return Ready.snap?.showMetaDataDialog(previewId);
  }

  /**
   * Shows a question dialog in the ContentCreator, providing the answers Yes or No.
   *
   * @since snap 1.2.24
   * @param message The question to be displayed.
   * @param title The title of the question dialog.
   */
  showQuestion(message: string, title?: string): Promise<boolean> {
    return Ready.snap?.showQuestion(message, title);
  }

  /**
   * Starts a FirstSpirit Workflow on the given PreviewId.
   *
   * @since snap 1.2.0
   * @param previewId The associated PreviewId.
   * @param workflow A workflow uid, can be found in {@link SNAPStatus}.
   */
  startWorkflow(previewId: string, workflow: string): Promise<unknown> {
    return Ready.snap?.startWorkflow(previewId, workflow);
  }

  /**
   * Triggers onContentChange Handler. Can be used if a Custom Button changes the content.
   *
   * @param previewId The target PreviewId.
   * @param content The updated content, if null renderElement is called.
   */
  triggerChange(previewId: string, content: string | object): void {
    return Ready.snap?.triggerChange(previewId, content);
  }
}
