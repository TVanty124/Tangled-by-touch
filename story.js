
let PROLOGUE = [
  'There is an old story, told across East Asia.',
  'An invisible red thread is tied around the little fingers of two people who are meant to meet.',
  'It may stretch. It may tangle. It never breaks.',
  'It is meant to be a promise: you will never be alone.',
  'But what happens when the thread holds too tightly?'
];

let CHAPTERS = [
  null,
  { title: 'Meeting', sub: 'before the thread is tied' },
  { title: 'Holding', sub: 'every crossing becomes a knot' },
  { title: 'Entanglement', sub: 'the harder you pull, the tighter it holds' },
  { title: 'Letting go', sub: 'a knot cannot be untied' }
];

let LINES = {
  ch1Start: ['Your cursor is a needle. Move it.', 'Somewhere in the dark, someone else is moving.'],
  tooFast: 'Moving too fast pushes them away. Slow down.',
  closer: 'Closer. Gently.',
  met: ['The thread is tied.', 'From now on, every movement leaves a mark.'],

  firstSelf: 'Your thread crossed itself. A knot.',
  firstShared: 'Your thread crossed theirs. A shared knot.',

  ch2: [
    { at: 14, text: 'Every knot is a memory. It stays.' },
    { at: 22, text: 'This is what closeness looks like.' },
    { at: 27, text: 'Isn’t it?' }
  ],
  ch3: [
    { at: 0, text: 'The knots are starting to hold you back.' },
    { at: 36, text: 'Pulling away only adds more thread.' },
    { at: 42, text: 'More movement. More traces. More entanglement. Less freedom.' },
    { at: 48, text: 'Is this still a connection, or a trap?' }
  ],
  ch4: ['A knot you tied cannot be untied.', 'There are only two ways out.'],

  rest: ['You stop pulling.', 'The thread loosens. It is still there, but it no longer holds you.',
         'Some connections last because you let them rest.'],
  cut: ['Snip.', 'You are free.', 'But the knots stay where you tied them.']
};



class Narrator {
  constructor() {
    this.queue = [];      
    this.line = null;     
    this.timer = 0;      
    this.card = null;     
    this.cardTimer = 0;
  }

  say(text) {
    this.queue.push(text);
  }

  clear() {
    this.queue = [];
    this.line = null;
  }

  showCard(n) {
    this.card = n;
    this.cardTimer = 0;
  }

  busy() {
    return this.card != null || this.line != null || this.queue.length > 0;
  }

  skip() {
    if (this.line) this.timer = max(this.timer, this.lineLength() - 30);
  }

  lineLength() {
    return this.line.length / 0.8 + 150;
  }

  update() {

    if (this.card != null) {
      this.cardTimer++;
      if (this.cardTimer > 240) this.card = null;
      return;
    }
    if (this.line == null && this.queue.length > 0) {
      this.line = this.queue.shift();
      this.timer = 0;
    }
    if (this.line != null) {
      this.timer++;
      if (this.timer > this.lineLength()) this.line = null;
    }
  }

  draw(centered) {
    if (this.card != null) {
      this.drawCard();
      return;
    }
    if (this.line == null) return;

    let a = min(this.timer / 20, (this.lineLength() - this.timer) / 30, 1);
    let shown = this.line.substring(0, floor(this.timer * 0.8));
    let y = centered ? height * 0.45 : height * 0.8;
    let size = centered ? constrain(width * 0.028, 20, 34) : constrain(width * 0.019, 16, 24);

    noStroke();
    fill(10, 8, 9, 170 * a);
    rectMode(CENTER);
    rect(width / 2, y + size * 0.6, min(width * 0.85, 760), size * 4.2, 8);
    rectMode(CORNER);

    textFont('LoraItalic');
    textSize(size);
    textAlign(CENTER, TOP);
    fill(238, 232, 226, 255 * a);
    let w = min(width * 0.8, 700);
    text(shown, width / 2 - w / 2, y - size * 0.3, w, size * 4);
  }

  drawCard() {
    let t = this.cardTimer;
    let a = min(t / 40, (240 - t) / 40, 1);
    let c = CHAPTERS[this.card];

    fill(10, 8, 9, 180 * a);
    noStroke();
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    textFont('PlexMono');
    textSize(11);
    fill(212, 30, 42, 255 * a);
    text('CHAPTER 0' + this.card + ' / 04', width / 2, height * 0.38);

    textFont('LoraMedium');
    textSize(constrain(width * 0.07, 40, 96));
    fill(238, 232, 226, 255 * a);
    text(c.title, width / 2, height * 0.47);

    let lineW = textWidth(c.title) * min(t / 80, 1);
    stroke(212, 30, 42, 255 * a);
    strokeWeight(1.5);
    line(width / 2 - lineW / 2, height * 0.55, width / 2 + lineW / 2, height * 0.55);

    noStroke();
    textFont('LoraItalic');
    textSize(constrain(width * 0.018, 15, 20));
    fill(128, 120, 116, 255 * a);
    text(c.sub, width / 2, height * 0.6);
  }
}
