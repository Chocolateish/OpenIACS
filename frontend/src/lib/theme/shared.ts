import { ThemeEngine } from "./engine";
import type { ThemeVariableGroup } from "./variables";

export let engines: ThemeEngine[] = [];

export let bottomGroups: { [key: string]: ThemeVariableGroup } = {};
