import { ModuleSelectorOpener } from "@components/moduleSelector";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { AccessTypes, defineElement } from "@libBase";
import { objectEquals } from "@libCommon";
import { Button, InputBox, InputBoxTypes } from "@libComponents";
import {
  Content,
  mainWindowManager,
  UIWindow,
  type ContentBaseOptions,
} from "@libUI";
import type { ModuleManagerBase } from "@modCommon";
import { Module, registerModule } from "@module/module";

export class CRLDP extends Module {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (_values: any[]) => {
      return "DPSystem";
    };
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Returns whether the module has settings*/
  get hasSettingsValues() {
    return true;
  }

  /**Generates an instance of the modules setting content */
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new Editor().options(options);
  }
}
registerModule("CRLDP", CRLDP);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "crldp";
  }

  dockSpeed: InputBox;
  speedFromNmea: InputBox;
  dockBuffer: InputBox;
  speedUpdate: InputBox;
  timeToPressButton: InputBox;
  commandTimerTimout: InputBox;
  gpsHeight: InputBox;
  turnRate: InputBox;
  brakeFactorX: InputBox;
  brakeFactorY: InputBox;
  brakeFactorZ: InputBox;
  changeRateSetpoint: InputBox;
  deadZoneX: InputBox;
  deadZoneY: InputBox;
  deadZoneZ: InputBox;
  boatRoll: ModuleSelectorOpener;
  boatPitch: ModuleSelectorOpener;
  windMag: ModuleSelectorOpener;
  windAngle: ModuleSelectorOpener;
  windPS: ModuleSelectorOpener;
  holdPos: ModuleSelectorOpener;
  anchor: ModuleSelectorOpener;
  speedOverGround: ModuleSelectorOpener;
  courseOverGround: ModuleSelectorOpener;
  rateOfTurn: ModuleSelectorOpener;
  bowThrusterArray: Button;
  sternThrusterArray: Button;
  pxTable: Button;
  pyTable: Button;
  windSBTable: Button;
  windPSTable: Button;
  sternPropellerPowerForward: Button;
  sternPropellerPowerBack: Button;
  bowThrusterPower: Button;
  thrusterOffsetX: Button;
  thrusterOffsetY: Button;
  actuators: Button;
  currentpos: Button;
  commandsignals: Button;
  buttonsgroup: Button;
  xPid: Button;
  yPid: Button;
  zPid: Button;
  dpsJoystick: Button;
  thrustersetX: Button;
  thrustersetY: Button;

  bowThrusterArrayResult: {} = {};
  bowThrusterArraycopi: {} = {};
  sternThrusterArrayResult: {} = {};
  sternThrusterArraycopi: {} = {};
  pxTableResult: {} = {};
  pxTablecopi: {} = {};
  pyTableResult: {} = {};
  pyTablecopi: {} = {};
  windSBTableResult: {} = {};
  windSBTablecopi: {} = {};
  windPSTableResult: {} = {};
  windPSTablecopi: {} = {};
  relativeDistResult: {} = {};
  relativeDistcopi: {} = {};
  sternPropellerPowerForwardResult: {} = {};
  sternPropellerPowerForwardcopi: {} = {};
  sternPropellerPowerBackResult: {} = {};
  sternPropellerPowerBackcopi: {} = {};
  bowThrusterPowerResult: {} = {};
  bowThrusterPowercopi: {} = {};
  thrusterOffsetXResult: {} = {};
  thrusterOffsetXcopi: {} = {};
  thrusterOffsetYResult: {} = {};
  thrusterOffsetYcopi: {} = {};
  thrustersetXResult: {} = {};
  thrustersetXcopi: {} = {};
  thrustersetYResult: {} = {};
  thrustersetYcopi: {} = {};
  actuatorsResult: {} = {};
  actuatorscopi: {} = {};
  currentPosResult: {} = {};
  currentPoscopi: {} = {};
  commandsignalsResult: {} = {};
  buttonsgroupResult: {} = {};
  xPidResult: {} = {};
  yPidResult: {} = {};
  zPidResult: {} = {};
  dpsJoystickResult: {} = {};
  commandsignalscopi: {} = {};
  buttonsgroupcopi: {} = {};
  xPidcopi: {} = {};
  yPidcopi: {} = {};
  zPidcopi: {} = {};
  dpsJoystickcopi: {} = {};

  constructor() {
    super();
    this.dockSpeed = this.group.addComponent(
      new InputBox().options({
        id: "dockSpeedLimit",
        text: "Dock Speed limit",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "knob",
        access: this.userAccess,
      })
    );
    this.speedFromNmea = this.group.addComponent(
      new InputBox().options({
        id: "speedFromNmea",
        text: "Is speed from NMEA Sentence",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "",
        access: this.userAccess,
      })
    );
    this.dockBuffer = this.group.addComponent(
      new InputBox().options({
        id: "dockBuffer",
        text: "Dockmode Buffer",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "knob",
        access: this.userAccess,
      })
    );
    this.speedUpdate = this.group.addComponent(
      new InputBox().options({
        id: "speedUpdateIntervall",
        text: "Speed Update Interval",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        unit: "s",
        access: this.userAccess,
      })
    );
    this.speedUpdate = this.group.addComponent(
      new InputBox().options({
        id: "propellerPowerFactorX",
        text: "Propeller Power Factor X",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.speedUpdate = this.group.addComponent(
      new InputBox().options({
        id: "propellerPowerFactorY",
        text: "Propeller Power Factor Y",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.speedUpdate = this.group.addComponent(
      new InputBox().options({
        id: "windFactor",
        text: "Wind Factor",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.speedUpdate = this.group.addComponent(
      new InputBox().options({
        id: "propellerForwardFactor",
        text: "Propeller Forward Factor",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.speedUpdate = this.group.addComponent(
      new InputBox().options({
        id: "propellerBackwardsFactor",
        text: "Propeller Backwards Factor",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.speedUpdate = this.group.addComponent(
      new InputBox().options({
        id: "setpointUpdateSpeed",
        text: "Setpoint Update Speed",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.speedUpdate = this.group.addComponent(
      new InputBox().options({
        id: "thrusterMaxPower",
        text: "Thruster Max Power",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.timeToPressButton = this.group.addComponent(
      new InputBox().options({
        id: "timeToPressButton",
        text: "Time To Press Button",
        type: InputBoxTypes.NUMBERPOSITIVE,
        unit: "s",
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.commandTimerTimout = this.group.addComponent(
      new InputBox().options({
        id: "commandTimerTimout",
        text: "Command Timer Timout",
        type: InputBoxTypes.NUMBERPOSITIVE,
        unit: "s",
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.gpsHeight = this.group.addComponent(
      new InputBox().options({
        id: "gpsHeight",
        text: "GPS Height",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.turnRate = this.group.addComponent(
      new InputBox().options({
        id: "turnRate",
        text: "Turnrate",
        type: InputBoxTypes.NUMBERPOSITIVE,
        min: 0,
        max: 32760,
        access: this.userAccess,
      })
    );
    this.brakeFactorX = this.group.addComponent(
      new InputBox().options({
        id: "brakeFactorX",
        text: "Brake Factor X",
        type: InputBoxTypes.NUMBER,
        min: -100,
        max: 100,
        access: this.userAccess,
      })
    );
    this.brakeFactorY = this.group.addComponent(
      new InputBox().options({
        id: "brakeFactorY",
        text: "Brake Factor Y",
        type: InputBoxTypes.NUMBER,
        min: -100,
        max: 100,
        access: this.userAccess,
      })
    );
    this.brakeFactorZ = this.group.addComponent(
      new InputBox().options({
        id: "brakeFactorZ",
        text: "Brake Factor Z",
        type: InputBoxTypes.NUMBER,
        min: -100,
        max: 100,
        access: this.userAccess,
      })
    );
    this.changeRateSetpoint = this.group.addComponent(
      new InputBox().options({
        id: "changeRateSetpoint",
        text: "Change Rate Of Setpoint",
        type: InputBoxTypes.NUMBER,
        min: -100,
        max: 100,
        access: this.userAccess,
      })
    );
    this.deadZoneX = this.group.addComponent(
      new InputBox().options({
        id: "deadzoneX",
        text: "Dead Zone X",
        type: InputBoxTypes.NUMBER,
        min: -100,
        max: 100,
        access: this.userAccess,
      })
    );
    this.deadZoneY = this.group.addComponent(
      new InputBox().options({
        id: "deadzoneY",
        text: "Dead Zone Y",
        type: InputBoxTypes.NUMBER,
        min: -100,
        max: 100,
        access: this.userAccess,
      })
    );
    this.deadZoneZ = this.group.addComponent(
      new InputBox().options({
        id: "deadzoneZ",
        text: "Dead Zone Z",
        type: InputBoxTypes.NUMBER,
        min: -100,
        max: 100,
        access: this.userAccess,
      })
    );
    this.boatRoll = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "Boat Roll",
      })
    );
    this.boatPitch = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "Boat Pitch",
      })
    );
    this.windMag = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "Wind Magnitude",
      })
    );
    this.windAngle = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "Wind Angle",
      })
    );
    this.windPS = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "WindPS",
      })
    );
    this.holdPos = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "Hold Pos",
      })
    );
    this.anchor = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "Anchor",
      })
    );
    this.speedOverGround = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "Speed Over Ground",
      })
    );
    this.courseOverGround = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "Course Over Ground",
      })
    );
    this.rateOfTurn = this.group.addComponent(
      new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "Rate Of Turn",
      })
    );

    this.bowThrusterArray = this.group.addComponent(
      new Button().options({
        text: "Bow Thruster",
        click: async () => {
          this.bowThrusterArrayResult = (await this.__editArray(
            "bowThrusterArrayResult",
            "Bow Thruster"
          )) as any;
        },
      })
    );
    this.sternThrusterArray = this.group.addComponent(
      new Button().options({
        text: "Stern Thruster",
        click: async () => {
          this.sternThrusterArrayResult = (await this.__editArray(
            "sternThrusterArrayResult",
            "Stern Thruster"
          )) as any;
        },
      })
    );

    this.pxTable = this.group.addComponent(
      new Button().options({
        text: "Pitch",
        click: async () => {
          this.pxTableResult = (await this.__editArray(
            "pxTableResult",
            "Pitch"
          )) as any;
        },
      })
    );
    this.pyTable = this.group.addComponent(
      new Button().options({
        text: "Counter Pitch",
        click: async () => {
          this.pyTableResult = (await this.__editArray(
            "pyTableResult",
            "CounterPitch"
          )) as any;
        },
      })
    );
    this.windSBTable = this.group.addComponent(
      new Button().options({
        text: "Wind Starboard Table",
        click: async () => {
          this.windSBTableResult = (await this.__editArray(
            "windSBTableResult",
            "WindSBTable"
          )) as any;
        },
      })
    );
    this.windPSTable = this.group.addComponent(
      new Button().options({
        text: "Wind Port Table",
        click: async () => {
          this.windPSTableResult = (await this.__editArray(
            "windPSTableResult",
            "WindPSTable"
          )) as any;
        },
      })
    );
    this.sternPropellerPowerForward = this.group.addComponent(
      new Button().options({
        text: "Stern Propeller Power Forward",
        click: async () => {
          this.sternPropellerPowerForwardResult = (await this.__editArray(
            "sternPropellerPowerForwardResult",
            "sternPropellerPowerForward"
          )) as any;
        },
      })
    );
    this.sternPropellerPowerBack = this.group.addComponent(
      new Button().options({
        text: "Stern Propeller Power Back",
        click: async () => {
          this.sternPropellerPowerBackResult = (await this.__editArray(
            "sternPropellerPowerBackResult",
            "sternPropellerPowerBack"
          )) as any;
        },
      })
    );
    this.bowThrusterPower = this.group.addComponent(
      new Button().options({
        text: "Bow Thruster Power",
        click: async () => {
          this.bowThrusterPowerResult = (await this.__editArray(
            "bowThrusterPowerResult",
            "bowThrusterPower"
          )) as any;
        },
      })
    );
    //Thruster
    this.thrusterOffsetX = this.group.addComponent(
      new Button().options({
        text: "thrusterOffsetX",
        click: async () => {
          this.thrusterOffsetXResult = (await this.__editArray(
            "thrusterOffsetXResult",
            "thrusterOffsetX"
          )) as any;
        },
      })
    );
    this.thrusterOffsetY = this.group.addComponent(
      new Button().options({
        text: "thrusterOffsetY",
        click: async () => {
          this.thrusterOffsetYResult = (await this.__editArray(
            "thrusterOffsetYResult",
            "thrusterOffsetY"
          )) as any;
        },
      })
    );
    this.thrustersetX = this.group.addComponent(
      new Button().options({
        text: "thrustersetX",
        click: async () => {
          this.thrustersetXResult = (await this.__editArray(
            "thrustersetXResult",
            "thrustersetX"
          )) as any;
        },
      })
    );
    this.thrustersetY = this.group.addComponent(
      new Button().options({
        text: "thrustersetY",
        click: async () => {
          this.thrustersetYResult = (await this.__editArray(
            "thrustersetYResult",
            "thrustersetY"
          )) as any;
        },
      })
    );

    //the button showing Command Signals
    this.group.addComponent(
      (this.actuators = new Button().options({
        text: "Rudder, Thruster and Propeller",
        click: async () => {
          this.actuatorsResult = (await this.__editActuators(
            "actuatorsResult",
            "actuators"
          )) as any; // function Run when button is pressed
        },
      }))
    );

    this.group.addComponent(
      (this.currentpos = new Button().options({
        text: "Current Potion",
        click: async () => {
          this.currentPosResult = (await this.__editGpsDecimal(
            "currentPosResult",
            "currentPos"
          )) as any;
        },
      }))
    );
    //the button showing Command Signals
    this.group.addComponent(
      (this.commandsignals = new Button().options({
        text: "Command Signals",
        click: async () => {
          this.commandsignalsResult = (await this.__editCommandSignal(
            "commandsignalsResult",
            "commandSingals"
          )) as any; // function Run when button is pressed
        },
      }))
    );

    //the button showing Command Signals
    this.group.addComponent(
      (this.buttonsgroup = new Button().options({
        text: "Buttons",
        click: async () => {
          this.buttonsgroupResult = (await this.__editButtonsGroup(
            "buttonsgroupResult",
            "buttonsGroup"
          )) as any; // function Run when button is pressed
        },
      }))
    );

    this.group.addComponent(
      (this.xPid = new Button().options({
        text: "xPid",
        click: async () => {
          this.xPidResult = (await this.__dpsPidEdit(
            "xPidResult",
            "xPid"
          )) as any;
        },
      }))
    );
    this.group.addComponent(
      (this.yPid = new Button().options({
        text: "yPid",
        click: async () => {
          this.yPidResult = (await this.__dpsPidEdit(
            "yPidResult",
            "yPid"
          )) as any;
        },
      }))
    );
    this.group.addComponent(
      (this.zPid = new Button().options({
        text: "zPid",
        click: async () => {
          this.zPidResult = (await this.__dpsPidEdit(
            "zPidResult",
            "zPid"
          )) as any;
        },
      }))
    );
    this.group.addComponent(
      (this.dpsJoystick = new Button().options({
        text: "Joystick",
        click: async () => {
          this.dpsJoystickResult = (await this.__dpsJoystickEdit(
            "dpsJoystickResult",
            "dpsJoystick"
          )) as any;
        },
      }))
    );
  }

  /** Updates special values from the module*/
  __newConfigs(values: any) {
    super.__newConfigs(values);
    this.bowThrusterArraycopi = values["bowThrusterArray"];
    this.bowThrusterArrayResult = values["bowThrusterArray"];
    this.sternThrusterArraycopi = values["sternThrusterArray"];
    this.sternThrusterArrayResult = values["sternThrusterArray"];
    this.pxTablecopi = values["pxTable"];
    this.pxTableResult = values["pxTable"];
    this.pyTablecopi = values["pyTable"];
    this.pyTableResult = values["pyTable"];
    this.windSBTablecopi = values["windSBTable"];
    this.windSBTableResult = values["windSBTable"];
    this.windPSTablecopi = values["windPSTable"];
    this.windPSTableResult = values["windPSTable"];
    this.relativeDistcopi = values["relativeDist"];
    this.relativeDistResult = values["relativeDist"];
    this.sternPropellerPowerForwardcopi = values["sternPropellerPowerForward"];
    this.sternPropellerPowerForwardResult =
      values["sternPropellerPowerForward"];
    this.sternPropellerPowerBackcopi = values["sternPropellerPowerBack"];
    this.sternPropellerPowerBackResult = values["sternPropellerPowerBack"];
    this.bowThrusterPowercopi = values["bowThrusterPower"];
    this.bowThrusterPowerResult = values["bowThrusterPower"];
    this.currentPoscopi = { ...values["currentPos"] };
    this.currentPosResult = values["currentPos"];
    this.commandsignalsResult = values["commandsignals"];
    this.buttonsgroupResult = values["buttonsgroup"];
    this.actuatorsResult = values["actuators"];
    this.xPidcopi = { ...values["xPid"] };
    this.xPidResult = values["xPid"];
    this.yPidcopi = { ...values["yPid"] };
    this.yPidResult = values["yPid"];
    this.zPidcopi = { ...values["zPid"] };
    this.zPidResult = values["zPid"];
    this.dpsJoystickcopi = { ...values["joystickVar"] };
    this.dpsJoystickResult = values["joystickVar"];
    //Thruster
    this.thrusterOffsetXcopi = values["thrusterOffsetX"];
    this.thrusterOffsetXResult = values["thrusterOffsetX"];
    this.thrusterOffsetYcopi = values["thrusterOffsetY"];
    this.thrusterOffsetYResult = values["thrusterOffsetY"];
    this.thrustersetXcopi = values["thrustersetX"];
    this.thrustersetXResult = values["thrustersetX"];
    this.thrustersetYcopi = values["thrustersetY"];
    this.thrustersetYResult = values["thrustersetY"];
    this.boatRoll.value = this.__module!.manager.getModuleByUID(
      values["boatRoll"]
    );
    this.boatPitch.value = this.__module!.manager.getModuleByUID(
      values["boatPicth"]
    );
    this.windMag.value = this.__module!.manager.getModuleByUID(
      values["windMag"]
    );
    this.windAngle.value = this.__module!.manager.getModuleByUID(
      values["windAngle"]
    );
    this.windPS.value = this.__module!.manager.getModuleByUID(values["windPS"]);
    this.holdPos.value = this.__module!.manager.getModuleByUID(
      values["holdPos"]
    );
    this.anchor.value = this.__module!.manager.getModuleByUID(values["anchor"]);
    this.speedOverGround.value = this.__module!.manager.getModuleByUID(
      values["speedOverGround"]
    );
    this.courseOverGround.value = this.__module!.manager.getModuleByUID(
      values["courseOverGround"]
    );
    this.rateOfTurn.value = this.__module!.manager.getModuleByUID(
      values["rateOfTurn"]
    );

    console.log(values["dockSpeedLimit"]);
    console.log("values", this.group.values);
  }

  /**Must be set true to show save button*/
  get canSave() {
    return true;
  }

  /** Saves the given data */
  __saveSettings() {
    let saveData: {
      bowThrusterArray?: {};
      sternThrusterArray?: {};
      pxTable?: {};
      pyTable?: {};
      windSBTable?: {};
      windPSTable?: {};
      relativeDist?: {};
      sternPropellerPowerForward?: {};
      sternPropellerPowerBack?: {};
      bowThrusterPower?: {};
      currentPos?: {};
      commandsignals?: {};
      buttonsgroup?: {};
      actuators?: {};
      xPid?: {};
      yPid?: {};
      zPid?: {};
      joystickVar?: {};
      thrusterOffsetX?: {};
      thrusterOffsetY?: {};
      thrustersetX?: {};
      thrustersetY?: {};
      boatRoll?: string;
      boatPitch?: string;
      windMag?: string;
      windAngle?: string;
      windPS?: string;
      holdPos?: string;
      anchor?: string;
      speedOverGround?: string;
      courseOverGround?: string;
      rateOfTurn?: string;
    } = {};
    let boatRollChange = this.boatRoll.changed;
    let boatPitchChange = this.boatPitch.changed;
    let windMagChange = this.windMag.changed;
    let windAngleChange = this.windAngle.changed;
    let windPSChange = this.windPS.changed;
    let holdPosChange = this.holdPos.changed;
    let anchorChange = this.anchor.changed;
    let speedOverGroundChange = this.speedOverGround.changed;
    let courseOverGroundChange = this.courseOverGround.changed;
    let rateOfTurnChange = this.rateOfTurn.changed;

    if (!objectEquals(this.bowThrusterArrayResult, this.bowThrusterArraycopi))
      saveData["bowThrusterArray"] = this.bowThrusterArrayResult;

    if (
      !objectEquals(this.sternThrusterArrayResult, this.sternThrusterArraycopi)
    )
      saveData["sternThrusterArray"] = this.sternThrusterArrayResult;

    if (!objectEquals(this.pxTableResult, this.pxTablecopi))
      saveData["pxTable"] = this.pxTableResult;

    if (!objectEquals(this.pyTableResult, this.pyTablecopi))
      saveData["pyTable"] = this.pyTableResult;

    if (!objectEquals(this.windSBTableResult, this.windSBTablecopi))
      saveData["windSBTable"] = this.windSBTableResult;

    if (!objectEquals(this.windPSTableResult, this.windPSTablecopi))
      saveData["windPSTable"] = this.windPSTableResult;

    if (!objectEquals(this.relativeDistResult, this.relativeDistcopi))
      saveData["relativeDist"] = this.relativeDistResult;

    if (
      !objectEquals(
        this.sternPropellerPowerForwardResult,
        this.sternPropellerPowerForwardcopi
      )
    )
      saveData["sternPropellerPowerForward"] =
        this.sternPropellerPowerForwardResult;

    if (
      !objectEquals(
        this.sternPropellerPowerBackResult,
        this.sternPropellerPowerBackcopi
      )
    )
      saveData["sternPropellerPowerBack"] = this.sternPropellerPowerBackResult;

    if (!objectEquals(this.bowThrusterPowerResult, this.bowThrusterPowercopi))
      saveData["bowThrusterPower"] = this.bowThrusterPowerResult;

    if (!objectEquals(this.currentPosResult, this.currentPoscopi))
      saveData["currentPos"] = this.currentPosResult;

    if (!objectEquals(this.commandsignalsResult, this.commandsignalscopi))
      saveData["commandsignals"] = this.commandsignalsResult;

    if (!objectEquals(this.buttonsgroupResult, this.buttonsgroupcopi))
      saveData["buttonsgroup"] = this.buttonsgroupResult;

    if (!objectEquals(this.actuatorsResult, this.actuatorscopi))
      saveData["actuators"] = this.actuatorsResult;

    if (!objectEquals(this.xPidResult, this.xPidcopi))
      saveData["xPid"] = this.xPidResult;

    if (!objectEquals(this.yPidResult, this.yPidcopi))
      saveData["yPid"] = this.yPidResult;

    if (!objectEquals(this.zPidResult, this.zPidcopi))
      saveData["zPid"] = this.zPidResult;

    if (!objectEquals(this.dpsJoystickResult, this.dpsJoystickcopi))
      saveData["joystickVar"] = this.dpsJoystickResult;

    if (!objectEquals(this.thrusterOffsetXResult, this.thrusterOffsetXcopi))
      saveData["thrusterOffsetX"] = this.thrusterOffsetXResult;

    if (!objectEquals(this.thrusterOffsetYResult, this.thrusterOffsetYcopi))
      saveData["thrusterOffsetY"] = this.thrusterOffsetYResult;

    if (!objectEquals(this.thrustersetXResult, this.thrustersetXcopi))
      saveData["thrustersetX"] = this.thrustersetXResult;

    if (!objectEquals(this.thrustersetYResult, this.thrustersetYcopi))
      saveData["thrustersetY"] = this.thrustersetYResult;

    if (boatRollChange) saveData["boatRoll"] = (boatRollChange as any).uid;
    if (boatPitchChange) saveData["boatPitch"] = (boatPitchChange as any).uid;
    if (windMagChange) saveData["windMag"] = (windMagChange as any).uid;
    if (windAngleChange) saveData["windAngle"] = (windAngleChange as any).uid;
    if (windPSChange) saveData["windPS"] = (windPSChange as any).uid;
    if (holdPosChange) saveData["holdPos"] = (holdPosChange as any).uid;
    if (anchorChange) saveData["anchor"] = (anchorChange as any).uid;
    if (speedOverGroundChange)
      saveData["speedOverGround"] = (speedOverGroundChange as any).uid;
    if (courseOverGroundChange)
      saveData["courseOverGround"] = (courseOverGroundChange as any).uid;
    if (rateOfTurnChange)
      saveData["rateOfTurn"] = (rateOfTurnChange as any).uid;
    super.__saveSettings(saveData);
  }

  defaultName() {
    return "Control Editor";
  }

  async __editArray(key: keyof typeof this, nameArray: string) {
    let edit = new ArrayEdit({ data: this[key] as any, nameArray: nameArray });
    mainWindowManager.appendWindow(
      new UIWindow().options({ content: edit, width: 800, height: 600 })
    );
    let result = await edit.whenClosed;
    if (result) return result;
    else return this[key];
  }

  async __editGpsDecimal(key: keyof typeof this, nameArray: string) {
    let gps = new GpsDecimalEdit({
      data: this[key] as any,
      nameArray: nameArray,
      manager: this.__module!.manager,
    });
    mainWindowManager.appendWindow(
      new UIWindow().options({ content: gps, width: 800, height: 600 })
    );
    let result = await gps.whenClosed;
    if (result) return result;
    else return this[key];
  }
  // function run when button id pressed
  async __editCommandSignal(key: keyof typeof this, nameArray: string) {
    let commandSignal = new CommandSignalEdit({
      data: this[key],
      nameArray: nameArray,
      manager: this.__module!.manager,
    }); // the commandSignalEdit instance
    mainWindowManager.appendWindow(
      new UIWindow().options({
        content: commandSignal,
        width: 800,
        height: 600,
      })
    );
    let result = await commandSignal.whenClosed;
    if (result) return result;
    else return this[key];
  }
  // function run when button id pressed
  async __editActuators(key: keyof typeof this, nameArray: string) {
    let actuators = new ActuatorsEdit({
      data: this[key],
      nameArray: nameArray,
      manager: this.__module!.manager,
    }); // the commandSignalEdit instance
    mainWindowManager.appendWindow(
      new UIWindow().options({ content: actuators, width: 800, height: 600 })
    );
    let result = await actuators.whenClosed;
    if (result) return result;
    else return this[key];
  }

  // function run when button id pressed
  async __editButtonsGroup(key: keyof typeof this, nameArray: string) {
    let buttonsGroup = new ButtonsGroupEdit({
      data: this[key],
      nameArray: nameArray,
      manager: this.__module!.manager,
    });
    mainWindowManager.appendWindow(
      new UIWindow().options({ content: buttonsGroup, width: 800, height: 600 })
    );
    let result = await buttonsGroup.whenClosed;
    if (result) return result;
    else return this[key];
  }

  async __dpsPidEdit(key: keyof typeof this, namePid: string) {
    let pid = new DpsPidEdit({
      data: this[key] as any,
      nameArray: namePid,
    });
    mainWindowManager.appendWindow(
      new UIWindow().options({ content: pid, width: 800, height: 600 })
    );
    let result = await pid.whenClosed;
    if (result) return result;
    else return this[key];
  }

  async __dpsJoystickEdit(key: keyof typeof this, namejoystick: string) {
    let joystick = new DpsJoystickEdit({
      data: this[key] as any,
      nameArray: namejoystick,
      manager: this.__module!.manager,
    });
    mainWindowManager.appendWindow(
      new UIWindow().options({ content: joystick, width: 800, height: 600 })
    );
    let result = await joystick.whenClosed;
    if (result) return result;
    else return this[key];
  }
}
defineElement(Editor);

/**Defines base options for creating content*/
type ArrayEditOptions = {
  /**the data to be edited*/
  data: number[];
  /**name of the array*/
  nameArray: string;
} & ContentBaseOptions;

export class ArrayEdit extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-crldp-array";
  }
  static elementNameSpace() {
    return "lmui";
  }

  constructor(options: ArrayEditOptions) {
    super();
    this.name = options.nameArray;
    let dataValue: InputBox[] = [];
    for (let i = 0; i < options.data.length; i++) {
      this.appendChild(
        (dataValue[i] = new InputBox().options({
          text: options.nameArray + " " + i,
          type: InputBoxTypes.NUMBER,
          min: -200,
          max: 32760,
          unit: "",
          value: options.data[i],
        }))
      );
    }
    this.appendChild(
      new Button().options({
        text: "Save and Close",
        click: () => {
          this.close(
            dataValue.map((e) => {
              return e.value || 0;
            })
          );
        },
      })
    );
  }
}
defineElement(ArrayEdit);

type CommandSignalEditOptions = {
  /**the data to be edited*/
  data: any;
  /**name of the array*/
  nameArray: string;
  /**manager to get modules from*/
  manager: ModuleManagerBase;
} & ContentBaseOptions;

export class CommandSignalEdit extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-crldp-command-signal";
  }
  static elementNameSpace() {
    return "lmui";
  }

  constructor(options: CommandSignalEditOptions) {
    super();
    this.name = options.nameArray;
    let dataValue = [] as any;

    this.appendChild(
      (dataValue["ready1"] = new ModuleSelectorOpener().options({
        text: "Ready1",
        value: options.manager.getModuleByUID(options.data["ready1"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["ready2"] = new ModuleSelectorOpener().options({
        text: "Ready2",
        value: options.manager.getModuleByUID(options.data["ready2"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["ready3"] = new ModuleSelectorOpener().options({
        text: "Ready3",
        value: options.manager.getModuleByUID(options.data["ready3"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["ready4"] = new ModuleSelectorOpener().options({
        text: "Ready4",
        value: options.manager.getModuleByUID(options.data["ready4"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["ack1"] = new ModuleSelectorOpener().options({
        text: "Ack1",
        value: options.manager.getModuleByUID(options.data["ack1"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["ack2"] = new ModuleSelectorOpener().options({
        text: "Ack2",
        value: options.manager.getModuleByUID(options.data["ack2"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["ack3"] = new ModuleSelectorOpener().options({
        text: "Ack3",
        value: options.manager.getModuleByUID(options.data["ack3"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["ack4"] = new ModuleSelectorOpener().options({
        text: "Ack4",
        value: options.manager.getModuleByUID(options.data["ack4"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["req"] = new ModuleSelectorOpener().options({
        text: "Req",
        value: options.manager.getModuleByUID(options.data["req"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["dpwicSB"] = new ModuleSelectorOpener().options({
        text: "DpwicSB",
        value: options.manager.getModuleByUID(options.data["dpwicSB"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["dpwicPS"] = new ModuleSelectorOpener().options({
        text: "DpwicPS",
        value: options.manager.getModuleByUID(options.data["dpwicPS"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["dpRudderWicSB"] = new ModuleSelectorOpener().options({
        text: "dpRudderWicSB",
        value: options.manager.getModuleByUID(
          options.data["dpRudderWicSB"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["dpRudderWicPS"] = new ModuleSelectorOpener().options({
        text: "dpRudderWicPS",
        value: options.manager.getModuleByUID(
          options.data["dpRudderWicPS"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["dpThrusterWicSB"] = new ModuleSelectorOpener().options({
        text: "dpThrusterWicSB",
        value: options.manager.getModuleByUID(
          options.data["dpThrusterWicSB"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["dpThrusterWicPS"] = new ModuleSelectorOpener().options({
        text: "dpThrusterWicPS",
        value: options.manager.getModuleByUID(
          options.data["dpThrusterWicPS"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["tcommand"] = new ModuleSelectorOpener().options({
        text: "Thruster command",
        value: options.manager.getModuleByUID(options.data["tcommand"]) as any,
      }))
    );

    this.appendChild(
      new Button().options({
        text: "Save and Close",
        click: () => {
          if (dataValue["ready1"].value)
            options.data["ready1"] = dataValue["ready1"].value.uid;
          if (dataValue["ready2"].value)
            options.data["ready2"] = dataValue["ready2"].value.uid;
          if (dataValue["ready3"].value)
            options.data["ready3"] = dataValue["ready3"].value.uid;
          if (dataValue["ready4"].value)
            options.data["ready4"] = dataValue["ready4"].value.uid;
          if (dataValue["ack1"].value)
            options.data["ack1"] = dataValue["ack1"].value.uid;
          if (dataValue["ack2"].value)
            options.data["ack2"] = dataValue["ack2"].value.uid;
          if (dataValue["ack3"].value)
            options.data["ack3"] = dataValue["ack3"].value.uid;
          if (dataValue["ack4"].value)
            options.data["ack4"] = dataValue["ack4"].value.uid;
          if (dataValue["req"].value)
            options.data["req"] = dataValue["req"].value.uid;
          if (dataValue["dpwicSB"].value)
            options.data["dpwicSB"] = dataValue["dpwicSB"].value.uid;
          if (dataValue["dpwicPS"].value)
            options.data["dpwicPS"] = dataValue["dpwicPS"].value.uid;
          if (dataValue["dpRudderWicSB"].value)
            options.data["dpRudderWicSB"] =
              dataValue["dpRudderWicSB"].value.uid;
          if (dataValue["dpRudderWicPS"].value)
            options.data["dpRudderWicPS"] =
              dataValue["dpRudderWicPS"].value.uid;
          if (dataValue["dpThrusterWicSB"].value)
            options.data["dpThrusterWicSB"] =
              dataValue["dpThrusterWicSB"].value.uid;
          if (dataValue["dpThrusterWicPS"].value)
            options.data["dpThrusterWicPS"] =
              dataValue["dpThrusterWicPS"].value.uid;
          if (dataValue["tcommand"].value)
            options.data["tcommand"] = dataValue["tcommand"].value.uid;
          this.close(options.data);
        },
      })
    );
  }
}
defineElement(CommandSignalEdit);

type ButtonsGroupEditOptions = {
  nameArray: string;
  data: any;
  manager: ModuleManagerBase;
} & ContentBaseOptions;

export class ButtonsGroupEdit extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-crldp-buttons-group";
  }
  static elementNameSpace() {
    return "lmui";
  }

  constructor(options: ButtonsGroupEditOptions) {
    super();
    this.name = options.nameArray;
    let dataValue = [] as any;

    this.appendChild(
      (dataValue["commandButton"] = new ModuleSelectorOpener().options({
        text: "Command Button",
        value: options.manager.getModuleByUID(
          options.data["commandButton"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["commandButtonLight"] = new ModuleSelectorOpener().options({
        text: "Command Button Light",
        value: options.manager.getModuleByUID(
          options.data["commandButtonLight"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["holdPosButton"] = new ModuleSelectorOpener().options({
        text: "Hold Pos Button ",
        value: options.manager.getModuleByUID(
          options.data["holdPosButton"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["holdPosButtonLight"] = new ModuleSelectorOpener().options({
        text: "Hold Pos Button Light",
        value: options.manager.getModuleByUID(
          options.data["holdPosButtonLight"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["anchorButton"] = new ModuleSelectorOpener().options({
        text: "Anchor Button",
        value: options.manager.getModuleByUID(
          options.data["anchorButton"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["anchorButtonLight"] = new ModuleSelectorOpener().options({
        text: "Anchor Button Light",
        value: options.manager.getModuleByUID(
          options.data["anchorButtonLight"]
        ) as any,
      }))
    );

    this.appendChild(
      new Button().options({
        text: "Save and Close",
        click: () => {
          if (dataValue["commandButton"].value) {
            options.data["commandButton"] =
              dataValue["commandButton"].value.uid;
          }
          if (dataValue["commandButtonLight"].value) {
            options.data["commandButtonLight"] =
              dataValue["commandButtonLight"].value.uid;
          }
          if (dataValue["holdPosButton"].value) {
            options.data["holdPosButton"] =
              dataValue["holdPosButton"].value.uid;
          }
          if (dataValue["holdPosButtonLight"].value) {
            options.data["holdPosButtonLight"] =
              dataValue["holdPosButtonLight"].value.uid;
          }
          if (dataValue["anchorButton"].value) {
            options.data["anchorButton"] = dataValue["anchorButton"].value.uid;
          }
          if (dataValue["anchorButtonLight"].value) {
            options.data["anchorButtonLight"] =
              dataValue["anchorButtonLight"].value.uid;
          }
          this.close(options.data);
        },
      })
    );
  }
}
defineElement(ButtonsGroupEdit);

type ActuatorsEditOptions = {
  nameArray: string;
  data: any;
  manager: ModuleManagerBase;
} & ContentBaseOptions;

export class ActuatorsEdit extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-crldp-actuators";
  }
  static elementNameSpace() {
    return "lmui";
  }

  constructor(options: ActuatorsEditOptions) {
    super();
    this.name = options.nameArray;
    let dataValue = [] as any;
    this.appendChild(
      (dataValue["propellerSB"] = new ModuleSelectorOpener().options({
        text: "Propeller Starboard",
        value: options.manager.getModuleByUID(
          options.data["propellerSB"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["propellerPS"] = new ModuleSelectorOpener().options({
        text: "Propeller Port ",
        value: options.manager.getModuleByUID(
          options.data["propellerPS"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["thruster"] = new ModuleSelectorOpener().options({
        text: "Thruster ",
        value: options.manager.getModuleByUID(options.data["thruster"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["rudderSB"] = new ModuleSelectorOpener().options({
        text: "Rudder Starboard",
        value: options.manager.getModuleByUID(options.data["rudderSB"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["rudderPS"] = new ModuleSelectorOpener().options({
        text: "Rudder Port",
        value: options.manager.getModuleByUID(options.data["rudderPS"]) as any,
      }))
    );

    this.appendChild(
      (dataValue["propellerSBFeedBack"] = new ModuleSelectorOpener().options({
        text: "Propeller Starboard Feedback",
        value: options.manager.getModuleByUID(
          options.data["propellerSBFeedBack"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["propellerPSFeedBack"] = new ModuleSelectorOpener().options({
        text: "Propeller Port Feedback",
        value: options.manager.getModuleByUID(
          options.data["propellerPSFeedBack"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["thrusterFeedBack"] = new ModuleSelectorOpener().options({
        text: "Thruster Feedback",
        value: options.manager.getModuleByUID(
          options.data["thrusterFeedBack"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["rudderSBFeedBack"] = new ModuleSelectorOpener().options({
        text: "Rudder Starboard Feedback",
        value: options.manager.getModuleByUID(
          options.data["rudderSBFeedBack"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["rudderPSFeedBack"] = new ModuleSelectorOpener().options({
        text: "Rudder Port Feedback",
        value: options.manager.getModuleByUID(
          options.data["rudderPSFeedBack"]
        ) as any,
      }))
    );

    this.appendChild(
      (dataValue["singelPropeller"] = new ModuleSelectorOpener().options({
        text: "Singel Propeller",
        value: options.manager.getModuleByUID(
          options.data["singelPropeller"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["singelRudder"] = new ModuleSelectorOpener().options({
        text: "singel Rudder",
        value: options.manager.getModuleByUID(
          options.data["singelRudder"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["bowThruster"] = new ModuleSelectorOpener().options({
        text: "Bow Thruster",
        value: options.manager.getModuleByUID(
          options.data["bowThruster"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["sternThruster"] = new ModuleSelectorOpener().options({
        text: "Stern Thruster",
        value: options.manager.getModuleByUID(
          options.data["sternThruster "]
        ) as any,
      }))
    );

    this.appendChild(
      (dataValue["singelPropellerFeedBack"] =
        new ModuleSelectorOpener().options({
          text: "Singel Propeller Feedback",
          value: options.manager.getModuleByUID(
            options.data["singelPropellerFeedBack"]
          ) as any,
        }))
    );
    this.appendChild(
      (dataValue["singelRudderFeedBack"] = new ModuleSelectorOpener().options({
        text: "singel Rudder Feedback",
        value: options.manager.getModuleByUID(
          options.data["singelRudderFeedBack"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["bowThrusterFeedBack"] = new ModuleSelectorOpener().options({
        text: "Bow Thruster Feedback",
        value: options.manager.getModuleByUID(
          options.data["bowThrusterFeedBack"]
        ) as any,
      }))
    );
    this.appendChild(
      (dataValue["sternThrusterFeedBack"] = new ModuleSelectorOpener().options({
        text: "Stern Thruster Feedback",
        value: options.manager.getModuleByUID(
          options.data["sternThrusterFeedBack"]
        ) as any,
      }))
    );

    this.appendChild(
      new Button().options({
        text: "Save and Close",
        click: () => {
          if (dataValue["propellerSB"].value) {
            options.data["propellerSB"] = dataValue["propellerSB"].value.uid;
          }
          if (dataValue["propellerPS"].value) {
            options.data["propellerPS"] = dataValue["propellerPS"].value.uid;
          }
          if (dataValue["thruster"].value) {
            options.data["thruster"] = dataValue["thruster"].value.uid;
          }
          if (dataValue["rudderSB"].value) {
            options.data["rudderSB"] = dataValue["rudderSB"].value.uid;
          }
          if (dataValue["rudderPS"].value) {
            options.data["rudderPS"] = dataValue["rudderPS"].value.uid;
          }

          if (dataValue["propellerSBFeedBack"].value) {
            options.data["propellerSBFeedBack"] =
              dataValue["propellerSBFeedBack"].value.uid;
          }
          if (dataValue["propellerPSFeedBack"].value) {
            options.data["propellerPSFeedBack"] =
              dataValue["propellerPSFeedBack"].value.uid;
          }
          if (dataValue["thrusterFeedBack"].value) {
            options.data["thrusterFeedBack"] =
              dataValue["thrusterFeedBack"].value.uid;
          }
          if (dataValue["rudderSBFeedBack"].value) {
            options.data["rudderSBFeedBack"] =
              dataValue["rudderSBFeedBack"].value.uid;
          }
          if (dataValue["rudderPSFeedBack"].value) {
            options.data["rudderPSFeedBack"] =
              dataValue["rudderPSFeedBack"].value.uid;
          }

          if (dataValue["singelPropeller"].value) {
            options.data["singelPropeller"] =
              dataValue["singelPropeller"].value.uid;
          }
          if (dataValue["singelRudder"].value) {
            options.data["singelRudder"] = dataValue["singelRudder"].value.uid;
          }
          if (dataValue["bowThruster"].value) {
            options.data["bowThruster"] = dataValue["bowThruster"].value.uid;
          }
          if (dataValue["sternThruster"].value) {
            options.data["sternThruster"] =
              dataValue["sternThruster"].value.uid;
          }

          if (dataValue["singelPropellerFeedBack"].value) {
            options.data["singelPropellerFeedBack"] =
              dataValue["singelPropellerFeedBack"].value.uid;
          }
          if (dataValue["singelRudderFeedBack"].value) {
            options.data["singelRudderFeedBack"] =
              dataValue["singelRudderFeedBack"].value.uid;
          }
          if (dataValue["bowThrusterFeedBack"].value) {
            options.data["bowThrusterFeedBack"] =
              dataValue["bowThrusterFeedBack"].value.uid;
          }
          if (dataValue["sternThrusterFeedBack"].value) {
            options.data["sternThrusterFeedBack"] =
              dataValue["sternThrusterFeedBack"].value.uid;
          }

          this.close(options.data);
        },
      })
    );
  }
}
defineElement(ActuatorsEdit);

/**Defines base options for creating content*/
type GpsDecimalEditOptions = {
  data: { latDec: number; lonDec: number; heading: number };
  nameArray: string;
  manager: ModuleManagerBase;
} & ContentBaseOptions;

export class GpsDecimalEdit extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-crldp-gps-decimal";
  }
  static elementNameSpace() {
    return "lmui";
  }

  /**This creates an instance of the editor*/
  constructor(options: GpsDecimalEditOptions) {
    super();
    this.name = options.nameArray;
    let dataValue = [] as any;
    this.appendChild(
      (dataValue["latDec"] = new ModuleSelectorOpener().options({
        text: "latDec",
        value: options.manager.getModuleByUID(options.data["latDec"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["lonDec"] = new ModuleSelectorOpener().options({
        text: "lonDec",
        value: options.manager.getModuleByUID(options.data["lonDec"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["heading"] = new ModuleSelectorOpener().options({
        text: "heading",
        value: options.manager.getModuleByUID(options.data["heading"]) as any,
      }))
    );

    this.appendChild(
      new Button().options({
        text: "Save and Close",
        click: () => {
          if (dataValue["latDec"].value) {
            options.data["latDec"] = dataValue["latDec"].value.uid;
          }
          if (dataValue["lonDec"].value) {
            options.data["lonDec"] = dataValue["lonDec"].value.uid;
          }
          if (dataValue["heading"].value) {
            options.data["heading"] = dataValue["heading"].value.uid;
          }

          this.close(options.data);
        },
      })
    );
  }
}
defineElement(GpsDecimalEdit);

/**Defines base options for creating content*/
type DpsPidEditOptions = {
  data: {
    kP: number;
    kI: number;
    kD: number;
    maxI: number;
    minI: number;
    maxOut: number;
    minOut: number;
  };
  nameArray: string;
} & ContentBaseOptions;

export class DpsPidEdit extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-crldp-dps-pid";
  }
  static elementNameSpace() {
    return "lmui";
  }

  /**This creates an instance of the editor*/
  constructor(options: DpsPidEditOptions) {
    super();
    this.name = options.nameArray;
    let dataValue = [] as any;
    this.appendChild(
      (dataValue["kP"] = new InputBox().options({
        text: "kP",
        type: InputBoxTypes.NUMBER,
        min: -200,
        max: 200,
        value: options.data["kP"],
      }))
    );
    this.appendChild(
      (dataValue["kI"] = new InputBox().options({
        text: "kI",
        type: InputBoxTypes.NUMBER,
        min: -200,
        max: 200,
        value: options.data["kI"],
      }))
    );
    this.appendChild(
      (dataValue["kD"] = new InputBox().options({
        text: "kD",
        type: InputBoxTypes.NUMBER,
        min: -200,
        max: 200,
        unit: "",
        value: options.data["kD"],
      }))
    );
    this.appendChild(
      (dataValue["maxI"] = new InputBox().options({
        text: "maxI",
        type: InputBoxTypes.NUMBER,
        min: -200,
        max: 200,
        unit: "",
        value: options.data["maxI"],
      }))
    );
    this.appendChild(
      (dataValue["minI"] = new InputBox().options({
        text: "minI",
        type: InputBoxTypes.NUMBER,
        min: -200,
        max: 200,
        unit: "",
        value: options.data["minI"],
      }))
    );
    this.appendChild(
      (dataValue["maxOut"] = new InputBox().options({
        text: "maxOut",
        type: InputBoxTypes.NUMBER,
        min: -200,
        max: 200,
        unit: "",
        value: options.data["maxOut"],
      }))
    );
    this.appendChild(
      (dataValue["minOut"] = new InputBox().options({
        text: "minOut",
        type: InputBoxTypes.NUMBER,
        min: -200,
        max: 200,
        unit: "",
        value: options.data["minOut"],
      }))
    );

    this.appendChild(
      new Button().options({
        text: "Save and Close",
        click: () => {
          if (dataValue["kP"].value) {
            options.data["kP"] = dataValue["kP"].value;
          }
          if (dataValue["kI"].value) {
            options.data["kI"] = dataValue["kI"].value;
          }
          if (dataValue["kD"].value) {
            options.data["kD"] = dataValue["kD"].value;
          }
          if (dataValue["maxI"].value) {
            options.data["maxI"] = dataValue["maxI"].value;
          }
          if (dataValue["minI"].value) {
            options.data["minI"] = dataValue["minI"].value;
          }
          if (dataValue["maxOut"].value) {
            options.data["maxOut"] = dataValue["maxOut"].value;
          }
          if (dataValue["minOut"].value) {
            options.data["minOut"] = dataValue["minOut"].value;
          }
          this.close(options.data);
        },
      })
    );
  }
}
defineElement(DpsPidEdit);

/**Defines base options for creating content*/
type DpsJoystickEditOptions = {
  data: {
    xVal: number;
    xMin: number;
    xMax: number;
    xZero: number;
    xDead: number;
    yVal: number;
    yMin: number;
    yMax: number;
    yZero: number;
    yDead: number;
    zVal: number;
    zMin: number;
    zMax: number;
    zZero: number;
    zDead: number;
  };
  nameArray: string;
  manager: ModuleManagerBase;
} & ContentBaseOptions;

function genInputBox(text: string, access?: boolean, value?: number) {
  return new InputBox().options({
    text: text,
    type: InputBoxTypes.NUMBER,
    min: 0,
    max: 32760,
    unit: "V",
    access: access ? AccessTypes.READ : AccessTypes.WRITE,
    value: value,
  });
}

export class DpsJoystickEdit extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-crldp-dps-joystick";
  }
  static elementNameSpace() {
    return "lmui";
  }

  minxset: InputBox;
  yset: InputBox;
  zset: InputBox;

  /**This creates an instance of the editor*/
  constructor(options: DpsJoystickEditOptions) {
    super();
    this.name = options.nameArray;
    let dataValue = [] as any;

    this.minxset = this.appendChild(genInputBox("Roll value", true));
    let xValue = options.manager.getModuleByUID(options.data["xVal"]);
    if (xValue) this.minxset.value = xValue.value;

    dataValue["xMin"] = this.appendChild(
      genInputBox("Roll Min", false, options.data["xMin"])
    );
    dataValue["xMax"] = this.appendChild(
      genInputBox("Roll Max", false, options.data["xMax"])
    );
    dataValue["xZero"] = this.appendChild(
      genInputBox("Roll Zero", false, options.data["xZero"])
    );

    this.appendChild(
      new Button().options({
        text: "Set RollMin",
        click: async () => {
          if (xValue) {
            dataValue["xMin"].value = this.minxset.value;
          }
        },
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set RollMax",
        click: async () => {
          if (xValue) {
            dataValue["xMax"].value = this.minxset.value;
          }
        },
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set RollZero",
        click: async () => {
          if (xValue) {
            dataValue["xZero"].value = this.minxset.value;
          }
        },
      })
    );
    dataValue["xDead"] = this.appendChild(
      new InputBox().options({
        text: "Roll Dead",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "",
        value: options.data["xDead"],
      })
    );

    let yValue = options.manager.getModuleByUID(options.data["yVal"]);
    this.yset = this.appendChild(
      new InputBox().options({
        text: "Pitch value",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        access: AccessTypes.READ,
      })
    );
    if (yValue) this.yset.value = yValue.value;

    dataValue["yMin"] = this.appendChild(
      new InputBox().options({
        text: "Pitch Min",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["yMin"],
      })
    );
    dataValue["yMax"] = this.appendChild(
      new InputBox().options({
        text: "Pitch Max",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["yMax"],
      })
    );
    dataValue["yZero"] = this.appendChild(
      new InputBox().options({
        text: "Pitch Zero",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["yZero"],
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set Pitch Min",
        click: async () => {
          if (yValue) {
            dataValue["yMin"].value = this.yset.value;
          }
        },
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set Pitch Max",
        click: async () => {
          if (yValue) {
            dataValue["yMax"].value = this.yset.value;
          }
        },
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set Pitch Zero",
        click: async () => {
          if (yValue) {
            dataValue["yZero"].value = this.yset.value;
          }
        },
      })
    );
    dataValue["yDead"] = this.appendChild(
      new InputBox().options({
        text: "Pitch Dead",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "",
        value: options.data["yDead"],
      })
    );

    let zValue = options.manager.getModuleByUID(options.data["zVal"]);
    this.zset = this.appendChild(
      new InputBox().options({
        text: "Yaw value",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        access: AccessTypes.READ,
      })
    );
    if (zValue) this.zset.value = zValue.value;
    dataValue["zMin"] = this.appendChild(
      new InputBox().options({
        text: "Yaw Min",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["zMin"],
      })
    );
    dataValue["zMax"] = this.appendChild(
      new InputBox().options({
        text: "Yaw Max",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["zMax"],
      })
    );
    dataValue["zZero"] = this.appendChild(
      new InputBox().options({
        text: "Yaw Zero",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["zZero"],
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set Yaw Min",
        click: async () => {
          if (zValue) {
            dataValue["zMin"].value = this.zset.value;
          }
        },
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set Yaw Max",
        click: async () => {
          if (zValue) {
            dataValue["zMax"].value = this.zset.value;
          }
        },
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set Yaw Zero",
        click: async () => {
          if (zValue) {
            dataValue["zZero"].value = this.zset.value;
          }
        },
      })
    );
    dataValue["zDead"] = this.appendChild(
      new InputBox().options({
        text: "Yaw Dead",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "",
        value: options.data["zDead"],
      })
    );

    dataValue["xVal"] = this.appendChild(
      new ModuleSelectorOpener().options({
        text: "Roll Val",
        value: options.manager.getModuleByUID(options.data["xVal"]) as any,
        change: (xval) => {
          this.minxset.value = xval.value;
        },
      })
    );
    this.appendChild(
      (dataValue["yVal"] = new ModuleSelectorOpener().options({
        text: "Pitch Val",
        value: options.manager.getModuleByUID(options.data["yVal"]) as any,
      }))
    );
    this.appendChild(
      (dataValue["zVal"] = new ModuleSelectorOpener().options({
        text: "Yaw Val",
        value: options.manager.getModuleByUID(options.data["zVal"]) as any,
      }))
    );

    this.appendChild(
      new Button().options({
        text: "Save and Close",
        click: () => {
          if (dataValue["xMin"].value) {
            options.data["xMin"] = dataValue["xMin"].value;
          }
          if (dataValue["xMax"].value) {
            options.data["xMax"] = dataValue["xMax"].value;
          }
          if (dataValue["xZero"].value) {
            options.data["xZero"] = dataValue["xZero"].value;
          }
          if (dataValue["xDead"].value) {
            options.data["xDead"] = dataValue["xDead"].value;
          }
          if (dataValue["yMin"].value) {
            options.data["yMin"] = dataValue["yMin"].value;
          }
          if (dataValue["yMax"].value) {
            options.data["yMax"] = dataValue["yMax"].value;
          }
          if (dataValue["yZero"].value) {
            options.data["yZero"] = dataValue["yZero"].value;
          }
          if (dataValue["yDead"].value) {
            options.data["yDead"] = dataValue["yDead"].value;
          }
          if (dataValue["zMin"].value) {
            options.data["zMin"] = dataValue["zMin"].value;
          }
          if (dataValue["zMax"].value) {
            options.data["zMax"] = dataValue["zMax"].value;
          }
          if (dataValue["zZero"].value) {
            options.data["zZero"] = dataValue["zZero"].value;
          }
          if (dataValue["zDead"].value) {
            options.data["zDead"] = dataValue["zDead"].value;
          }

          if (dataValue["xVal"].value) {
            options.data["xVal"] = dataValue["xVal"].value.uid;
          }
          if (dataValue["yVal"].value) {
            options.data["yVal"] = dataValue["yVal"].value.uid;
          }
          if (dataValue["zVal"].value) {
            options.data["zVal"] = dataValue["zVal"].value.uid;
          }

          this.close(options.data);
        },
      })
    );
  }
}
defineElement(DpsJoystickEdit);
