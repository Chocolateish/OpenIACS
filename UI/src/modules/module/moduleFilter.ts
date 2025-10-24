import type {
  ModuleBase,
  ModuleDesignator,
  ModuleValueAccessEnum,
} from "@modCommon";

/**Defines module filter which can be filtered by */
export type ModuleFilterFeature = {
  value: ModuleValueAccessEnum;
};

/**Defines module filter function*/
export type ModuleFilterFunction = (mod: ModuleBase) => boolean;

/**Defines options available for module selector filter*/
export type ModuleFilterOptions = {
  /** modules to either block selecting of allow */
  modules?: { block?: ModuleBase[]; pass?: ModuleBase[] };
  /** designators to either block selecting of allow */
  designators?: { block?: ModuleDesignator[]; pass?: ModuleDesignator[] };
  /** module feature to sort by */
  feature?: ModuleFilterFeature;
  /** function to do custom sorting */
  function?: ModuleFilterFunction;
};

/**Class storing a filter to exclude which modules can be selected by functionality*/
export class ModuleFilter {
  /** Functions for this filter*/
  private __filters?: ModuleFilterFunction[];

  /**Creates an instance of the*/
  constructor(options: ModuleFilterOptions) {
    if (!options) {
      console.warn("Parameter must be passed");
      return;
    }
    this.__filters = [];
    if (options.modules) {
      if (options.modules.block) {
        if (options.modules.block instanceof Array) {
          this.__filters.push((mod) => {
            //@ts-expect-error
            return !options.modules.block.includes(mod);
          });
        } else {
          console.warn("Blocklist must be array");
          return;
        }
      }
      if (options.modules.pass) {
        if (options.modules.pass instanceof Array) {
          this.__filters.push((mod) => {
            //@ts-expect-error
            return options.modules.pass.includes(mod);
          });
        } else {
          console.warn("Passlist must be array");
          return;
        }
      }
    }
    if (options.designators) {
      if (options.designators.block) {
        if (options.designators.block instanceof Array) {
          this.__filters.push((mod) => {
            //@ts-expect-error
            return !options.designators.block.includes(mod.designator);
          });
        } else {
          console.warn("Blocklist must be array");
          return;
        }
      }
      if (options.designators.pass) {
        if (options.designators.pass instanceof Array) {
          this.__filters.push((mod) => {
            //@ts-expect-error
            return options.designators.pass.includes(mod.designator);
          });
        } else {
          console.warn("Passlist must be array");
          return;
        }
      }
    }
    if (options.feature) {
      if (typeof options.feature === "object") {
        this.__filters.push((mod) => {
          //@ts-expect-error
          return mod.valueAccess >= options.feature.value;
        });
      } else {
        console.warn("Feature must be object");
        return;
      }
    }
    if (options.function) {
      if (typeof options.function === "function") {
        //@ts-expect-error
        this.__filters.push((mod) => {
          try {
            //@ts-expect-error
            return options.function(mod);
          } catch (e) {
            console.warn("Failed while checking filter function");
          }
        });
      } else {
        console.warn("Must be function");
        return;
      }
    }
  }
  /**This checks if a module is part of the filter
   * @param  module module to check
   * @returns  returns true if module passes filter*/
  checkModule(module: ModuleBase): boolean {
    if (!this.__filters) return true;
    for (let i = 0, n = this.__filters.length; i < n; i++)
      if (!this.__filters[i](module)) return false;
    return true;
  }
}
