// Audio testing application for JsOS
// By PROPHESSOR (2018)

'use strict';

let io,
  kb,
  ms,
  resp;
let scale = 4;
let xoffset = 0;
let yoffset = 0;
const JsMB = require('../../core/graphics/jsmb-pseudo');

function mouselog (key) {
  let type;

  switch (key) {
    case 0:
      type = 'Left button';
      scale++;
      break;
    case 1:
      type = 'Middle button';
      break;
    case 2:
      type = 'Right button';
      scale--;
      break;
    default:
      type = 'Unknown mouse button';
      break;
  }

  render();
  // io.writeLine(type);

  return false;
}

function keylog (key) {
  if (key.type === 'f12') return stop();
  switch (key.character) {
    case 'w':
      yoffset--;
      break;
    case 's':
      yoffset++;
      break;
    case 'a':
      xoffset--;
      break;
    case 'd':
      xoffset++;
      break;
    case 'q':
      scale--;
      break;
    case 'e':
      scale++;
      break;

    default:
      break;
  }
  // io.writeLine(JSON.stringify(key));
  render();

  return false;
}

function stop () {
  io.setColor('yellow');
  io.writeLine('Audio tester stoped');
  kb.onKeydown.remove(keylog);
  ms.onMousedown.remove(mouselog);

  return resp(0);
}

function render () {
  const { buffer } = $$.audio;

  JsMB.cls();
  // const chor = buffer.length / $$.JsMB.screenWidth(); // Горизонтальный коэффициент
  // const cver = 0xFFFFF / $$.JsMB.screenHeight(); // Вертикальный коэффициент


  let widthIndex = 0; // Символизирует заполненность пикселей экрана по его ширине

  JsMB
    .clearRect(0, 0, JsMB.screenWidth(), 0);

  // Interface
  {
    JsMB
      .setColor(0xF)
      .fillRect(0, 0, JsMB.screenWidth(), 0);
    const header = ' Audio tester ';

    for (let i = 0; i < header.length; i++) {
      JsMB.drawPlot(JsMB.screenWidth() / 2 - header.length / 2 + i, 0, header[i]);
    }

    JsMB.setColor(0x4);

    const info = `Buffer size: ${buffer.length}  Scale: ${scale}  X Offset: ${xoffset}  Y Offset: ${yoffset}`;

    for (let i = 1; i <= info.length; i++) {
      JsMB.drawPlot(i, 1, info[i - 1]);
    }

    JsMB.setColor(0x6);

    const keys = `Size up: e  Size down: q  Move: W/A/S/D  Exit: F12`;

    for (let i = 1; i <= keys.length; i++) {
      JsMB.drawPlot(i, JsMB.screenHeight() - 1, keys[i - 1]);
    }
  }

  JsMB.setColor(0x2);

  for (let i = 0; i < 1024 * 256; i += 4) {
    if (i % scale === 0 && widthIndex < JsMB.screenWidth()/* i / 4 < JsMB.screenWidth() */) {
      JsMB
        .drawPlot(widthIndex, buffer.readUInt32LE(i) / 0xFFFF/*  * cver */)
        .drawPlot(widthIndex, JsMB.screenHeight() - 2, String(widthIndex % 10));
      widthIndex++;
    }
  }
  JsMB.repaint();
}

function main (api, res) {
  io = api.stdio;
  kb = api.keyboard;
  ms = api.mouse;

  resp = res;
  io.setColor('green');
  io.writeLine('Keylogger started!');
  io.setColor('yellow');
  io.writeLine('Press F12 for exit');
  io.setColor('pink');
  kb.onKeydown.add(keylog);
  ms.onMousedown.add(mouselog);

  render();
}

exports.call = (cmd, args, api, res) => main(api, res);

exports.commands = ['audio'];
