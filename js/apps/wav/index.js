// Wav reader for JsOS
// By PROPHESSOR (2018)

/*
  Литература:
    https://audiocoding.ru/article/2008/05/22/wav-file-structure.html
    http://www.topherlee.com/software/pcm-tut-wavformat.html
    http://soundfile.sapp.org/doc/WaveFormat/ - Самый наглядный вариант
*/

'use strict';

/* eslint-disable no-use-before-define */ // <= unreal =D

let io;
let kb;
let resp;
// const JsMB = require('../../core/graphics/jsmb-pseudo');

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

    const chunkId = String.fromCharCode(...[
      buffer.readInt8(0),
      buffer.readInt8(1),
      buffer.readInt8(2),
      buffer.readInt8(3)
    ]);

    io.writeLine(`Header: ${chunkId}    ${chunkId === 'RIFF' ? 'OK!' : 'Not a WAV!'}`);

    const chunkSize = buffer.readInt32LE(4);

    io.writeLine(`File size: ${chunkSize}`);

    const format = String.fromCharCode(...[
      buffer.readInt8(8),
      buffer.readInt8(9),
      buffer.readInt8(10),
      buffer.readInt8(11)
    ]);

    io.writeLine(`Format: ${format}    ${format === 'WAVE' ? 'OK!' : 'Not a WAV!'}`);

    const subchunk1Id = String.fromCharCode(...[
      buffer.readInt8(12),
      buffer.readInt8(13),
      buffer.readInt8(14),
      buffer.readInt8(15)
    ]);

    io.writeLine(`Symbols: ${subchunk1Id}    ${subchunk1Id === 'fmt ' ? 'OK!' : 'Not a WAV!'}`);

    const subchunk1Size = buffer.readInt32LE(16);

    io.writeLine(`Subchunk 1 size: ${subchunk1Size}    ${subchunk1Size === 16 ? 'PCM' : 'Unknown'}`);

    const audioformat = buffer.readInt16LE(20);

    io.writeLine(`Audio format: ${audioformat}    ${audioformat === 1 ? 'PCM' : 'Unknown'}`);

    const numChannels = buffer.readInt16LE(22);

    io.writeLine(`Num channels: ${numChannels}    ${numChannels === 1 ? 'Mono' : 'Stereo'}`);

    const sampleRate = buffer.readInt32LE(24);

    io.writeLine(`Sample rate: ${sampleRate}`);
  });
}

exports.call = (cmd, args, api, res) => main(api, res);

exports.commands = ['audio'];
