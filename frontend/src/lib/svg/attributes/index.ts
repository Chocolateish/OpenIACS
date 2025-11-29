export * from "./strokeFill";

export function class_list<T extends SVGElement>(
  elem: T,
  ...className: string[]
): T {
  elem.classList.add(...className);
  return elem;
}
