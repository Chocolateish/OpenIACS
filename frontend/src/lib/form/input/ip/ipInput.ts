import "./ipInput.scss"
import { defineElement } from "@chocolatelibui/core";
import { InputBase } from "../inputBase";

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
export class IpInput extends InputBase<string> {
    /**Returns the name used to define the element*/
    static elementName() { return 'ipinput' }

    constructor() {
        super();
        this._input.type = 'text';
        this._input.oninput = () => {
            let parts = (this._input.value).split('.');
            for (let i = 0; i < parts.length; i++) {
                let part = parseInt(parts[i]);
                if (i < parts.length - 1 || i == 3) {
                    if (part > 255) {
                        parts[i] = String(255);
                        continue;
                    }
                } else {
                    if (parts[i].length > 3 && i == parts.length - 1) {
                        parts[i + 1] = parts[i].substring(3);
                        parts[i] = parts[i].substring(0, 3);
                        continue;
                    }
                    if (part > 255) {
                        parts[i + 1] = parts[i].substring(2);
                        parts[i] = parts[i].substring(0, 2);
                        continue;
                    }
                }
            }
            parts.length = Math.min(parts.length, 4);
            this._input.value = parts.join('.');
        }

    }
}
defineElement(IpInput);
