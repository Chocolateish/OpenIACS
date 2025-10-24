const degConst = 180 / Math.PI;
const radConst = Math.PI / 180;

/** Converts radians todegrees*/
export let radiansTodegrees = (radians: number) => {
  return radians * degConst;
};

/** Converts degrees to radians*/
export let degreesToRadians = (degrees: number) => {
  return degrees * radConst;
};
