import { define_element } from "@libBase";
import { FormValueWrite } from "../../base";
import "./ipInput.scss";

// if (!/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/g.test(val)) {
//     return 'Invalid IP Address';
// }

// case InputBoxTypes.IP: {
//     let parts = val.split('.');
//     console.log(parts, start, end);
//     for (let i = 0; i < parts.length; i++) {
//         let part = parseInt(parts[i]);
//         if (i < parts.length - 1 || i == 3) {
//             if (part > 255) {
//                 parts[i] = 255;
//                 continue;
//             }
//         } else {
//             if (parts[i].length > 3 && i == parts.length - 1) {
//                 parts[i + 1] = parts[i].substring(3);
//                 parts[i] = parts[i].substring(0, 3);
//                 continue;
//             }
//             if (part > 255) {
//                 parts[i + 1] = parts[i].substring(2);
//                 parts[i] = parts[i].substring(0, 2);
//                 continue;
//             }
//         }
//     }
//     parts.length = Math.min(parts.length, 4);
//     this.__input.value = parts.join('.');
//     break;
// }

// case InputBoxTypes.IP:
//     if (text.search(/[^\d\.]/g) !== -1) {
//         ev.preventDefault();
//         return text + ' is not valid for and IP address';
//     }
//     break;

/**IP Address input*/
class FormIpInput<ID extends string | undefined> extends FormValueWrite<
  string,
  ID
> {
  static element_name() {
    return "ipinput";
  }
  static element_name_space(): string {
    return "form";
  }

  constructor(id?: ID) {
    super(id);
    // this._input.type = "text";
    // this._input.oninput = () => {
    //   const parts = this._input.value.split(".");
    //   for (let i = 0; i < parts.length; i++) {
    //     const part = parseInt(parts[i]);
    //     if (i < parts.length - 1 || i == 3) {
    //       if (part > 255) {
    //         parts[i] = String(255);
    //         continue;
    //       }
    //     } else {
    //       if (parts[i].length > 3 && i == parts.length - 1) {
    //         parts[i + 1] = parts[i].substring(3);
    //         parts[i] = parts[i].substring(0, 3);
    //         continue;
    //       }
    //       if (part > 255) {
    //         parts[i + 1] = parts[i].substring(2);
    //         parts[i] = parts[i].substring(0, 2);
    //         continue;
    //       }
    //     }
    //   }
    //   parts.length = Math.min(parts.length, 4);
    //   this._input.value = parts.join(".");
    // };
  }

  protected new_value(val: string): void {}

  protected new_error(_val: string): void {}
}
define_element(FormIpInput);
