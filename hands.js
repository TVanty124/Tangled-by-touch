let FINGERS = [
  { lines: 7, width: 15,   pts: [[30, -30], [64, -54], [94, -64], [120, -61]] },  // thumb
  { lines: 8, width: 11,   pts: [[116, -30], [158, -42], [198, -46], [236, -40]] }, // index
  { lines: 9, width: 11.5, pts: [[124, -8], [166, -8], [200, 2], [222, 18]] },     // middle
  { lines: 8, width: 10.5, pts: [[118, 13], [152, 22], [176, 36], [190, 52]] },    // ring
  { lines: 7, width: 9,    pts: [[104, 32], [128, 44], [144, 58], [152, 72]] }     // little finger
];

//the red thread (on the little finger)
let TIE_POINT = { x: 128, y: 52 };

// builds a list of lines. every line is a list of points.
function makeHandLines() {
  let allLines = [];
  let total = 0;
  for (let f of FINGERS) total += f.lines;

  let count = 0;
  for (let f of FINGERS) {
    for (let j = 0; j < f.lines; j++) {
      // position across the arm 
      let armT = map(count, 0, total - 1, -1, 1);
      // position across this finger
      let fingerT = map(j, 0, f.lines - 1, -1, 1);

      let pts = [];
      // the arm: wide, and it goes off screen
      pts.push({ x: -760, y: 96 + armT * 50 });
      pts.push({ x: -420, y: 55 + armT * 45 });
      pts.push({ x: -150, y: 16 + armT * 40 });
      // the wrist
      pts.push({ x: 0, y: armT * 36 });
      // the finger gets thinner until all lines meet at the tip.
      let p = f.pts;
      let nearTip = [lerp(p[2][0], p[3][0], 0.6), lerp(p[2][1], p[3][1], 0.6)];
      let fingerPts = [p[0], p[1], p[2], nearTip, p[3]];
      let taper = [1, 0.9, 0.75, 0.5, 0];
      for (let k = 0; k < 5; k++) {
        pts.push({ x: fingerPts[k][0], y: fingerPts[k][1] + fingerT * f.width * taper[k] });
      }
      allLines.push(pts);
      count++;
    }
  }
  return allLines;
}

function drawHand(g, lines, x, y, angle, s, flip) {
  g.push();
  g.translate(x, y);
  g.rotate(angle);
  g.scale(s, flip ? -s : s);
  g.translate(-236, 40);  

  g.noFill();
  g.stroke(238, 232, 226, 150);
  g.strokeWeight(0.9 / s);

  for (let i = 0; i < lines.length; i++) {
    let pts = lines[i];
    g.beginShape();
    g.curveVertex(pts[0].x, pts[0].y);
    for (let p of pts) g.curveVertex(p.x, p.y);
    let last = pts[pts.length - 1];
    g.curveVertex(last.x, last.y);
    g.endShape();
  }

  g.stroke(212, 30, 42);
  g.strokeWeight(1.6 / s);
  for (let k = -1; k <= 1; k++) {
    g.line(TIE_POINT.x - 4 + k * 3, TIE_POINT.y - 20, TIE_POINT.x + k * 3, TIE_POINT.y);
  }
  g.pop();
}

function tiePosition(x, y, angle, s, flip) {
  let lx = (TIE_POINT.x - 236) * s;
  let ly = (TIE_POINT.y + 40) * s * (flip ? -1 : 1);
  return {
    x: x + lx * cos(angle) - ly * sin(angle),
    y: y + lx * sin(angle) + ly * cos(angle)
  };
}
