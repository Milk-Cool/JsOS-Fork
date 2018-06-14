// Audio testing application for JsOS
// By PROPHESSOR (2018)

/*
  Литература:
    https://audiocoding.ru/article/2008/05/22/wav-file-structure.html
    http://www.topherlee.com/software/pcm-tut-wavformat.html
    http://soundfile.sapp.org/doc/WaveFormat/ - Самый наглядный вариант
*/

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

    io.writeLine(`First 12 bytes: ${Array.from(buffer.slice(0, 12)).map((e) => e.toString(16))}`);

    // console.log(buffer.toJSON()); // Не хватает памяти

    const chunkId = String.fromCharCode(...[
      buffer.readInt8(0),
      buffer.readInt8(1),
      buffer.readInt8(2),
      buffer.readInt8(3)
    ]);

    io.writeLine(`Header: ${chunkId}    ${chunkId === 'RIFF' ? 'OK!' : 'Not a WAV!'}`); // Норма

    const chunkSize = buffer.readInt32LE(4);

    io.writeLine(`File size: ${chunkSize}`);

    // FIXME: Какого-то фига, в buffer здесь идёт отступ ещё на 4 байта... Хотя в оригинальном файле их нет

    const format = String.fromCharCode(...[
      buffer.readInt8(12), // Насильно сдвинул на эти 4 байта FIXME: Исправить
      buffer.readInt8(13),
      buffer.readInt8(14),
      buffer.readInt8(15)
    ]);

    io.writeLine(`Format: ${format}    ${format === 'WAVE' ? 'OK!' : 'Not a WAV!'}`); // Нормально

    const subchunk1Id = String.fromCharCode(...[
      buffer.readInt8(16),
      buffer.readInt8(17),
      buffer.readInt8(18),
      buffer.readInt8(19)
    ]);

    io.writeLine(`Symbols: ${subchunk1Id}    ${subchunk1Id === 'fmt ' ? 'OK!' : 'Not a WAV!'}`); // Нормально

    const subchunk1Size = buffer.readInt32LE(20);

    io.writeLine(`Subchunk 1 size: ${subchunk1Size}    ${subchunk1Size === 16 ? 'PCM' : 'Unknown'}`); // Нормально

    const audioformat = buffer.readInt16LE(24);

    io.writeLine(`Audio format: ${audioformat}    ${audioformat === 1 ? 'PCM' : 'Unknown'}`); // Нормально

    const numChannels = buffer.readInt16LE(26);

    io.writeLine(`Num channels: ${numChannels}    ${numChannels === 1 ? 'Mono' : 'Stereo'}`); // Нормально

    const sampleRate = buffer.readInt32LE(8);

    io.writeLine(`Sample rate: ${sampleRate}`); // Показывает какой-то бред. Пытался отыскать его через HEX редактор - не нашел

    /* PROPHESSOR:
      Складывается впечатление, что при чтении файла/преобразовании исходной строки в буффер (FIXME:) данные немного портятся...
    */
  });
}

exports.call = (cmd, args, api, res) => main(api, res);

exports.commands = ['audio'];
