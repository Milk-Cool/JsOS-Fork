// Example application for JsOS
// By PROPHESSOR

'use strict';
let io,
  kb,
  resp;

const {graphics} = $$;

const buffers = [
  (new Uint8Array(graphics.displayBuffer.length)).fill(0xFF),
  (new Uint8Array(graphics.displayBuffer.length)).fill(0xAA),
  (new Uint8Array(graphics.displayBuffer.length)).fill(0),
];

function main(api, res) {
  io = api.stdio;
  kb = api.keyboard;
  resp = res;
  io.setColor('green');
  io.writeLine('Keylogger started!');
  io.setColor('yellow');
  io.writeLine('Press F12 for exit');
  io.setColor('pink');
  kb.onKeydown.add(keylog);
  // return res(0); // 1 = error
}

function keylog(key) {
  if (key.type === 'f12') return stop();
  const { character: char } = key;
  switch (char) {
    case "1":
      graphics.displayBuffer.set(buffers[0]);
      graphics.repaint();
      break;
    case "2":
      graphics.displayBuffer.set(buffers[1]);
      graphics.repaint();
      break;
    case "3":
      graphics.displayBuffer.set(buffers[2]);
      graphics.repaint();
      break;
  }
  return false;
}

function stop() {
  io.setColor('yellow');
  io.writeLine('Keylogger stoped');
  kb.onKeydown.remove(keylog);
  return resp(0);
}

exports.call = (cmd, args, api, res) => main(api, res);

exports.commands = ['repainttest'];
