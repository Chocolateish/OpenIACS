import { secondsCountDownFormatted } from "@libCommon";
import { Module, registerModule } from "@module/module";

export class MODMA extends Module {
  /**Returns whether the module has settings*/
  get hasStatusValues() {
    return true;
  }

  /**Returns the function used to generate the text*/
  protected ___statusText(): (values: any[]) => string {
    return (values) => {
      let user = this.manager.getUserById(values[1]);
      let username: string;
      if (user) username = user.name;
      else username = "None";
      return `V${this.manager.version} System: ${
        this.manager.ipAddress
      } Uptime:${secondsCountDownFormatted(
        values[0],
        2
      )} Logged In User:${username}`;
    };
  }

  /**Overrideable method to generate*/
  get browserActions(): { text: string; action: () => void }[] {
    return [
      {
        text: "Login",
        action: () => {
          this.manager.loginPrompt();
        },
      },
      {
        text: "Logout",
        action: () => {
          this.manager.logout();
        },
      },
    ];
  }
}
registerModule("MODMA", MODMA);
