// This code is from https://stackoverflow.com/questions/46593199/elliptical-arc-arrow-edge-d3-forced-layout
export const drawBendLine = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bend: number,
  aLen: number,
  aWidth: number,
  startArrow: boolean,
  endArrow: boolean,
  startRadius: number,
  endRadius: number
): void => {
  var mx, my, dist, nx, ny, x3, y3, cx, cy, radius, a1, a2;
  var arrowAng, aa1, aa2, b1;
  // find mid point
  mx = (x1 + x2) / 2;
  my = (y1 + y2) / 2;

  // get vector from start to end
  nx = x2 - x1;
  ny = y2 - y1;

  // find dist
  dist = Math.sqrt(nx * nx + ny * ny);

  // normalise vector
  nx /= dist;
  ny /= dist;

  // The next section has some optional behaviours
  // that set the dist from the line mid point to the arc mid point
  // You should only use one of the following sets

  //-- Uncomment for behaviour of arcs
  // This make the lines flatten at distance
  //b1 =  (bend * 300) / Math.pow(dist,1/4);

  //-- Uncomment for behaviour of arcs
  // Arc bending amount close to constant
  // b1 =  bend * dist * 0.5

  b1 = bend * dist;

  // Arc amount bend more at dist
  x3 = mx + ny * b1;
  y3 = my - nx * b1;

  // get the radius
  radius = (0.5 * ((x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3))) / b1;

  // use radius to get arc center
  cx = x3 - ny * radius;
  cy = y3 + nx * radius;

  // radius needs to be positive for the rest of the code
  radius = Math.abs(radius);

  // find angle from center to start and end
  a1 = Math.atan2(y1 - cy, x1 - cx);
  a2 = Math.atan2(y2 - cy, x2 - cx);

  // normalise angles
  a1 = (a1 + Math.PI * 2) % (Math.PI * 2);
  a2 = (a2 + Math.PI * 2) % (Math.PI * 2);
  // ensure angles are in correct directions
  if (bend < 0) {
    if (a1 < a2) {
      a1 += Math.PI * 2;
    }
  } else {
    if (a2 < a1) {
      a2 += Math.PI * 2;
    }
  }

  // convert arrow length to angular len
  arrowAng = (aLen / radius) * Math.sign(bend);

  // get angular length of start and end circles and move arc start and ends
  a1 += (startRadius / radius) * Math.sign(bend);
  a2 -= (endRadius / radius) * Math.sign(bend);
  aa1 = a1;
  aa2 = a2;

  // check for too close and no room for arc
  if ((bend < 0 && a1 < a2) || (bend > 0 && a2 < a1)) {
    return;
  }
  // is there a start arrow
  if (startArrow) {
    aa1 += arrowAng;
  } // move arc start to inside arrow
  // is there an end arrow
  if (endArrow) {
    aa2 -= arrowAng;
  } // move arc end to inside arrow

  // check for too close and remove arrows if so
  if ((bend < 0 && aa1 < aa2) || (bend > 0 && aa2 < aa1)) {
    startArrow = false;
    endArrow = false;
    aa1 = a1;
    aa2 = a2;
  }
  // draw arc
  context.beginPath();
  context.arc(cx, cy, radius, aa1, aa2, bend < 0);
  context.stroke();

  context.beginPath();

  // draw start arrow if needed
  if (startArrow) {
    context.moveTo(Math.cos(a1) * radius + cx, Math.sin(a1) * radius + cy);
    context.lineTo(
      Math.cos(aa1) * (radius + aWidth / 2) + cx,
      Math.sin(aa1) * (radius + aWidth / 2) + cy
    );
    context.lineTo(
      Math.cos(aa1) * (radius - aWidth / 2) + cx,
      Math.sin(aa1) * (radius - aWidth / 2) + cy
    );
    context.closePath();
  }

  // draw end arrow if needed
  if (endArrow) {
    context.moveTo(Math.cos(a2) * radius + cx, Math.sin(a2) * radius + cy);
    context.lineTo(
      Math.cos(aa2) * (radius - aWidth / 2) + cx,
      Math.sin(aa2) * (radius - aWidth / 2) + cy
    );
    context.lineTo(
      Math.cos(aa2) * (radius + aWidth / 2) + cx,
      Math.sin(aa2) * (radius + aWidth / 2) + cy
    );
    context.closePath();
  }
  context.fill();
};
