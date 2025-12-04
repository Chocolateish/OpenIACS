import { form_button } from "./button/button";
import { form_lamp } from "./lamp/lamp";
import { form_dropDown } from "./selectors/dropDown/dropDown";
import { form_toggle_button } from "./selectors/toggleButton/toggleButton";
import { form_switch } from "./switch/switch";
import { form_text } from "./text/text";

export let form = {
  button: form_button,
  text: form_text,
  switch: form_switch,
  lamp: form_lamp,
  dropdown: form_dropDown,
  toggle_button: form_toggle_button,
};
