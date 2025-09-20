import type { StateEnumHelperList } from "@state";

/**Enum of possible access types for base element*/
export const AccessTypes = {
  write: "w",
  read: "r",
  none: "n",
} as const;
export type AccessTypes = (typeof AccessTypes)[keyof typeof AccessTypes];

/**List for access type*/
export const accessTypes = {
  [AccessTypes.write]: {
    name: "Write",
    description: "Write access to element",
  },
  [AccessTypes.read]: { name: "Read", description: "Read access to element" },
  [AccessTypes.none]: { name: "None", description: "No access to element" },
} satisfies StateEnumHelperList;
