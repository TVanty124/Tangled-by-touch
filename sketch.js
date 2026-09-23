let scene = 'landing';
let chapter = 0;
let ending = null;         
let sceneTimer = 0;         

let narrator;
let handLines;
let handsLayer;             

// the needle follows the mouse
let needle = { x: 0, y: 0, angle: 0 };
let other = { x: 0, y: 0, alpha: 0 };
let myThread, otherThread;
let knots = [];
let tether = null;         
let landRope, prologueRope;

// story state
let met = false;
let beat = 0;          
let firstSelf = false;
let firstShared = false;
let saidTooFast = false;
let saidCloser = false;
let slowDown = 1;           
let tension = 0;
let lowestFreedom = 100;
let holdTime = 0;           
let stillTime = 0;          
let nearCount = 0;          
let lastMouseMove = 0;
let fade = 0;              
let nextScene = null;
let metFrame = 0, endFrame = 0;

let sounds = {};
let soundOn = true;
let audioStarted = false;
let aboutBtn, soundBtn, saveBtn, againBtn;


let BG = [10, 8, 9];
let INK = [238, 232, 226];
let RED = [212, 30, 42];


function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noCursor();
  narrator = new Narrator();
  handLines = makeHandLines();
  makeHandsLayer();
  makeLandRope();

  let names = ['ambient', 'tension', 'touch', 'chime', 'tie', 'heartbeat', 'snip'];
  for (let n of names) {
    sounds[n] = loadSound(SOUND_DATA[n], () => {}, () => { sounds[n] = null; });
  }

  // buttons made with p5
  aboutBtn = createButton('About');
  aboutBtn.position(20, height - 50);
  aboutBtn.addClass('btn');
  aboutBtn.mousePressed(() => select('#about').toggleClass('open'));

  soundBtn = createButton('Sound: on');
  soundBtn.position(95, height - 50);
  soundBtn.addClass('btn');
  soundBtn.mousePressed(toggleSound);

  saveBtn = createButton('Save your tangle');
  saveBtn.addClass('btn red');
  saveBtn.mousePressed(() => saveCanvas('my-tangle', 'png'));
  againBtn = createButton('Begin again');
  againBtn.addClass('btn');
  againBtn.mousePressed(() => changeScene('landing'));
  saveBtn.hide();
  againBtn.hide();

  select('#closeAbout').mousePressed(() => select('#about').removeClass('open'));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  aboutBtn.position(20, height - 50);
  soundBtn.position(95, height - 50);
  makeHandsLayer();
  makeLandRope();
}


function draw() {
  background(BG);
  sceneTimer++;

  if (mouseX != pmouseX || mouseY != pmouseY) lastMouseMove = millis();

  if (scene == 'landing') drawLanding();
  else if (scene == 'prologue') drawPrologue();
  else if (scene == 'story') drawStory();
  else if (scene == 'poster') drawPoster();

  narrator.update();
  narrator.draw(scene == 'prologue');
  if (scene == 'story') drawHUD();
  drawCursor();
  updateSound();
  drawFade();
}

//LANDING// 

function handLayout() {
  let portrait = height > width;
  let angle = portrait ? -1.1 : -atan2(height, width) * 0.8;
  let s = portrait ? min(width / 430, height / 900) * 0.85 : min(width / 1300, height / 820) * 1.3;
  let cx = portrait ? width * 0.5 : width * 0.55;
  let cy = portrait ? height * 0.63 : height * 0.56;
  let gap = 14 * s;
  return {
    angle: angle, s: s,
    x1: cx - cos(angle) * gap, y1: cy - sin(angle) * gap,
    x2: cx + cos(angle) * gap, y2: cy + sin(angle) * gap
  };
}

function makeHandsLayer() {
  let h = handLayout();
  handsLayer = createGraphics(width, height);
  handsLayer.pixelDensity(1);
  drawHand(handsLayer, handLines, h.x1, h.y1, h.angle, h.s, false);
  drawHand(handsLayer, handLines, h.x2, h.y2, h.angle + PI, h.s, true);
}

function makeLandRope() {
  let h = handLayout();
  let a = tiePosition(h.x1, h.y1, h.angle, h.s, false);
  let b = tiePosition(h.x2, h.y2, h.angle + PI, h.s, true);
  landRope = new Rope(a.x, a.y, b.x, b.y, 30, 1.4);
  landRope.baseLength = dist(a.x, a.y, b.x, b.y);
}

function drawLanding() {
  let h = handLayout();
  let appear = min(sceneTimer / 90, 1);

  image(handsLayer, 0, 0);
  noStroke();
  fill(BG[0], BG[1], BG[2], 255 * (1 - appear));
  rect(0, 0, width, height);
  if (mouseIsPressed) holdTime += deltaTime / 1000;
  else holdTime = max(0, holdTime - deltaTime / 500);
  let pull = min(holdTime / 0.7, 1);  

  let a = tiePosition(h.x1, h.y1, h.angle, h.s, false);
  let b = tiePosition(h.x2, h.y2, h.angle + PI, h.s, true);
  landRope.setLength(landRope.baseLength * lerp(1.4, 1, pull));
  if (landRope.pluck(mouseX, mouseY, mouseX - pmouseX, mouseY - pmouseY) && frameCount % 12 == 0) {
    playTouch(mouseY / height, false);
  }
  landRope.update(a.x, a.y, b.x, b.y, 0.25);
  landRope.draw(255 * appear, 1.6 + pull * 1.5);

  let portrait = height > width;
  let size = portrait ? constrain(width * 0.15, 40, 80) : constrain(width * 0.075, 46, 120);
  let tx = portrait ? 30 : width * 0.06;
  let ty = portrait ? 60 : height * 0.12;
  noStroke();
  fill(INK[0], INK[1], INK[2], 255 * appear);
  textAlign(LEFT, TOP);
  textFont('LoraMedium');
  textSize(size);
  text('Tangled', tx, ty);
  textFont('LoraItalic');
  text('by Touch', tx + size * (portrait ? 0.5 : 0.9), ty + size * 1.05);

  stroke(RED);
  strokeWeight(1.3);
  line(tx, ty + size * 2.45, tx + 45, ty + size * 2.45);
  noStroke();
  fill(RED);
  textFont('PlexMono');
  textSize(10);
  textAlign(LEFT, CENTER);
  text('THE RED THREAD OF FATE', tx + 58, ty + size * 2.45);

  fill(INK[0], INK[1], INK[2], 200);
  textFont('LoraItalic');
  textSize(portrait ? 15 : 17);
  textAlign(LEFT, TOP);
  text('An old story says a red thread ties two people who are meant to meet. ' +
       'This one asks what happens when it holds too tightly.',
       tx, ty + size * 2.45 + 20, portrait ? width - 60 : min(360, width * 0.3));

  let bx = portrait ? width / 2 : width * 0.82;
  let by = height - 80;
  noFill();
  stroke(INK[0], INK[1], INK[2], 90);
  strokeWeight(1);
  circle(bx, by, 46);
  stroke(RED);
  strokeWeight(2);
  if (pull > 0) arc(bx, by, 46, 46, -HALF_PI, -HALF_PI + TWO_PI * pull);
  noStroke();
  fill(INK);
  textFont('LoraItalic');
  textSize(16);
  textAlign(CENTER, TOP);
  text(pull > 0 ? 'tying the thread...' : 'Press & hold to begin', bx, by + 34);

  if (pull >= 1 && nextScene == null) {
    playSound('tie', 0.6);
    changeScene('prologue');
  }
}
// PROLOGUE// 

function startPrologue() {
  narrator.clear();
  for (let l of PROLOGUE) narrator.say(l);
  prologueRope = new Rope(width * 0.15, height * 0.65, width * 0.85, height * 0.6, 40, 1.12);
}

function drawPrologue() {
  let ax = width * 0.15, ay = height * 0.65 + sin(frameCount * 0.01) * 10;
  let bx = width * 0.85, by = height * 0.6 + cos(frameCount * 0.012) * 10;
  prologueRope.pluck(mouseX, mouseY, mouseX - pmouseX, mouseY - pmouseY);
  prologueRope.update(ax, ay, bx, by, 0.05);
  prologueRope.draw(min(sceneTimer / 400, 1) * 230 + 20, 1.4);

  noStroke();
  fill(255, 236, 230);
  circle(ax, ay, 6);
  circle(bx, by, 6);

  fill(128, 120, 116);
  textFont('PlexMono');
  textSize(10);
  textAlign(CENTER, BOTTOM);
  text('PROLOGUE  ·  CLICK TO CONTINUE', width / 2, height - 30);

  if (!narrator.busy() && sceneTimer > 60 && nextScene == null) changeScene('story');
}

// THE STORY (chapters 1 - 4)//

function startStory() {
  knots = [];
  myThread = new Thread(212, 30, 42, 1.4);
  otherThread = new Thread(236, 190, 182, 1);
  tether = null;
  met = false;
  ending = null;
  firstSelf = false;
  firstShared = false;
  saidTooFast = false;
  saidCloser = false;
  slowDown = 1;
  tension = 0;
  lowestFreedom = 100;
  needle.x = mouseX;
  needle.y = mouseY;
  other.x = mouseX < width / 2 ? width * 0.8 : width * 0.2;
  other.y = random(height * 0.2, height * 0.8);
  other.alpha = 0;
  startChapter(1);
}

function startChapter(n) {
  chapter = n;
  sceneTimer = 0;
  beat = 0;
  narrator.clear();
  narrator.showCard(n);
  if (n == 1) for (let l of LINES.ch1Start) narrator.say(l);
  if (n == 3) narrator.say(LINES.ch3[0].text);
  if (n == 4) {
    for (let l of LINES.ch4) narrator.say(l);
    needle.stuckX = needle.x;
    needle.stuckY = needle.y;
  }
}

function drawStory() {
  if (ending == null) {
    moveNeedle();
    if (!met) moveOtherBeforeMeeting();
    else moveOtherAfterMeeting();
    if (met) {
      updateTether();
      layThread();
    }
    storyEvents();
  } else {
    updateEnding();
  }

  nearCount = knotsNear(needle.x, needle.y);   
  let target = ending ? 0 : max(1 - slowDown, nearCount / 12);
  tension = lerp(tension, min(target, 1), 0.05);
  lowestFreedom = min(lowestFreedom, round((1 - tension) * 100));

  push();
  if (chapter >= 3 && !ending) translate(random(-1, 1) * tension, random(-1, 1) * tension);

  let threadAlpha = ending == 'cut' ? 90 : ending == 'rest' ? 140 : 230;
  otherThread.draw(threadAlpha * 0.8 * max(other.alpha, 0.3));
  myThread.draw(threadAlpha);
  if (tether) tether.draw(220, 1.2 + tension);
  for (let k of knots) k.draw(ending == 'cut' ? 'scar' : 'live');
  drawOther();
  pop();

  if (chapter >= 3) {
    noFill();
    stroke(120, 0, 10, tension * 90);
    strokeWeight(80);
    rect(0, 0, width, height);
  }

  if (chapter == 4 && ending == null && !narrator.busy()) drawChoice();
}

function moveNeedle() {

  if (chapter == 4) {
    slowDown = 0;
    let effort = min(dist(mouseX, mouseY, needle.x, needle.y) / 200, 1);
    needle.x = needle.stuckX + random(-2, 2) * effort;
    needle.y = needle.stuckY + random(-2, 2) * effort;
    return;
  }

  let speed = 0.35 * slowDown;

  if (chapter == 3) speed = speed / (1 + nearCount * 0.15);

  let dx = (mouseX - needle.x) * speed;
  let dy = (mouseY - needle.y) * speed;
  needle.x += dx;
  needle.y += dy;
  if (abs(dx) + abs(dy) > 0.5) needle.angle = atan2(dy, dx);

  if (chapter == 3) slowDown = map(min(sceneTimer, 1500), 0, 1500, 1, 0.15);
}

function knotsNear(x, y) {
  let count = 0;
  for (let k of knots) {
    if (dist(x, y, k.x, k.y) < 60) count++;
  }
  return count;
}

function moveOtherBeforeMeeting() {
  if (sceneTimer > 330) other.alpha = min(other.alpha + 0.01, 1);

  let tx = width * (0.1 + 0.8 * noise(frameCount * 0.002));
  let ty = height * (0.1 + 0.8 * noise(100 + frameCount * 0.002));

  let d = dist(needle.x, needle.y, other.x, other.y);
  let mouseSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);
  if (d < 280 && other.alpha > 0.5) {
    if (mouseSpeed > 12) {

      tx = other.x + (other.x - needle.x);
      ty = other.y + (other.y - needle.y);
      if (!saidTooFast) { narrator.say(LINES.tooFast); saidTooFast = true; }
    } else {
      tx = lerp(tx, needle.x, 0.6);
      ty = lerp(ty, needle.y, 0.6);
    }
  }
  if (sceneTimer > 1800 && !saidCloser) { narrator.say(LINES.closer); saidCloser = true; }
  if (sceneTimer > 1800) { tx = lerp(tx, needle.x, 0.5); ty = lerp(ty, needle.y, 0.5); }

  other.x += (constrain(tx, 30, width - 30) - other.x) * 0.02;
  other.y += (constrain(ty, 30, height - 30) - other.y) * 0.02;

  if (other.alpha > 0.6 && d < 35) {
    met = true;
    metFrame = frameCount;
    otherThread.points = [];  
    knots.push(new Knot((needle.x + other.x) / 2, (needle.y + other.y) / 2, true, true));
    tether = new Rope(needle.x, needle.y, other.x, other.y, 24, 1);
    tether.setLength(300);
    playSound('tie', 0.6);
    narrator.clear();
    for (let l of LINES.met) narrator.say(l);
  }
}

function moveOtherAfterMeeting() {
  let mouseSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);
  let angle = frameCount * 0.01 + noise(frameCount * 0.005) * 4;
  let r = 110 + 60 * noise(50 + frameCount * 0.004);
  if (chapter >= 3) r = r * slowDown;
  let tx = constrain(needle.x + cos(angle) * r, 60, width - 60);
  let ty = constrain(needle.y + sin(angle) * r, 60, height - 60);
  let speed = min(mouseSpeed, 10) * 0.004 * slowDown;
  other.x += (tx - other.x) * speed;
  other.y += (ty - other.y) * speed;
  other.alpha = 1;
}

function updateTether() {
  let len = 300;
  if (chapter >= 3) len = max(70, map(slowDown, 1, 0.15, 300, 70));
  tether.setLength(len);
  let d = dist(needle.x, needle.y, other.x, other.y);
  if (d > len) {
    let pull = (d - len) / d;
    other.x -= (other.x - needle.x) * pull * 0.5;
    other.y -= (other.y - needle.y) * pull * 0.5;
    if (chapter >= 3) {
      needle.x += (other.x - needle.x) * pull * 0.1;
      needle.y += (other.y - needle.y) * pull * 0.1;
    }
  }
  tether.update(needle.x, needle.y, other.x, other.y, 0.08);
}

function layThread() {
  if (myThread.add(needle.x, needle.y)) {
    let p = myThread.points;
    let n = p.length;
    if (n >= 2) {
      let a = p[n - 2];
      let b = p[n - 1];
      for (let i = 0; i < n - 4; i++) {
        let hit = linesCross(a, b, p[i], p[i + 1]);
        if (hit) makeKnot(hit.x, hit.y, false);
      }
      let q = otherThread.points;
      for (let i = 0; i < q.length - 1; i++) {
        let hit = linesCross(a, b, q[i], q[i + 1]);
        if (hit) makeKnot(hit.x, hit.y, true);
      }
    }
  }
  otherThread.add(other.x, other.y);
}

function makeKnot(x, y, shared) {
  knots.push(new Knot(x, y, shared, false));
  playTouch(y / height, shared);
  if (!shared && !firstSelf) { firstSelf = true; narrator.say(LINES.firstSelf); }
  if (shared && !firstShared) { firstShared = true; narrator.say(LINES.firstShared); }
}

function storyEvents() {
  let n = knots.length;
  if (narrator.card != null) return;

  if (chapter == 1 && met && !narrator.busy()) startChapter(2);

  if (chapter == 2) {
    let next = LINES.ch2[beat];
    if (next && n >= next.at && !narrator.busy()) { narrator.say(next.text); beat++; }
    if (n >= 30 && beat >= LINES.ch2.length && !narrator.busy()) startChapter(3);
  }

  if (chapter == 3) {
    let next = LINES.ch3[beat + 1];
    if (next && n >= next.at && !narrator.busy()) { narrator.say(next.text); beat++; }
    if (((n >= 50 && sceneTimer > 1500) || sceneTimer > 3000) && !narrator.busy()) startChapter(4);
  }

  if (chapter == 4 && !narrator.busy()) {
    if (millis() - lastMouseMove > 300 && !mouseIsPressed) stillTime += deltaTime / 1000;
    else stillTime = 0;
    if (mouseIsPressed) holdTime += deltaTime / 1000;
    else holdTime = 0;

    if (stillTime > 4) startEnding('rest');     
    if (holdTime > 2.5) startEnding('cut');    
  }
}

function startEnding(type) {
  ending = type;
  endFrame = frameCount;
  sceneTimer = 0;
  narrator.clear();
  for (let l of LINES[type]) narrator.say(l);
  if (type == 'cut') {
    playSound('snip', 0.8);
    tether.cut = true;
  } else {
    playSound('tie', 0.5);
  }
}

function updateEnding() {
  slowDown = lerp(slowDown, ending == 'cut' ? 1 : 0.5, 0.02);
  needle.x += (mouseX - needle.x) * 0.35 * slowDown;
  needle.y += (mouseY - needle.y) * 0.35 * slowDown;

  if (ending == 'rest') {
    other.x = lerp(other.x, needle.x + 25, 0.02);
    other.y = lerp(other.y, needle.y - 18, 0.02);
    tether.setLength(250);
    tether.update(needle.x, needle.y, other.x, other.y, 0.15);
  } else {
    other.x += (other.x - needle.x) * 0.01;
    other.y += (other.y - needle.y) * 0.01;
    other.alpha = max(0, other.alpha - 0.008);
    tether.update(needle.x, needle.y, other.x, other.y, 0.2);
  }

  if (sceneTimer > 720 && !narrator.busy() && nextScene == null) changeScene('poster');
}

function drawOther() {
  if (other.alpha <= 0) return;
  noStroke();
  fill(236, 190, 182, 50 * other.alpha);
  circle(other.x, other.y, 26 + sin(frameCount * 0.05) * 5);
  fill(255, 236, 230, 230 * other.alpha);
  circle(other.x, other.y, 6);

  if (!met) {
    otherThread.add(other.x, other.y);
    if (otherThread.points.length > 60) otherThread.points.shift();
  }
}

function drawChoice() {
  let y = height * 0.84;
  noStroke();
  fill(BG[0], BG[1], BG[2], 200);
  rect(0, y - 30, width, height - y + 30);

  textAlign(CENTER, TOP);
  textFont('LoraItalic');
  textSize(22);
  fill(INK);
  text('Stay still', width * 0.35, y);
  text('Hold', width * 0.65, y);
  textFont('PlexMono');
  textSize(9);
  fill(128, 120, 116);
  text('AND LET IT REST', width * 0.35, y + 32);
  text('TO CUT THE THREAD', width * 0.65, y + 32);

  stroke(70);
  strokeWeight(2);
  line(width * 0.35 - 70, y + 55, width * 0.35 + 70, y + 55);
  line(width * 0.65 - 70, y + 55, width * 0.65 + 70, y + 55);
  stroke(INK);
  line(width * 0.35 - 70, y + 55, width * 0.35 - 70 + 140 * min(stillTime / 4, 1), y + 55);
  stroke(255, 72, 58);
  line(width * 0.65 - 70, y + 55, width * 0.65 - 70 + 140 * min(holdTime / 2.5, 1), y + 55);
}

function drawHUD() {
  if (narrator.card != null) return;
  noStroke();
  textFont('PlexMono');
  textSize(10);

  fill(INK[0], INK[1], INK[2], 200);
  textAlign(LEFT, TOP);
  text('TANGLED BY TOUCH', 25, 25);

  textAlign(RIGHT, TOP);
  let label = ending ? 'EPILOGUE' : 'CHAPTER ' + chapter + ' / 4  —  ' + CHAPTERS[chapter].title.toUpperCase();
  text(label, width - 25, 25);

  if (met) {
    textAlign(RIGHT, BOTTOM);
    fill(128, 120, 116);
    text('KNOTS ' + knots.length + '   FREEDOM ' + round((1 - tension) * 100) + '%', width - 25, height - 25);
  }
}

function drawCursor() {
  if (scene == 'story') {
    push();
    translate(needle.x, needle.y);
    rotate(needle.angle);
    stroke(INK);
    strokeWeight(1.4);
    line(-20, 0, 6, 0);
    noFill();
    strokeWeight(1);
    ellipse(-16, 0, 6, 2.5);
    pop();
  } else {
    noFill();
    stroke(INK);
    strokeWeight(1);
    circle(mouseX, mouseY, 14);
    point(mouseX, mouseY);
  }
}

function drawPoster() {
  let cut = ending == 'cut';
  otherThread.draw(cut ? 50 : 100);
  myThread.draw(cut ? 70 : 130);
  if (tether && !cut) tether.draw(170, 1.2);
  for (let k of knots) k.draw(cut ? 'scar' : 'rest');

  noStroke();
  fill(BG[0], BG[1], BG[2], 200);
  rect(0, 0, min(width * 0.45, 460), height);

  let x = 40, y = 60;
  textAlign(LEFT, TOP);
  textFont('PlexMono');
  textSize(10);
  fill(RED);
  text('TANGLED BY TOUCH', x, y);

  textFont('LoraItalic');
  textSize(constrain(width * 0.07, 44, 96));
  fill(INK);
  text(cut ? 'Severed.' : 'Rested.', x, y + 25);

  textFont('LoraRegular');
  textSize(17);
  fill(128, 120, 116);
  text(cut ? 'You chose to cut the thread.' : 'You chose to let the thread rest.', x, y + 140);

  let seconds = floor((endFrame - metFrame) / 60);
  let rows = [
    ['TIME TOGETHER', floor(seconds / 60) + ' min ' + (seconds % 60) + ' s'],
    ['THREAD LAID', (myThread.length / 3780).toFixed(2) + ' m'],
    ['KNOTS TIED', knots.length],
    ['LEAST FREEDOM', lowestFreedom + ' %']
  ];
  textFont('PlexMono');
  textSize(11);
  for (let i = 0; i < rows.length; i++) {
    fill(128, 120, 116);
    text(rows[i][0], x, y + 190 + i * 28);
    fill(INK);
    text(rows[i][1], x + 160, y + 190 + i * 28);
  }

  textFont('LoraItalic');
  textSize(16);
  fill(INK);
  text('more movement → more traces → more entanglement → less freedom', x, y + 320, 340);
  textFont('LoraRegular');
  textSize(14);
  fill(128, 120, 116);
  text('The knots are still here. They always will be.', x, y + 380, 340);
}

// SCENES + FADE//

function changeScene(name) {
  nextScene = name;
}

function drawFade() {
  if (nextScene != null) {
    fade += 8;
    if (fade >= 255) {
      scene = nextScene;
      nextScene = null;
      sceneTimer = 0;
      holdTime = 0;
      if (scene == 'landing') { makeLandRope(); narrator.clear(); }
      if (scene == 'prologue') startPrologue();
      if (scene == 'story') startStory();
      if (scene == 'poster') narrator.clear();
      if (scene == 'poster') { saveBtn.show(); againBtn.show(); }
      else { saveBtn.hide(); againBtn.hide(); }
    }
  } else {
    fade = max(0, fade - 8);
  }
  if (fade > 0) {
    noStroke();
    fill(BG[0], BG[1], BG[2], fade);
    rect(0, 0, width, height);
  }
  saveBtn.position(width - 330, height - 55);
  againBtn.position(width - 150, height - 55);
}


// INPUT + SOUND//

function mousePressed() {
  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
  }
  if (scene == 'prologue') narrator.skip();
}

function keyPressed() {
  if (key == 'm') toggleSound();
}

function toggleSound() {
  soundOn = !soundOn;
  outputVolume(soundOn ? 1 : 0);
  soundBtn.html(soundOn ? 'Sound: on' : 'Sound: off');
}

function playSound(name, volume) {
  let s = sounds[name];
  if (audioStarted && s && s.isLoaded()) s.play(0, 1, volume);
}

let lastTouchFrame = 0;
function playTouch(yPos, shared) {
  let s = shared ? sounds.chime : sounds.touch;
  if (!audioStarted || !s || !s.isLoaded()) return;
  if (frameCount - lastTouchFrame < 6) return;
  lastTouchFrame = frameCount;
  let notes = [0, 3, 5, 7, 10, 12];     
  let note = notes[floor((1 - yPos) * 5.99)];
  s.play(0, pow(2, note / 12), 0.35);
}

function updateSound() {
  if (!audioStarted) return;
  let amb = sounds.ambient;
  let ten = sounds.tension;
  if (amb && amb.isLoaded() && !amb.isPlaying()) { amb.setVolume(0.5); amb.loop(); }
  if (ten && ten.isLoaded() && !ten.isPlaying()) { ten.setVolume(0); ten.loop(); }

  let tensionVolume = 0;
  if (scene == 'story' && chapter >= 3 && !ending) tensionVolume = 0.1 + tension * 0.6;
  if (ten && ten.isLoaded() && frameCount % 10 == 0) ten.setVolume(tensionVolume, 0.5);

  let beatEvery = floor(map(tension, 0, 1, 90, 35));
  if (scene == 'story' && chapter >= 3 && !ending && tension > 0.2 && frameCount % beatEvery == 0) {
    playSound('heartbeat', 0.3 + tension * 0.4);
  }
}
