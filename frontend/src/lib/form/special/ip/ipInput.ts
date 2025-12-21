import { define_element } from "@libBase";
import type { IPAddress } from "../../../common/ip";
import { FormValueWrite, type FormValueOptions } from "../../base";
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

export interface IpInputOptions<ID extends string | undefined>
  extends FormValueOptions<string, ID> {
  /**Ip address type*/
  type: FormIpType;
}

class FormIpInput<ID extends string | undefined> extends FormValueWrite<
  IPAddress,
  ID
> {
  static element_name() {
    return "ipinput";
  }
  static element_name_space(): string {
    return "form";
  }

  #parts: HTMLInputElement[] = Array.from({ length: 6 }, () => {
    const inp = this.appendChild(document.createElement("input"));
    inp.type = "number";
    inp.maxLength = 3;
    return inp;
  });

  constructor(id?: ID) {
    super(id);
    this.appendChild(this.warn_input);
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

  protected new_value(val: IPAddress): void {}

  protected new_error(_val: string): void {}
}
define_element(FormIpInput);

export const form_ip_input = {
  /**Creates a color input form element */
  from<ID extends string | undefined>(
    options?: IpInputOptions<ID>
  ): FormIpInput<ID> {
    const input = new FormIpInput<ID>(options?.id);
    if (options) {
      FormValueWrite.apply_options(input, options);
    }
    return input;
  },
};
