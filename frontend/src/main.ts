import "@result";
import "./main.scss";

(async () => {})();

let test = new WebSocket("ws://192.168.1.252:9001");
test.onopen = () => {
  console.log("Connection established");
};
test.onmessage = (event) => {
  console.log("Message from server ", event.data);
  document.getElementById("messages")!.innerHTML =
    `<p>Received: ${event.data}</p>` +
    document.getElementById("messages")!.innerHTML;
};

let lastMessage = "";
document.getElementById("sendBtn")?.addEventListener("click", () => {
  const input = document.getElementById("input") as HTMLInputElement;
  if (input) {
    sendMessage(input.value);
    input.value = "";
  }
});
document.getElementById("input")?.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "Enter":
      const input = document.getElementById("input") as HTMLInputElement;
      if (input) {
        sendMessage(input.value);
        input.value = "";
      }
      break;
    case "ArrowUp":
      const inputUp = document.getElementById("input") as HTMLInputElement;
      if (inputUp) {
        inputUp.value = lastMessage;
      }
      break;
  }
});

function sendMessage(msg: string) {
  if (test.readyState === WebSocket.OPEN) {
    lastMessage = msg;
    test.send(msg);
    document.getElementById("messages")!.innerHTML =
      `<p>Sent: ${msg}</p>` + document.getElementById("messages")!.innerHTML;
  } else {
    console.error("WebSocket is not open. Ready state: " + test.readyState);
  }
}
