import { themeEngine } from "./engine";
import { Themes } from "./settings";
import { bottomGroups } from "./shared";

let nameTransformer: ((name: string) => string) | undefined;
export let themeSetNameTransform = (transform: (name: string) => string) => {
  nameTransformer = transform;
};

/**Initialises the settings for the package
 * @param packageName use import {name} from "../package.json"
 * @param name name of group formatted for user reading
 * @param description a description of what the setting group is about*/
export let themeInitVariableRoot = (
  packageName: string,
  name: string,
  description: string
) => {
  if (packageName.includes("-"))
    throw new Error("Dash not permitted in package name " + packageName);
  if (nameTransformer) packageName = nameTransformer(packageName);
  bottomGroups[packageName] = new ThemeVariableGroup(
    packageName,
    name,
    description
  );
  return bottomGroups[packageName];
};

/**Group of settings should never be instantiated manually use initSettings*/
export class ThemeVariableGroup {
  private pathID: string;
  private variables: {
    [key: string]: {
      name: string;
      desc: string;
      vars: { [key: string]: string };
      type: keyof VariableType;
      typeParams: VariableType[keyof VariableType];
      example?: () => Element;
    };
  } = {};
  private subGroups: { [key: string]: ThemeVariableGroup } = {};
  readonly name: string;
  readonly description: string;

  constructor(path: string, name: string, description: string) {
    this.pathID = path;
    this.name = name;
    this.description = description;
  }

  /**Makes a variable subgroup for this group
   * @param id unique identifier for this subgroup in the parent group
   * @param name name of group formatted for user reading
   * @param description a description of what the setting group is about formatted for user reading*/
  makeSubGroup(id: string, name: string, description: string) {
    if (id in this.subGroups)
      throw new Error("Sub group already registered " + id);
    if (id.includes("-"))
      throw new Error("Dash not permitted in variable id " + id);
    return (this.subGroups[id] = new ThemeVariableGroup(
      this.pathID + "-" + id,
      name,
      description
    ));
  }

  /**Makes a variable
   * @param id unique identifier for this variable in the group
   * @param name name of variable formatted for user reading
   * @param description a description of what the variable is about formatted for user reading
   * @param light value for light mode
   * @param dark value for dark mode
   * @param type type of variable for editing
   * @param typeParams */
  makeVariable<K extends keyof VariableType>(
    id: string,
    name: string,
    description: string,
    light: string,
    dark: string,
    type: K,
    typeParams: VariableType[K],
    example?: () => Element
  ): string {
    if (id in this.variables)
      throw new Error("Settings already registered " + id);
    if (id.includes("-"))
      throw new Error("Dash not permitted in variable id " + id);
    let key = "--" + this.pathID + "-" + id;
    let variable = (this.variables[key] = {
      name,
      desc: description,
      vars: { [Themes.Light]: light, [Themes.Dark]: dark },
      type,
      typeParams,
      example,
    });
    themeEngine.applySingleProperty(key, variable.vars);
    return key;
  }

  /**Applies the groups
   * @param style unique identifier for this variable in the group
   * @param theme name of variable formatted for user reading*/
  applyThemes(style: CSSStyleDeclaration, theme: string) {
    for (const key in this.variables)
      style.setProperty(key, this.variables[key].vars[theme]);
    for (const key in this.subGroups)
      this.subGroups[key].applyThemes(style, theme);
  }
}

/**Defines the parameters for a variable type */
interface VariableType {
  /**Text variable,  */
  String: undefined;
  /**Color variable */
  Color: undefined;
  /**Time variable */
  Time: {
    /**Minimum time in milliseconds */
    min: number;
    /**Maximum time in milliseconds */
    max: number;
  };
  /**Angle variable */
  Angle: { min: number; max: number };
  /**Length variable*/
  Length: { min: number; max: number };
  /**Number variable*/
  Number: { min: number; max: number };
  /**Ratio*/
  Ratio:
    | {
        width: { min: number; max: number };
        height: { min: number; max: number };
      }
    | number;
}
