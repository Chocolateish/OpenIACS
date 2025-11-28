const degConst = 180 / Math.PI;
const radConst = Math.PI / 180;

/** Converts radians todegrees*/
export let radians_to_degrees = (radians: number) => {
  return radians * degConst;
};

/** Converts degrees to radians*/
export let degrees_to_radians = (degrees: number) => {
  return degrees * radConst;
};
