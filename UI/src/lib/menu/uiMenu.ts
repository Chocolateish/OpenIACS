import { defineElement } from "@libBase";
import {
  Button,
  CollapsibleComponentGroup,
  Component,
  Stepper,
  ToggleButton,
  ToggleSwitch,
  Way,
} from "@libComponents";
import { theme, themeIterator } from "@libTheme";
import {
  Content,
  type WindowBase,
  animations,
  remToPx,
  scale,
  scrollBarStylesOptions,
  scrollStyle,
  touch,
} from "@libUI";
import "./uiMenu.scss";

/**UI Menu parts for extentions*/
export const UIMenuParts = {
  BASIC: "B",
  ADVANCED: "A",
} as const;
export type UIMenuParts = (typeof UIMenuParts)[keyof typeof UIMenuParts];

export class UIMenu extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "menu-ui";
  }

  themeSelector = this.appendChild(
    new ToggleButton().options({
      value: theme,
      options: themeIterator.map((e) => {
        return { text: e.name, value: e.value, symbol: e.symbol() };
      }),
    })
  );
  advancedGroup = this.appendChild(
    new CollapsibleComponentGroup().options({
      text: "Advanced Settings",
      way: Way.RIGHT,
      collapsed: true,
      components: [
        new ToggleSwitch().options({
          text: "Touch Mode",
          way: Way.LEFT,
          value: touch,
        }),
        new ToggleSwitch().options({
          text: "Animations",
          way: Way.LEFT,
          value: animations,
        }),
        new Stepper().options({
          text: "UI Scale",
          way: Way.DOWN,
          value: scale,
          step: 0.01,
          min: 0.5,
          max: 3,
          decimals: 2,
        }),
        new ToggleButton().options({
          text: "Scrollbar Style",
          value: scrollStyle,
          options: scrollBarStylesOptions.map((e) => {
            return { text: e.text, value: e.value };
          }),
        }),
      ],
    })
  );

  constructor() {
    super();
    if (this.ownerDocument.fullscreenEnabled) {
      this.advancedGroup.addComponent(
        new Button().options({
          text: "Toggle Fullscreen",
          click: () => {
            if (this.ownerDocument.fullscreenElement) {
              this.ownerDocument.exitFullscreen();
            } else {
              this.ownerDocument.documentElement.requestFullscreen();
            }
          },
        })
      );
    }
  }

  get minSize() {
    return { width: remToPx(18), height: remToPx(10) };
  }

  set toggle(hide) {
    (this.container as WindowBase).hide = hide;
  }

  get toggle() {
    return (this.container as WindowBase).hide;
  }

  /**For creation of toggle button*/
  get name(): string {
    return "UI Menu";
  }

  /**Add additional options to the*/
  addOption(comp: Component, part: UIMenuParts) {
    switch (part) {
      case UIMenuParts.BASIC:
        this.insertBefore(comp, this.advancedGroup);
        break;
      case UIMenuParts.ADVANCED:
        this.advancedGroup.addComponent(comp);
        break;
    }
  }
}
defineElement(UIMenu);
