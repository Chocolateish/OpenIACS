/**Attaches click listener to element
 * @param  func function to run on click
 * @returns  the generated function, which can be used to dettach the click listener*/
export function attachClickListener(
  element: HTMLElement | SVGElement,
  func: (event: PointerEvent) => void
) {
  let pointDown = (ev: PointerEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    let pointUp = (eve: PointerEvent) => {
      if (ev.pointerId == eve.pointerId) {
        eve.preventDefault();
        eve.stopPropagation();
        element.removeEventListener("pointerup", pointUp as any);
        element.removeEventListener("pointerleave", pointLeave as any);
        func(eve);
      }
    };
    let pointLeave = (eve: PointerEvent) => {
      if (ev.pointerId == eve.pointerId) {
        eve.preventDefault();
        eve.stopPropagation();
        element.removeEventListener("pointerup", pointUp as any);
        element.removeEventListener("pointerleave", pointLeave as any);
      }
    };
    element.addEventListener("pointerup", pointUp as any);
    element.addEventListener("pointerleave", pointLeave as any);
  };
  element.addEventListener("pointerdown", pointDown as any);
  return pointDown;
}

/**Dettaches the click listener*/
export let dettachClickListener = (element: HTMLElement, func: () => void) => {
  element.removeEventListener("pointerdown", func);
};
