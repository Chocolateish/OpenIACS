export * from "./strokeFill";

export function classList<T extends SVGElement>(
  elem: T,
  ...className: string[]
): T {
  elem.classList.add(...className);
  return elem;
}
