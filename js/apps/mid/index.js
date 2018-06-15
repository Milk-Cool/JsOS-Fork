// Mid player for JsOS
// By PROPHESSOR (2018)

/*
  Литература:
    https://www.csie.ntu.edu.tw/~r92092/ref/midi/
*/

'use strict';

/* eslint-disable no-use-before-define */ // <= unreal =D
/* eslint-disable max-depth */
/* eslint-disable complexity */

let io = null;
let kb = null;
let resp = null;
let isPlaying = false;

const music = [];
// const JsMB = require('../../core/graphics/jsmb-pseudo');

const fs = require('fs');
const { warn, error, log, info, success } = $$.logger;
const Note = require('./Note');

function keylog (key) {
  if (key.type === 'f12') return stop();
  if (key.type === 'enter') {
    if (isPlaying) return;
    isPlaying = true;
    io.writeLine(`Playing...`);
    let position = 0;

    const tick = () => {
      const note = music[position];

      const DURATION = 500;

      io.writeLine(`Note: ${note}`);
      $$.speaker.play(note.toFrequency(), DURATION);
      if (position < music.length - 1) {
        position++;
        setTimeout(tick, DURATION);
      } else {
        io.writeLine('End!', 0);
        isPlaying = false;
      }
    };

    tick();
  }

  return false;
}

function stop () {
  io.setColor('yellow');
  io.writeLine('Midi player stoped');
  kb.onKeydown.remove(keylog);

  return resp(0);
}

function main (api, res) {
  io = api.stdio;
  kb = api.keyboard;

  resp = res;
  io.setColor('green');
  io.writeLine('Midi player started!');
  io.setColor('yellow');
  io.writeLine('Press F12 for exit');
  io.setColor('pink');
  kb.onKeydown.add(keylog);

  io.writeLine('Trying to read test mid file...');

  const path = '/system/js/apps/mid/test.mid';

  fs.readFile(path, (err, data) => {
    if (err) return io.writeError(`Can't read file ${path}:${err}`);

    io.writeLine('OK!');

    io.writeLine(`=== Header ===`);

    const buffer = Buffer.from(data);

    const headerId = String.fromCharCode(...[
      buffer.readInt8(0),
      buffer.readInt8(1),
      buffer.readInt8(2),
      buffer.readInt8(3)
    ]);

    io.writeLine(`Header: ${headerId}    ${headerId === 'MThd' ? 'OK!' : 'Not a MID!'}`);

    const headerLength = buffer.readInt32BE(4);

    io.writeLine(`Header length: ${headerLength}    ${headerLength === 6 ? 'OK!' : 'Unknown'}`);

    const format = buffer.readInt16BE(8);
    const formats = ['single multi-channel track', 'separated tracks for channels', 'separated patterns'];

    io.writeLine(`Format: ${format}    ${formats[format] || 'Not a MID!'}`);

    const numTrackBlocks = buffer.readInt16BE(10);

    io.writeLine(`Num of track blocks: ${numTrackBlocks}`);

    const deltaTime = buffer.readInt32BE(12);

    io.writeLine(`Unit of delta-time values: ${deltaTime}`);

    /**
     * TODO:
     * If negative :
     *   Absolute of high byte :
     *   Number of frames per second.
     *   Low byte :
     *   Resolution within one frame
     * If positive, division of a quarter-note.
     */

    io.writeLine(`=== End of the header ===`);

    let offset = 14;

    for (let i = 0; i < numTrackBlocks; i++) {
      io.writeLine(`=== Track ${i + 1} block ===`);

      const trackId = String.fromCharCode(...[
        buffer.readInt8(offset),
        buffer.readInt8(++offset),
        buffer.readInt8(++offset),
        buffer.readInt8(++offset)
      ]);

      io.writeLine(`Header: ${trackId}    ${trackId === 'MTrk' ? 'OK!' : 'Not a MTrk!'}`);

      const trackLength = buffer.readInt32BE(++offset);

      offset += 4;

      io.writeLine(`Track length: ${trackLength}`);

      if (trackId !== 'MTrk') { // Skip this block
        offset += trackLength;
        continue;
      }

      const basicOffset = offset;

      while (true) {
        if (offset >= basicOffset + trackLength) break;

        const time = buffer.readUInt8(offset);
        const type = buffer.readUInt8(++offset);

        if (type === 0xFF) { // Meta event
          const event = buffer.readUInt8(++offset);
          const len = buffer.readUInt8(++offset);

          offset++;

          console.log(`> Meta event ${event} with len ${len}`);

          if (event >= 1 && event <= 7) { // Text meta events
            const text = buffer.toString('ascii', offset, offset + len);

            switch (event) {
              case 1:
                io.writeLine(`> Text: ${text}`);
                break;

              case 2:
                io.writeLine(`> Copyright: ${text}`);
                break;

              case 3:
                io.writeLine(`> Track: ${text}`);
                break;

              case 4:
                io.writeLine(`> Instrument: ${text}`);
                break;

              case 5:
                io.writeLine(`> Word: ${text}`);
                break;

              case 6:
                io.writeLine(`> Marker: ${text}`);
                break;

              case 7:
                io.writeLine(`> Cue point: ${text}`);
                break;
              default:
                warn('Unknown meta event!', { level: 'app' });
                break;
            }
          }
          offset += len;
        } else switch (type & 0xF0) { // Смотрим по старшым 4-м байтам.
          // Перебираем события первого уровня.

          case 0x80:
          case 0x90:
          case 0xA0: {
            const note = new Note(buffer.readUInt8(++offset), buffer.readUInt8(++offset));

            switch (type & 0xF0) {
              case 0x80: // Снять клавишу.
                io.writeLine(`> Note ${note} OFF`);
                console.log(`> Note ${note} OFF`);
                break;
              case 0x90:   // Нажать клавишу.
                io.writeLine(`> Note ${note} ON`);
                console.log(`> Note ${note} ON`);
                music.push(note);
                break;
              case 0xA0:  // Сменить силу нажатия клавишы.
                io.writeLine(`> Change note's ${note.split(' '[0])} velocity to ${note.volume}`);
                console.log(`> Change note's ${note.split(' '[0])} velocity to ${note.volume}`);
                break;
              default: break;
            }
            break;
          }

          case 0xB0: { // Если 2-х байтовая комманда.
            const buffer2level = buffer.readUInt8(++offset); // Читаем саму команду.
            //const arg = buffer.readUInt8(++offset); // Считываем параметр какой-то неизвестной функции.

            offset++;

            switch (buffer2level) { // Смотрим команды второго уровня.
              default: // Для определения новых комманд (не описаных).
                break;
            }
            break;
          }

          // В случае попадания их просто нужно считать.
          case 0xC0:   // Просто считываем байт номера.
            offset++; // Считываем номер программы.
            break;

          case 0xD0:   // Сила канала.
            offset++;// Считываем номер программы.
            break;

          case 0xE0:  // Вращения звуковысотного колеса.
            offset += 2; // Считываем номер программы.
            break;
          default:
            console.log(`> Unknown event ${buffer & 0xF0}`);
            break;
        }
      }

      io.writeLine(`=== End of the track ${i + 1} block ===`);
      io.writeLine(`Press Enter to play`);
    }
  });
}

exports.call = (cmd, args, api, res) => main(api, res);

exports.commands = ['audio'];
