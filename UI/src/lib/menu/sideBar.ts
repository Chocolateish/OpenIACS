import { defineElement } from "@libBase";
import "@libTheme";
import {
  Content,
  Context,
  pxToRem,
  UIWindow,
  type WindowBase,
  type WindowBaseOptions,
} from "@libUI";
import "./sideBar.scss";
import { TopBar } from "./topBar";

/**List of sided in topbar*/
export const SideBarSides = {
  TOP: "T",
  BOTTOM: "B",
} as const;
export type SideBarSides = (typeof SideBarSides)[keyof typeof SideBarSides];

export class SideMenu extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "side-menu";
  }

  topBar = this.appendChild(new TopBar());
  private __container = this.appendChild(document.createElement("div"));
  private _context = this.__container.appendChild(
    new Context().options({ dropTarget: false })
  );

  //@ts-expect-error
  readonly window: UIWindow;

  /**Toggles the side menu visibility
   * and accounts for page width
   * @param  tog set null to toggle*/
  set toggle(tog: boolean) {
    if (tog === null) {
      tog = !this.window.hide;
    }
    this.window.hide = tog;
    if (pxToRem(this.ownerDocument.defaultView!.innerWidth) < 30) {
      this.window.width = "100%";
      this.window.sizeable = false;
    } else {
      this.window.sizeable = "vr";
    }
  }

  /**Returns the visibility of the side menu*/
  get toggle(): boolean {
    return (this.container as WindowBase).hide;
  }

  /**Adds item to side bar*/
  addItem(side: string, item: Element) {
    switch (side) {
      case SideBarSides.TOP: {
        this.__container.insertBefore(item, this._context);
        break;
      }
      case SideBarSides.BOTTOM: {
        this.__container.appendChild(item);
        break;
      }
    }
    return item;
  }

  /**For creation of toggle button*/
  get name(): string {
    return "Side Menu";
  }
}
defineElement(SideMenu);

/**Creates an instance of the side menu*/
export let sideMenu = (windowOptions: WindowBaseOptions) => {
  let sideMenuInst = new SideMenu();
  //@ts-expect-error
  sideMenuInst.window = new UIWindow().options({
    content: sideMenuInst,
    title: false,
    hide: true,
    autoHide: true,
    layer: 99,
    left: 0,
    top: 0,
    height: "100%",
    position: "fixed",
    modal: true,
    dropTarget: false,
    ...windowOptions,
  });
  return sideMenuInst;
};
