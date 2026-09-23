class Thread {
  constructor(r, g, b, weight) {
    this.points = [];
    this.col = [r, g, b];
    this.weight = weight;
    this.length = 0;     
  }

  add(x, y) {
    let n = this.points.length;
    if (n > 0) {
      let last = this.points[n - 1];
      let d = dist(x, y, last.x, last.y);
      if (d < 6) return false;
      this.length += d;
    }
    this.points.push({ x: x, y: y });
    return true;
  }

  draw(alpha) {
    if (this.points.length < 2) return;
    noFill();
    stroke(this.col[0], this.col[1], this.col[2], alpha);
    strokeWeight(this.weight);
    beginShape();
    for (let p of this.points) vertex(p.x, p.y);
    endShape();
  }
}

function linesCross(a, b, c, d) {
  let den = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (den == 0) return null; 
  let t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / den;
  let u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / den;
  if (t > 0 && t < 1 && u > 0 && u < 1) {
    return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  }
  return null;
}


class Knot {
  constructor(x, y, shared, first) {
    this.x = x;
    this.y = y;
    this.shared = shared;  
    this.first = first;   
    this.born = frameCount;
    this.angle = random(TWO_PI);
  }

  draw(mode) {
    let age = frameCount - this.born;
    let tight = min(age / 30, 1);
    let size = (this.first ? 7 : 3.5) * (2 - tight);

    noStroke();
    let glow = mode == 'scar' ? 20 : 45 + max(0, 60 - age);
    if (this.shared) fill(255, 200, 190, glow * 0.6);
    else fill(255, 60, 50, glow * 0.6);
    circle(this.x, this.y, size * 4.5);

    noFill();
    if (mode == 'scar') stroke(120, 14, 22);
    else if (this.shared) stroke(236, 190, 182);
    else stroke(255, 72, 58);
    strokeWeight(1.1);
    push();
    translate(this.x, this.y);
    rotate(this.angle + (1 - tight) * 2);
    for (let i = 0; i < 3; i++) {
      rotate(TWO_PI / 3);
      ellipse(size * 0.45, 0, size * 1.3, size * 0.7);
    }
    pop();
  }
}
class Rope {
  constructor(x1, y1, x2, y2, count, lengthScale) {
    this.points = [];
    for (let i = 0; i < count; i++) {
      let x = lerp(x1, x2, i / (count - 1));
      let y = lerp(y1, y2, i / (count - 1));
      this.points.push({ x: x, y: y, oldX: x, oldY: y });
    }
    this.setLength(dist(x1, y1, x2, y2) * lengthScale);
    this.cut = false;
  }

  setLength(total) {
    this.gap = total / (this.points.length - 1);
  }

  update(x1, y1, x2, y2, gravity) {
    let pts = this.points;
    for (let p of pts) {
      let vx = (p.x - p.oldX) * 0.9;
      let vy = (p.y - p.oldY) * 0.9;
      p.oldX = p.x;
      p.oldY = p.y;
      p.x += vx;
      p.y += vy + gravity;
    }

    for (let k = 0; k < 8; k++) {
      pts[0].x = x1;
      pts[0].y = y1;
      if (!this.cut) {
        pts[pts.length - 1].x = x2;
        pts[pts.length - 1].y = y2;
      }
      for (let i = 0; i < pts.length - 1; i++) {
        let a = pts[i];
        let b = pts[i + 1];
        let d = dist(a.x, a.y, b.x, b.y);
        if (d < this.gap || d == 0) continue;   
        let diff = (d - this.gap) / d / 2;
        let dx = (b.x - a.x) * diff;
        let dy = (b.y - a.y) * diff;
        a.x += dx; a.y += dy;
        b.x -= dx; b.y -= dy;
      }
    }
  }
  pluck(mx, my, vx, vy) {
    let hit = false;
    for (let p of this.points) {
      if (dist(mx, my, p.x, p.y) < 40) {
        p.x += vx * 0.2;
        p.y += vy * 0.2;
        hit = true;
      }
    }
    return hit;
  }

  draw(alpha, weight) {
    noFill();
    stroke(212, 30, 42, alpha);
    strokeWeight(weight);
    beginShape();
    curveVertex(this.points[0].x, this.points[0].y);
    for (let p of this.points) curveVertex(p.x, p.y);
    let last = this.points[this.points.length - 1];
    curveVertex(last.x, last.y);
    endShape();
  }
}
