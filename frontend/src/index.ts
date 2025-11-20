import { sleep } from "@libCommon";
import {
  contextDevider,
  contextLine,
  contextMenu,
  contextMenuDefault,
  contextSub,
} from "@libContextmenu";
import { Ok, ResultOk, Some, type Result } from "@libResult";
import { default as st, type STATE_SUB } from "@libState";
import "./index.scss";

let stat1 = st.d.roa.ok(sleep(1, 0.25));
let stat2 = st.d.roa.ok(sleep(1, 0.25));
let stat3 = st.d.roa.ok(sleep(1, 0.25));
let stat4 = st.d.roa.ok(sleep(1, 0.25));
let set = (val: ResultOk<number>) => {
  stat1.setOk(val.value / 4);
  stat2.setOk(val.value / 4);
  stat3.setOk(val.value / 4);
  stat4.setOk(val.value / 4);
};
let state = st.c.roa.from(
  (val) => Ok(val[0].value + val[1].value + val[2].value + val[3].value),
  stat1,
  stat2,
  stat3,
  stat4
);
let count = 0;
let sub1 = state.sub(() => {
  count++;
}, true);
await sleep(1);
let sub2 = state.sub(() => {
  count += 10;
});
set(Ok(8));
await sleep(1);
let sub3 = state.sub(() => {
  count += 100;
  throw new Error("Gaurded against crash");
});
set(Ok(12));
await sleep(1);
state.unsub(sub1);
state.unsub(sub2);
set(Ok(12));
await sleep(1);
state.unsub(sub3);

let [sub4, val] = await new Promise<[STATE_SUB<any>, Result<number, string>]>(
  (a) => {
    let sub4 = state.sub((val) => {
      count += 1000;
      a([sub4, val]);
    }) as STATE_SUB<any>;
    set(Ok(15));
  }
);
await sleep(1);
state.unsub(sub4);
console.warn(count);
// let sub2 = state.sub(() => {
//   count += 10;
// });
// stat1.setOk(2);
// stat2.setOk(2);
// stat3.setOk(2);
// stat4.setOk(2);

contextMenuDefault(() => {
  console.warn("No context menu defined, using default.");
  return Some(
    contextMenu(async () => {
      await new Promise((a) => {
        setTimeout(a, 50);
      });
      console.warn("No context menu defined, using default.");
      return [
        contextLine("Default Option 1", () => {
          console.log("Option 1 clicked");
        }),
        contextDevider(),
        contextLine("Default Option 1", () => {
          console.log("Option 1 clicked");
        }),
        contextSub(
          "Submenu",
          contextMenu([
            contextLine("Sub Option 1", () => {
              console.log("Sub Option 1 clicked");
            }),
            contextLine("Sub Option 2", () => {
              console.log("Sub Option 2 clicked");
            }),
          ])
        ),
        contextLine("Default Option 1", () => {
          console.log("Option 1 clicked");
        }),
        contextLine("Default Option 1", () => {
          console.log("Option 1 clicked");
        }),
        contextLine("Default Option 1", () => {
          console.log("Option 1 clicked");
        }),
        contextLine("Default Option 1", () => {
          console.log("Option 1 clicked");
        }),
        contextLine("Default Option 1", () => {
          console.log("Option 1 clicked");
        }),
        contextLine("Default Option 1", () => {
          console.log("Option 1 clicked");
        }),
      ];
    })
  );
});

// (async () => {})();

// let test = new WebSocket("ws://192.168.1.252:9001");
// test.onopen = () => {
//   console.log("Connection established");
// };
// test.onmessage = (event) => {
//   console.log("Message from server ", event.data);
//   document.getElementById("messages")!.innerHTML =
//     `<p>Received: ${event.data}</p>` +
//     document.getElementById("messages")!.innerHTML;
// };

// let lastMessage = "";
// document.getElementById("sendBtn")?.addEventListener("click", () => {
//   const input = document.getElementById("input") as HTMLInputElement;
//   if (input) {
//     sendMessage(input.value);
//     input.value = "";
//   }
// });
// document.getElementById("input")?.addEventListener("keydown", (event) => {
//   switch (event.key) {
//     case "Enter":
//       const input = document.getElementById("input") as HTMLInputElement;
//       if (input) {
//         sendMessage(input.value);
//         input.value = "";
//       }
//       break;
//     case "ArrowUp":
//       const inputUp = document.getElementById("input") as HTMLInputElement;
//       if (inputUp) {
//         inputUp.value = lastMessage;
//       }
//       break;
//   }
// });

// function sendMessage(msg: string) {
//   if (test.readyState === WebSocket.OPEN) {
//     lastMessage = msg;
//     test.send(msg);
//     document.getElementById("messages")!.innerHTML =
//       `<p>Sent: ${msg}</p>` + document.getElementById("messages")!.innerHTML;
//   } else {
//     console.error("WebSocket is not open. Ready state: " + test.readyState);
//   }
// }
