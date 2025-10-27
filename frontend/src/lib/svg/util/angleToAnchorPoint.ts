import { SVGAnchorPoint } from "./anchorPoint";

/**Converts an angle to an anchor point
 * @param angle angle in radians*/
export let angleToAnchorPoint = (angle: number) => {
  let sec =
    angle >= 0
      ? angle % 6.283185307179586476925286766559
      : -(angle % 6.283185307179586476925286766559);
  if (sec > 5.934119456780720561540546) {
    return SVGAnchorPoint.middleRight;
  } else if (sec > 4.9741883681838392942325165) {
    return SVGAnchorPoint.topRight;
  } else if (sec > 4.4505895925855404211554095) {
    return SVGAnchorPoint.topCenter;
  } else if (sec > 3.49065850398865915384738) {
    return SVGAnchorPoint.topLeft;
  } else if (sec > 2.792526803190927323077904) {
    return SVGAnchorPoint.middleLeft;
  } else if (sec > 1.8325957145940460557698745) {
    return SVGAnchorPoint.bottomLeft;
  } else if (sec > 1.3089969389957471826927675) {
    return SVGAnchorPoint.bottomCenter;
  } else if (sec > 0.349065850398865915384738) {
    return SVGAnchorPoint.bottomRight;
  } else {
    return SVGAnchorPoint.middleRight;
  }
};
