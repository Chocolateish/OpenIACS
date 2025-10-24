/**All functions in this library must follow this order of parameters, unneeded parameters are just skipped, but the order must be kept
 * x
 * y
 * width
 * height
 * angle
 */
let radConst = Math.PI / 180;
/** Converts degrees to radians*/
export let degreesToRadians = (degrees: number) => {
  return degrees * radConst;
};

let degConst = 180 / Math.PI;
/** Converts radians todegrees*/
export let radiansTodegrees = (radians: number) => {
  return radians * degConst;
};

/** Calculates the bounding box width and height of a rotated rectangle*/
export let widthAndHeightOfRotatedRectangle = (
  width: number,
  height: number,
  angle: number
) => {
  let ct = Math.cos(angle);
  let st = Math.sin(angle);
  let x = -width / 2;
  let y = height / 2;

  if (st > 0) {
    if (ct > 0) {
      return {
        width: -x * ct + y * st - (x * ct + -y * st),
        height: -x * st + y * ct - (x * st + -y * ct),
      };
    } else {
      return {
        width: x * ct + y * st - (-x * ct + -y * st),
        height: -x * st + -y * ct - (x * st + y * ct),
      };
    }
  } else {
    if (ct > 0) {
      return {
        width: -x * ct + -y * st - (x * ct + y * st),
        height: x * st + y * ct - (-x * st + -y * ct),
      };
    } else {
      return {
        width: x * ct + -y * st - (-x * ct + y * st),
        height: x * st + -y * ct - (-x * st + y * ct),
      };
    }
  }
};
