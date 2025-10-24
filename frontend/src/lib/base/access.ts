import type { StateEnumHelperList } from "@libState";

/**Enum of possible access types for base element*/
export const AccessTypes = {
  WRITE: "w",
  READ: "r",
  NONE: "n",
} as const;
export type AccessTypes = (typeof AccessTypes)[keyof typeof AccessTypes];

/**List for access type*/
export const ACCESSTYPESINFO = {
  [AccessTypes.WRITE]: {
    name: "Write",
    description: "Write access to element",
  },
  [AccessTypes.READ]: { name: "Read", description: "Read access to element" },
  [AccessTypes.NONE]: { name: "None", description: "No access to element" },
} satisfies StateEnumHelperList;
