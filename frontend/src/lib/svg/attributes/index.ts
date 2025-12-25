export * from "./strokeFill";

export function class_list<T extends SVGElement>(
  elem: T,
  ...class_name: string[]
): T {
  elem.classList.add(...class_name);
  return elem;
}
