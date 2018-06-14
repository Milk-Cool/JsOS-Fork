// Audio testing application for JsOS
// By PROPHESSOR (2018)

'use strict';

let io,
  kb,
  resp;
const JsMB = require('../../core/graphics/jsmb-pseudo');

const fs = require('fs');


function keylog (key) {
  if (key.type === 'f12') return stop();

  return false;
}

function stop () {
  io.setColor('yellow');
  io.writeLine('Audio tester stoped');
  kb.onKeydown.remove(keylog);

  return resp(0);
}

function main (api, res) {
  io = api.stdio;
  kb = api.keyboard;

  resp = res;
  io.setColor('green');
  io.writeLine('Keylogger started!');
  io.setColor('yellow');
  io.writeLine('Press F12 for exit');
  io.setColor('pink');
  kb.onKeydown.add(keylog);

  io.writeLine('Trying to read test wav file...');

  const path = '/system/js/apps/wav/test.wav';

  fs.readFile(path, (err, data) => {
    if (err) return io.writeError(`Can't read file ${path}:${err}`);

    io.writeLine('OK!');

    const buffer = Buffer.from(data);

    let offset = 0;
    const chunkId = String.fromCharCode(...[
      buffer.readInt8(offset++),
      buffer.readInt8(offset++),
      buffer.readInt8(offset++),
      buffer.readInt8(offset++)
    ]);

    io.writeLine(`Header: ${chunkId}    ${chunkId === 'RIFF' ? 'OK!' : 'Not a WAV!'}`);

    offset += 4;

    const chunkSize = buffer.readInt32LE(offset);

    io.writeLine(`File size: ${chunkSize}`);

    offset += 4;

    const format = String.fromCharCode(...[
      buffer.readInt8(offset++),
      buffer.readInt8(offset++),
      buffer.readInt8(offset++),
      buffer.readInt8(offset++)
    ]);

    io.writeLine(`Format: ${format}    ${format === 'WAVE' ? 'OK!' : 'Not a WAV!'}`);

    const subchunk1Id = String.fromCharCode(...[
      buffer.readInt8(offset++),
      buffer.readInt8(offset++),
      buffer.readInt8(offset++),
      buffer.readInt8(offset++)
    ]);

    io.writeLine(`Symbols: ${subchunk1Id}    ${subchunk1Id === 'fmt ' ? 'OK!' : 'Not a WAV!'}`);

    // offset += 4; // FIXME: Костыль

    const subchunk1Size = buffer.readInt8(offset);

    io.writeLine(`Subchunk 1 size: ${subchunk1Size}    ${subchunk1Size === 16 ? 'PCM' : 'Unknown'}`);

    offset += 4; // FIXME: Костыль

    const audioformat = buffer.readInt16LE(offset);

    io.writeLine(`Audio format: ${audioformat}    ${audioformat === 1 ? 'PCM' : 'Unknown'}`);

    offset += 2;

    const numChannels = buffer.readInt16LE(offset);

    io.writeLine(`Num channels: ${numChannels}    ${numChannels === 1 ? 'Mono' : 'Stereo'}`);

    offset += 2;

    const sampleRate = buffer.readInt32LE(offset);

    io.writeLine(`Sample rate: ${sampleRate}`);
  });

  // render();
}

exports.call = (cmd, args, api, res) => main(api, res);

exports.commands = ['audio'];
