import type { ResultOk } from "@libResult";
import type { STATE_ROA_WA } from "@libState";

let name_transformer: ((name: string) => string) | undefined;
export const settings_set_name_transform = (
  transform: (name: string) => string
) => {
  name_transformer = transform;
};

const packages = localStorage["settings/packageVersions"] as string | undefined;
let packageVersions: { [key: string]: string } = {};
try {
  packageVersions = packages
    ? (JSON.parse(packages) as { [key: string]: string })
    : {};
} catch (e) {}
let storePackageVersionsTimeout: number | undefined;
const bottomGroups: { [key: string]: SettingsGroup } = {};

/**Initialises the settings for the package
 * @param packageName use import {name} from ("../package.json")
 * @param packageVersion use import {version} from ("../package.json")
 * @param versionChanged function to call when the version of the package changed
 * @param name name of group formatted for user reading
 * @param description a description of what the setting group is about*/
export const settings_init = (
  packageName: string,
  packageVersion: string,
  name: string,
  description: string
) => {
  if (name_transformer) packageName = name_transformer(packageName);
  let changed: string | undefined;
  if (packageVersions[packageName] !== packageVersion) {
    changed = packageVersions[packageName];
    packageVersions[packageName] = packageVersion;
    if (storePackageVersionsTimeout) clearTimeout(storePackageVersionsTimeout);
    storePackageVersionsTimeout = window.setTimeout(() => {
      localStorage["settings/packageVersions"] =
        JSON.stringify(packageVersions);
    }, 1000);
  }
  return (bottomGroups[packageName] = new SettingsGroup(
    packageName,
    name,
    description,
    changed ? changed : undefined
  ));
};

class Setting {
  readonly state: STATE_ROA_WA<any>;
  readonly name: string;
  readonly description: string;
  constructor(state: STATE_ROA_WA<any>, name: string, description: string) {
    this.state = state;
    this.name = name;
    this.description = description;
  }
}

/**Group of settings should never be instantiated manually use initSettings*/
export class SettingsGroup {
  private pathID: string;
  private settings: { [key: string]: Setting } = {};
  private subGroups: { [key: string]: SettingsGroup } = {};
  readonly versionChanged: string | undefined;
  readonly name: string;
  readonly description: string;

  constructor(
    path: string,
    name: string,
    description: string,
    versionChanged?: string
  ) {
    this.versionChanged = versionChanged;
    this.pathID = path;
    this.name = name;
    this.description = description;
  }

  /**Makes a settings subgroup for this group
   * @param id unique identifier for this subgroup in the parent group
   * @param name name of group formatted for user reading
   * @param description a description of what the setting group is about formatted for user reading*/
  make_sub_group(id: string, name: string, description: string) {
    if (id in this.subGroups) throw "Sub group already registered " + id;
    return (this.subGroups[id] = new SettingsGroup(
      this.pathID + "/" + id,
      name,
      description,
      this.versionChanged
    ));
  }

  /**Gets value of setting or fallbacks to default
   * @param id unique identifier for this setting in the parent group
   * @param fallback value to use if no setting is stored
   * @param versionChanged function called when the version of the package changed to migrate old value to new formats
   */
  get<TYPE>(
    id: string,
    fallback: TYPE,
    versionChanged?: (existing: string, oldVersion: string) => TYPE
  ): TYPE {
    const saved = localStorage[this.pathID + "/" + id];
    try {
      if (this.versionChanged && versionChanged) {
        const changedValue = versionChanged(
          JSON.parse(saved),
          this.versionChanged
        );
        localStorage[this.pathID + "/" + id] = JSON.stringify(changedValue);
        return changedValue;
      }
      return JSON.parse(saved);
    } catch (e) {
      return fallback;
    }
  }

  /**Sets value of setting, that has not been registered to a state
   * @param id unique identifier for this setting in the parent group
   * @param value value to set*/
  set(id: string, value: any) {
    if (id in this.settings)
      throw new Error("Settings is registered " + this.pathID + "/" + id);
    localStorage[this.pathID + "/" + id] = JSON.stringify(value);
  }

  /**Registers a state to a setting
   * @param id unique identifier for this setting in the parent group
   * @param name name of setting formatted for user reading
   * @param description a description of what the setting is about formatted for user reading
   * @param state initial value for the setting, use a promise for an eager async value, use a function returning a promise for a lazy async value
   */
  register<READ>(
    id: string,
    name: string,
    description: string,
    state: STATE_ROA_WA<READ>
  ) {
    if (id in this.settings)
      throw new Error("Settings already registered " + this.pathID + "/" + id);
    this.settings[id] = new Setting(state, name, description);
    state.sub((value) => {
      localStorage[this.pathID + "/" + id] = JSON.stringify(value.unwrap);
    });
  }

  /**Registers a state to a setting
   * @param id unique identifier for this setting in the parent group
   * @param name name of setting formatted for user reading
   * @param description a description of what the setting is about formatted for user reading
   * @param state initial value for the setting, use a promise for an eager async value, use a function returning a promise for a lazy async value
   */
  register_transform<READ, TYPE>(
    id: string,
    name: string,
    description: string,
    state: STATE_ROA_WA<READ>,
    transform: (state: ResultOk<READ>) => TYPE
  ) {
    if (id in this.settings)
      throw new Error("Settings already registered " + this.pathID + "/" + id);
    this.settings[id] = new Setting(state, name, description);
    state.sub((value) => {
      localStorage[this.pathID + "/" + id] = JSON.stringify(transform(value));
    });
  }
}
