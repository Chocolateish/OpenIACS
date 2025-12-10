import type { Radians } from "../shared";

/**Finds a point on a circle
 * @param centerX x coordinate of circle center
 * @param centerY y coordinate of circle center
 * @param radius radius of circle
 * @param angle angle of point in radians*/
export const point_on_circle = (
  centerX: number,
  centerY: number,
  radius: number,
  angle: Radians
) => {
  return {
    x: radius * Math.cos(angle) + centerX,
    y: radius * Math.sin(angle) + centerY,
  };
};
