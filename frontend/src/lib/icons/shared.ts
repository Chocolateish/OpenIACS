export let generateFunction = (name: string, icon: string) => {
  let svg: SVGSVGElement;
  return function (this: any) {
    if (svg) {
      return svg.cloneNode(true) as SVGSVGElement;
    } else {
      svg = new DOMParser().parseFromString(icon, "image/svg+xml")
        .firstChild as SVGSVGElement;
      svg.setAttribute("icon", name);
      return svg.cloneNode(true) as SVGSVGElement;
    }
  };
};
