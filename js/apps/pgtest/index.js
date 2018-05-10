// JsOS Pseudo-Graphics demonstrate
// By PROPHESSOR

'use strict';

const JsMB = require('../../core/graphics/jsmb');

const scw = JsMB.screenWidth();
const sch = JsMB.screenHeight();

let io, resp, kb;

let page = 0;

function draw() {
  JsMB.cls();
  switch (page) {
    case 1:
      JsMB.fillScreen([0, 128, 0]);
      break;
    case 2:
      JsMB
        .fillScreen([0, 255, 0])
        .setColor([255, 0, 0])
        .drawRect(0, 0, scw, sch);
      break;
    case 3:
      JsMB
        .fillScreen([0, 255, 0])
        .setColor([255, 0, 0])
        .drawArc(scw / 2, sch / 2, 5);
      break;
    case 4:
      JsMB
        .fillScreen([0, 255, 0])
        .setColor([255, 0, 0])
        .drawArc(scw / 4, sch / 4, 5)
        .drawArc(3 * scw / 4, sch / 4, 5)
        .drawLine(scw / 4 + 5, 7 * sch / 8, 3 * scw / 4 - 5, 7 * sch / 8);
      break;
    case 5:
      JsMB
        .fillScreen([255, 0, 0])
        .setColor([0, 255, 255])
        .drawCube(0, 0, scw - 5, sch - 5, 5);
      break;
    case 6:
      return exit();
    default:
      throw new (require('errors').WTFError)(`Page ${page} doesn't exist!`);
  }

  return undefined;
}

function onKeyDown(key) {
  if (key.type === 'f12') return exit();
  page++;
  return draw();
}

function exit () {
  page = 0;
  kb.onKeydown.remove(onKeyDown);
  JsMB.cls();

  return resp(0);
}

function main (api, res) {
  io = api.stdio;
  kb = api.keyboard;
  resp = res;

  kb.onKeydown.add(onKeyDown);
  io.setColor('yellow');
  io.writeLine('Press any button to start or F12 to exit!');
}

exports.call = (cmd, args, api, res) => main(api, res);

exports.commands = ['pgtest'];
