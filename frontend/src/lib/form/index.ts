import { form_button } from "./boolean/button/button";
import { form_lamp } from "./boolean/lamp/lamp";
import { form_switch } from "./boolean/switch/switch";
import { form_progress } from "./number/progress/progress";
import { form_slider } from "./number/slider/slider";
import { form_dropDown } from "./selectors/dropDown/dropDown";
import { form_toggle_button } from "./selectors/toggleButton/toggleButton";
import { form_text } from "./text/text";

export let form = {
  //Boolean
  button: form_button,
  switch: form_switch,
  lamp: form_lamp,
  //Group

  //Input

  //Number
  progress: form_progress,
  slider: form_slider,
  //Selectors
  dropdown: form_dropDown,
  toggle_button: form_toggle_button,
  //Text
  text: form_text,
};
