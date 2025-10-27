export * from "./document";
export * from "./settings";

export function nodeClone<T extends Node>(node: T): T {
  return node.cloneNode(true) as T;
}
