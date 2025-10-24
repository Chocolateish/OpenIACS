import type {
  HelperInstrReadOutConfig,
  HelperInstrTankConfig,
} from "./helpers";

export const sharedTanks = {
  //      ______ _____  ______  _____ _    _  __          __  _______ ______ _____
  //     |  ____|  __ \|  ____|/ ____| |  | | \ \        / /\|__   __|  ____|  __ \
  //     | |__  | |__) | |__  | (___ | |__| |  \ \  /\  / /  \  | |  | |__  | |__) |
  //     |  __| |  _  /|  __|  \___ \|  __  |   \ \/  \/ / /\ \ | |  |  __| |  _  /
  //     | |    | | \ \| |____ ____) | |  | |    \  /\  / ____ \| |  | |____| | \ \
  //     |_|    |_|  \_\______|_____/|_|  |_|     \/  \/_/    \_\_|  |______|_|  \_\
  NO_1_FW_TK_P: {
    headLine: "NO.1 FW TK(P)",
    subLine: "Fresh Water",
    maxValue: 51.8,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_1_FW_TK_S: {
    headLine: "NO.1 FW TK(S)",
    subLine: "Fresh Water",
    maxValue: 51.8,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_2_FW_TK: {
    headLine: "NO.2 FW TK",
    subLine: "Fresh Water",
    maxValue: 13.09,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  //       ____ _______ _    _ ______ _____
  //      / __ \__   __| |  | |  ____|  __ \
  //     | |  | | | |  | |__| | |__  | |__) |
  //     | |  | | | |  |  __  |  __| |  _  /
  //     | |__| | | |  | |  | | |____| | \ \
  //      \____/  |_|  |_|  |_|______|_|  \_\
  BILGE_TK: {
    headLine: "BILGE TK.",
    subLine: "",
    maxValue: 10.51,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  SEWAGE_TK: {
    headLine: "SEWAGE TK",
    subLine: "",
    maxValue: 17.78,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  DIRTY_OIL_TK: {
    headLine: "DIRTY OIL TK",
    subLine: "",
    maxValue: 2.94,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  F_O_OVERFLOW_TK: {
    headLine: "FO OVERFLOW",
    subLine: "",
    maxValue: 10.51,
    id: { ip: "192.168.1.250", uid: 9999 },
  },

  //      ______ _    _ ______ _         ____ _____ _
  //     |  ____| |  | |  ____| |       / __ \_   _| |
  //     | |__  | |  | | |__  | |      | |  | || | | |
  //     |  __| | |  | |  __| | |      | |  | || | | |
  //     | |    | |__| | |____| |____  | |__| || |_| |____
  //     |_|     \____/|______|______|  \____/_____|______|
  NO_1_FO_TK_P: {
    headLine: "NO.1 FO TK (P)",
    subLine: "",
    maxValue: 88.96,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_1_FO_TK_S: {
    headLine: "NO.1 FO TK (S)",
    subLine: "",
    maxValue: 88.96,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_2_FO_TK_P: {
    headLine: "NO.2 FO TK (P)",
    subLine: "",
    maxValue: 82.8,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_2_FO_TK_S: {
    headLine: "NO.2 FO TK (S)",
    subLine: "",
    maxValue: 82.8,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  FO_DAY_TK_P: {
    headLine: "FO DAY TK (P)",
    subLine: "",
    maxValue: 5.74,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  FO_DAY_TK_S: {
    headLine: "FO DAY TK (S)",
    subLine: "",
    maxValue: 5.74,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  //      ____          _      _                _____ _______
  //     |  _ \   /\   | |    | |        /\    / ____|__   __|
  //     | |_) | /  \  | |    | |       /  \  | (___    | |
  //     |  _ < / /\ \ | |    | |      / /\ \  \___ \   | |
  //     | |_) / ____ \| |____| |____ / ____ \ ____) |  | |
  //     |____/_/    \_\______|______/_/    \_\_____/   |_|
  FP_TK_WB_TK: {
    headLine: "FP TK & WB TK",
    subLine: "",
    maxValue: 76.15,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_1_WB_TK_P: {
    headLine: "NO.1 WB TK (P)",
    subLine: "",
    maxValue: 72.81,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_1_WB_TK_S: {
    headLine: "NO.1 WB TK (S)",
    subLine: "",
    maxValue: 72.81,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_2_WB_TK_P: {
    headLine: "NO.2 WB TK (P)",
    subLine: "",
    maxValue: 76.98,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_2_WB_TK_S: {
    headLine: "NO.2 WB TK (S)",
    subLine: "",
    maxValue: 76.98,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_4_WB_TK_P: {
    headLine: "NO.4 WB TK (P)",
    subLine: "",
    maxValue: 100.84,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_4_WB_TK_S: {
    headLine: "NO.4 WB TK (S)",
    subLine: "",
    maxValue: 100.84,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_6_WB_TK_P: {
    headLine: "NO.6 WB TK (P)",
    subLine: "",
    maxValue: 42.57,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_6_WB_TK_S: {
    headLine: "NO.6 WB TK (S)",
    subLine: "",
    maxValue: 42.57,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_2_WB_WING_TK_P: {
    headLine: "NO.2 WB TK (P)",
    subLine: "WING",
    maxValue: 47.6,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_2_WB_WING_TK_S: {
    headLine: "NO.2 WB TK (S)",
    subLine: "WING",
    maxValue: 47.6,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_3_WB_WING_TK_P: {
    headLine: "NO.3 WB TK (P)",
    subLine: "WING",
    maxValue: 52.46,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_3_WB_WING_TK_S: {
    headLine: "NO.3 WB TK (S)",
    subLine: "WING",
    maxValue: 52.46,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_4_WB_WING_TK_P: {
    headLine: "NO.4 WB TK (P)",
    subLine: "WING",
    maxValue: 59.27,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_4_WB_WING_TK_S: {
    headLine: "NO.4 WB TK (S)",
    subLine: "WING",
    maxValue: 59.27,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_5_WB_WING_TK_P: {
    headLine: "NO.5 WB TK (P)",
    subLine: "WING",
    maxValue: 52.56,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
  NO_5_WB_WING_TK_S: {
    headLine: "NO.5 WB TK (S)",
    subLine: "WING",
    maxValue: 52.56,
    id: { ip: "192.168.1.250", uid: 9999 },
  },
} as const satisfies {
  [key: string]: Omit<HelperInstrTankConfig, "x" | "y" | "width" | "height">;
};

export const sharedReadOuts = {
  YOYOYO: {
    id: { ip: "192.168.1.250", uid: 9999 },
  },
} as const satisfies {
  [key: string]: Omit<HelperInstrReadOutConfig, "x" | "y" | "width" | "height">;
};
