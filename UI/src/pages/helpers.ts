import { InstrReadOut, InstrTank, InstrText } from "@libInstr";
import { ScaledPage } from "@libPages";
import { Value, ValueProxy, ValueSummer } from "@libValues";
import type { ModuleRef } from "@modCommon";
import { ModuleManager } from "@system/moduleManager";

export function textMaker(
  page: ScaledPage,
  texts: {
    x: number;
    y: number;
    text: string;
    size?: number;
  }[]
) {
  texts.map((v: { x: number; y: number; text: string; size?: number }) => {
    page.appendInstrument(
      new InstrText().options({
        x: v.x,
        y: v.y,
        width: v.text.length * (v.size ?? 30),
        height: (v.size ?? 30) * 1.5,
        text: v.text,
        textSize: v.size ?? 30,
      })
    );
  });
}

export type HelperInstrReadOutConfig = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  id?: ModuleRef;
  value?: number;
  unit?: string;
  decimals?: number;
};

export function readOutGridMaker(
  list: Omit<HelperInstrReadOutConfig, "x" | "y" | "width" | "height">[],
  x: number,
  y: number,
  cols: number,
  width: number,
  rowHeight: number = 10,
  colGap: number = 10
): HelperInstrReadOutConfig[] {
  return list.map((v, i) => {
    return {
      ...v,
      x: (i % cols) * (width + colGap) + x,
      y: Math.floor(i / cols) * rowHeight + y,
      width: width,
    };
  });
}

export function readOutMaker(
  page: ScaledPage,
  readOuts: HelperInstrReadOutConfig[]
): (modMan: ModuleManager, ip: string) => void {
  let readOutRet: InstrReadOut[] = [];
  let ips: {
    [key: string]: {
      tank: InstrReadOut;
      value?: ModuleRef;
    }[];
  } = {};
  readOuts.forEach((value, i) => {
    page.appendInstrument(
      (readOutRet[i] = new InstrReadOut().options({
        x: value.x,
        y: value.y,
        width: value.width ?? 300,
        height: value.height,
        value: value.value ?? 0,
        unit: value.unit ?? "m³",
        decimals: value.decimals ?? 1,
      }))
    );
    if (value.id) {
      (ips[value.id.ip] ??= []).push({
        tank: readOutRet[i],
        value: value.id,
      });
    }
  });
  return (modMan, ip) => {
    ips[ip].forEach((tank) => {
      if (tank.value) {
        let value = modMan.getModuleByUID(tank.value.uid);
        if (value) {
          tank.tank.value = value.value;
          tank.tank.unit = value.unit;
        }
      }
    });
  };
}

export function readOutMakerManual<
  T extends { [key: string]: HelperInstrReadOutConfig }
>(page: ScaledPage, readouts: T): { [K in keyof T]: InstrReadOut } {
  let tanksret: { [key: string]: InstrReadOut } = {};
  Object.entries(
    readouts as {
      [key: string]: {
        x: number;
        y: number;
        width?: number;
        height?: number;
        value?: number;
        unit?: string;
        decimals?: number;
      };
    }
  ).forEach(([key, value]) => {
    page.appendInstrument(
      (tanksret[key] = new InstrReadOut().options({
        x: value.x,
        y: value.y,
        height: value.height ?? 300,
        width: value.width ?? 300,
        value: value.value ?? 0,
        unit: value.unit ?? "m",
        decimals: value.decimals ?? 1,
      }))
    );
  });
  return tanksret as { [K in keyof T]: InstrReadOut };
}

export type HelperInstrTankConfig = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  id?: ModuleRef;
  densityId?: ModuleRef;
  massId?: ModuleRef;
  headLine?: string;
  subLine?: string;
  value?: number;
  unit?: string;
  decimals?: number;
  lines?: number[];
  maxValue?: number;
  density?: number;
  densityDecimals?: number;
  densityUnit?: string;
  mass?: number;
  massDecimals?: number;
  massUnit?: string;
};

export function tankMaker(
  page: ScaledPage,
  tanks: HelperInstrTankConfig[]
): (modMan: ModuleManager, ip: string) => void {
  let tanksret: InstrTank[] = [];
  let ips: {
    [key: string]: {
      tank: InstrTank;
      value?: ModuleRef;
      density?: ModuleRef;
      mass?: ModuleRef;
    }[];
  } = {};
  tanks.forEach((value, i) => {
    page.appendInstrument(
      (tanksret[i] = new InstrTank().options({
        x: value.x,
        y: value.y,
        width: value.width ?? 300,
        height: value.height,
        headline: value.headLine ?? "",
        subline: value.subLine ?? "",
        value: value.value ?? 0,
        unit: value.unit ?? "m³",
        decimals: value.decimals ?? 1,
        density: value.density,
        densityUnit: value.densityUnit,
        densityDecimals: value.densityDecimals ?? 3,
        mass: value.mass,
        massUnit: value.massUnit,
        massDecimals: value.massDecimals ?? 1,
        lines: value.lines ?? [],
        maxValue: value.maxValue ?? 100,
      }))
    );
    if (value.id) {
      (ips[value.id.ip] ??= []).push({
        tank: tanksret[i],
        value: value.id,
      });
    }
    if (value.densityId) {
      (ips[value.densityId.ip] ??= []).push({
        tank: tanksret[i],
        density: value.densityId,
      });
    }
    if (value.massId) {
      (ips[value.massId.ip] ??= []).push({
        tank: tanksret[i],
        mass: value.massId,
      });
    }
  });
  return (modMan, ip) => {
    ips[ip].forEach((tank) => {
      if (tank.value) {
        let value = modMan.getModuleByUID(tank.value.uid);
        if (value) {
          tank.tank.value = value.value;
          tank.tank.unit = value.unit;
        }
      }
      if (tank.density) {
        let value = modMan.getModuleByUID(tank.density.uid);
        if (value) {
          tank.tank.density = value.value;
          tank.tank.densityUnit = value.unit;
        }
      }
      if (tank.mass) {
        let value = modMan.getModuleByUID(tank.mass.uid);
        if (value) {
          tank.tank.mass = value.value;
          tank.tank.massUnit = value.unit;
        }
      }
    });
  };
}

export function tankMakerManual<
  T extends { [key: string]: HelperInstrTankConfig }
>(page: ScaledPage, tanks: T): { [K in keyof T]: InstrTank } {
  let tanksret: { [key: string]: InstrTank } = {};
  Object.entries(tanks).forEach(([key, value]) => {
    page.appendInstrument(
      (tanksret[key] = new InstrTank().options({
        x: value.x,
        y: value.y,
        width: value.width ?? 300,
        height: value.height,
        headline: value.headLine ?? "",
        subline: value.subLine ?? "",
        value: value.value ?? 0,
        unit: value.unit ?? "m³",
        decimals: value.decimals ?? 1,
        density: value.density,
        densityUnit: value.densityUnit,
        densityDecimals: value.densityDecimals ?? 3,
        mass: value.mass,
        massUnit: value.massUnit,
        massDecimals: value.massDecimals ?? 1,
        lines: value.lines ?? [],
        maxValue: value.maxValue ?? 100,
      }))
    );
  });
  return tanksret as { [K in keyof T]: InstrTank };
}

export function valueSumCreator<A>(list: A[], func: (args: A) => ModuleRef) {
  let ips: { [key: string]: { proxy: ValueProxy; value: ModuleRef }[] } = {};
  let sum = new ValueSummer(
    list.map(func).map((a) => {
      let proxy = new ValueProxy(new Value(0));
      (ips[a.ip] ??= []).push({ proxy, value: a });
      return proxy;
    })
  );
  return {
    sum,
    register: (modMan: ModuleManager, ip: string) => {
      ips[ip].forEach((a) => {
        let mod = modMan.getModuleByUID(a.value.uid);
        if (mod) a.proxy.proxy = mod.value;
      });
    },
  };
}

export function tankGridMaker(
  list: Omit<HelperInstrTankConfig, "x" | "y" | "width" | "height">[],
  x: number,
  y: number,
  cols: number,
  width: number,
  rowHeight: number = 10,
  colGap: number = 10
): HelperInstrTankConfig[] {
  return list.map((v, i) => {
    return {
      ...v,
      x: (i % cols) * (width + colGap) + x,
      y: Math.floor(i / cols) * rowHeight + y,
      width: width,
    };
  });
}
