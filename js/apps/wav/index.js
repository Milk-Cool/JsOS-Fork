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
const CONSTANT = require('../../driver/ensoniq/constants');

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

    io.writeLine(`=== Header ===`);

    const buffer = Buffer.from(data);

    const chunkId = String.fromCharCode(...[
      buffer.readInt8(0),
      buffer.readInt8(1),
      buffer.readInt8(2),
      buffer.readInt8(3)
    ]);

    io.writeLine(`Container: ${chunkId}    ${chunkId === 'RIFF' ? 'OK!' : 'Not a WAV!'}`);

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

    const byteRate = buffer.readInt32LE(28);

    io.writeLine(`Byte rate: ${byteRate}`);

    const blockAlign = buffer.readInt16LE(32);

    io.writeLine(`Block align: ${blockAlign}`);

    const bitsPerSample = buffer.readInt16LE(34);

    io.writeLine(`Bits per sample: ${bitsPerSample}`);

    const subchunk2Id = String.fromCharCode(...[
      buffer.readInt8(36),
      buffer.readInt8(37),
      buffer.readInt8(38),
      buffer.readInt8(39)
    ]);

    io.writeLine(`Subchunk 2 id: ${subchunk2Id}    ${subchunk2Id === 'data' ? 'OK!' : 'Not a WAV!'}`);

    const subchunk2Size = buffer.readInt32LE(40);

    io.writeLine(`Subchunk 2 size: ${subchunk2Size}`);

    io.writeLine(`=== End of the header ===`);

    const durationSec = subchunk2Size / (bitsPerSample / 8) / numChannels / sampleRate;
    const durationMin = Math.floor(durationSec) / 60;

    io.writeLine(`Duration: ${durationSec.toFixed(2)}s.`);

    io.writeLine('Trying to play...');

    if (typeof $$.audio === 'undefined') return io.writeError('Es1370 audiocard not found!');

    $$.audio.sampleRate = sampleRate;

    $$.audio.pagePort.write32(CONSTANT.DSP_Write);
    $$.audio.bufferInfo = __SYSCALL.allocDMA();
    $$.audio.buffer = Buffer.from($$.audio.bufferInfo.buffer);
    $$.audio.addrPort.write32($$.audio.bufferInfo.address);
    $$.audio.sizePort.write32(0xFFFF);
    $$.audio.fcPort.write32(0xFFFF);

    for (let i = 0; i < 256 * 1024; i += 4) {
      $$.audio.buffer.writeUInt32LE(subchunk2Size - 44 - i > 0 ? buffer.readUInt32LE(44 + i) : 0, i);
    }

    debug('Playback buffer init');
    $$.audio.serialPort.write32(0x0020020C);
    $$.audio.cmdPort.write32(0x00000020);
  });
}

exports.call = (cmd, args, api, res) => main(api, res);

exports.commands = ['audio'];
