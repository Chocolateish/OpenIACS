import { form_button } from "./boolean/button/button";
import { form_lamp } from "./boolean/lamp/lamp";
import { form_switch } from "./boolean/switch/switch";
import { form_group } from "./group/group";
import { form_number_input } from "./number/numberInput/numberInput";
import { form_progress } from "./number/progress/progress";
import { form_slider } from "./number/slider/slider";
import { form_stepper } from "./number/stepper/stepper";
import { form_dropDown } from "./selectors/dropDown/dropDown";
import { form_toggle_button } from "./selectors/toggleButton/toggleButton";
import { form_text_input } from "./text/input/textInput";
import { form_text_multiline } from "./text/multiLine/textMultiLine";
import { form_text } from "./text/text/text";

export const form = {
  //Boolean
  button: form_button,
  switch: form_switch,
  lamp: form_lamp,
  //Group
  group: form_group,

  //Input

  //Number
  progress: form_progress,
  input_number: form_number_input,
  slider: form_slider,
  stepper: form_stepper,
  //Selectors
  dropdown: form_dropDown,
  toggle_button: form_toggle_button,
  //Text
  text: form_text,
  input_text: form_text_input,
  multiline_text: form_text_multiline,
};
