// p5.sound loads its audio worklets from a blob: URL, which the browser
// blocks when index.html is opened straight from the computer (file://).
// this turns the blob into a data: URL instead, so it works both ways.
if (window.AudioWorklet && location.protocol === 'file:') {
  let original = AudioWorklet.prototype.addModule;
  AudioWorklet.prototype.addModule = function (url, options) {
    let worklet = this;
    return fetch(url).then(r => r.text()).then(code =>
      original.call(worklet, 'data:text/javascript;base64,' + btoa(unescape(encodeURIComponent(code))), options));
  };
}
