export interface SNAPStatus {
  storeType?: string;
  uidType?: string;
  elementType?: string;
  id?: string;
  displayName?: string;
  uid?: string;
  released?: boolean;
  releaseSupported: boolean;
  bookmark: boolean;
  workflows?: any;
  language?: string;
  entityId?: string;
  name: string;
  permissions: {
    see: boolean;
    read: boolean;
    change: boolean;
    delete: boolean;
    appendLeaf: boolean;
    deleteLeaf: boolean;
    release: boolean;
    seeMeta: boolean;
    changeMeta: boolean;
    changePermission: boolean;
  };
  children: any[];
  custom: any;
}

export interface SNAPButton {
  /**
   * Simple labeling, used by the default of {@link getLabel}.
   */
  label: string;

  /**
   * Simple css class definition, used by the default of {@link getIcon}.
   * @optional
   */
  css?: string;

  /**
   * Simple icon url, used by the default of {@link getIcon}.
   * @optional
   */
  icon?: string;

  /**
   * Whether the button is applied to elements specifying no actual, but a component path preview ID prefixed with "#".
   * @optional
   */
  supportsComponentPath?: boolean;

  /**
   * Whether the button is applied to elements that can be edited in-place.
   * @optional
   */
  supportsInedit?: boolean;

  /**
   * Whether this button should be rendered or not; the default is (scope) => true.
   * Be careful with your Promise here: the rendering of <b>all</b> buttons only happens after all Button#isVisible calls. That's why ButtonScope.$button doesn't exist in {@link SNAPButtonScope} this time.
   * @optional
   * @param scope
   */
  isVisible?(scope: SNAPButtonScope): Promise<boolean>;

  /**
   * Whether this button should be enabled or not; the default is (scope) => false
   * @optional
   * @param scope
   */
  isEnabled?(scope: SNAPButtonScope): Promise<boolean>;

  /**
   * Use scope.$button to define the appearance of the button.
   *
   * @example
   * ```javascript
   * // the default callback is defined as:
   * TPP_BROKER.registerButton({
   *   icon = null,
   *   css = null,
   *   getIcon = async ({ $button }) =>
   *     (css !== null && !$button.classList.add(css))
   *     || (icon !== null && ($button.style.backgroundImage = `url(${icon})`))
   *     || $button.classList.add('tpp-icon-action'),
   *   ...
   * });
   * ```
   *
   * @optional
   * @param scope
   */
  getIcon?(scope: SNAPButtonScope): void;

  /**
   * The tooltip ( [title] ) for this button.
   *
   * @example
   * ```javascript
   * // the default callback is defined as:
   * TPP_BROKER.registerButton({
   *   label = '',
   *   getLabel = () => label,
   *   ...
   * });
   * ```
   *
   * @example
   * ```javascript
   * // localize
   * TPP_BROKER.registerButton({
   *   getLabel: ({ language }) => language.toLowerCase() === 'de' ? 'Deutsche Bezeichnung' : 'English Label',
   *   ...
   * });
   * ```
   *
   * @optional
   * @param scope
   */
  getLabel?(scope: SNAPButtonScope): void;

  /**
   * If this is not an empty list, a dropdown will be rendered; the default is (scope) => []
   * An item could be anything, but it needs a property called label, which appears in the dropdown.
   *
   * @optional
   * @param scope
   */
  getItems?(scope: SNAPButtonScope): Array<any>;

  /**
   * Will be called before {@link execute}.
   *
   * @optional
   * @param scope
   * @param item See {@link getItems}
   */
  beforeExecute?(scope: SNAPButtonScope, item: any): void;

  /**
   * Will be called, when the button (or an item) is clicked.
   *
   * @optional
   * @param scope
   * @param item See {@link getItems}
   */
  execute?(scope: SNAPButtonScope, item: any): Promise<void>;

  /**
   * Will be called after {@link execute}.
   *
   * @optional
   * @param scope
   * @param item See {@link getItems}.
   * @param error If an uncaught error appears.
   */
  afterExecute?(scope: SNAPButtonScope, item: any, error?: Error): void;

  _name?: string;
}

export interface SNAPButtonScope {
  /**
   * The DOM node where the decoration appears.
   */
  $node: HTMLElement;

  /**
   * The DOM node of the button (not available in {@link SNAPButton.isVisible}.
   */
  $button: HTMLElement;

  /**
   * The PreviewId
   */
  previewId: string;

  /**
   * The current {@link SNAPStatus} object of PreviewId
   */
  status: SNAPStatus;

  /**
   * The current language.
   */
  language: string;
}

export interface SNAPMoveSectionOptions {
  /**
   * Only relevant if target is a section: move the source section before target section, otherwise it would be moved after.
   */
  before: boolean;

  /**
   * Create a copy of the source section.
   */
  copy: boolean;

  /**
   * If true, the onRerenderView~Handler will not be triggered.
   * <b>Be careful when preventing the change event! The affected PreviewId could appear several times in the DOM!</b>
   */
  skipRerenderEvent: boolean;
}

/**
 * This is a subset of the <a href="https://docs.e-spirit.com/tpp/snap/index.html#tpp_snap" target="_blank">TPP_SNAP</a> implementation.
 * This will be provided via the {@link EcomHooks.PREVIEW_INITIALIZED} hook.
 *
 * @interface SNAPConnect
 */
export interface SNAPConnect {
  execute(identifier: string, params?: object, result?: boolean): Promise<any>;

  getElementStatus(previewId: string): Promise<SNAPStatus>;

  getPreviewElement(): Promise<string>;

  moveSection(source: string, target: string, options?: SNAPMoveSectionOptions): boolean;

  processWorkflow(previewId: string, transition: string): Promise<SNAPStatus>;

  registerButton(button: SNAPButton, index: number): void;

  renderElement(previewId?: string | null): Promise<string | object>;

  showEditDialog(previewId: string): void;

  showMessage(message: string, kind: string, title?: string): void;

  showMetaDataDialog(previewId: string): void;

  showQuestion(message: string, title?: string): Promise<boolean>;

  startWorkflow(previewId: string, workflow: string): Promise<unknown>; // TODO: find correct return value

  overrideDefaultButton(defaultButtonName: string, buttonOverrides: SNAPButton | null): void;
}
