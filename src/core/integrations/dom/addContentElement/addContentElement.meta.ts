export type AddContentButtonParams = {
  /**
   * To display the slotName inside the addContentButton in debug mode,
   * it is passed as a parameter
   */
  slotName: string;
  /**
   * Click event handler to attach to the button.
   *
   */
  handleClick: (event: MouseEvent) => void;
  /**
   * Additional CSS to apply to the button.
   *
   */
  extraCSS?: string;
};
