/*** Gets the current cursor position (offset) within the contenteditable element.
 * @param element The contenteditable HTML element.
 * @returns The offset number, or -1 if the element is not focused or no selection exists.*/
export function get_cursor_position(element: HTMLElement): number {
  const selection = window.getSelection();
  if (
    selection &&
    selection.rangeCount > 0 &&
    element.contains(selection.anchorNode)
  ) {
    const range = selection.getRangeAt(0);
    if (range.collapsed) return selection.anchorOffset;
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  }
  return -1;
}

/** Sets the cursor position (caret) inside the contenteditable element based on a character offset.
 * @param element The contenteditable HTML element.
 * @param offset The character offset from the beginning of the element's text content.*/
export function set_cursor_position(
  element: HTMLElement,
  offset: number
): void {
  const selection = window.getSelection();
  let chars = 0;
  const setCaret = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeLength = node.textContent?.length ?? 0;
      if (chars + nodeLength >= offset) {
        const localOffset = offset - chars;
        const range = document.createRange();
        range.setStart(node, localOffset);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
        element.focus();
        return true;
      }
      chars += nodeLength;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (setCaret(node.childNodes[i])) {
          return true;
        }
      }
    }
    return false;
  };
  setCaret(element);
}

/**Sets the cursor (caret) position at the very end of the contenteditable element.
 * @param element The contenteditable HTML element.*/
export function set_cursor_end(element: HTMLElement): void {
  element.focus();
  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/** Selects all content (text and elements) within the contenteditable element.
 * @param element The contenteditable HTML element.*/
export function set_selection_all(element: HTMLElement): void {
  element.focus();
  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
