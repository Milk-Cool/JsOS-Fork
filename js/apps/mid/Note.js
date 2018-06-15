// Mid player for JsOS
// By PROPHESSOR (2018)

'use strict';

module.exports = class Note {

  /**
   * @constructor
   * @param  {number} note - Note in MIDI table
   * @param  {number} [dynamics=null] -
   */
  constructor (note, dynamics = null) {
    this.note = note;
    this.dynamics = dynamics;
  }

  [Symbol.toPrimitive] () {
    return this[Symbol.toStringTag]();
  }

  * [Symbol.iterator] () {
    yield this.note;
    yield this.dynamics;
  }

  [Symbol.toStringTag] () {
    const note = this.note % 12;
    const octave = ~~(this.note / 12);

    return `${Note.notes[note]}${octave} ${this.dynamics}`;
  }

  static get notes () {
    return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];
  }
};
