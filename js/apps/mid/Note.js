// Mid player for JsOS
// By PROPHESSOR (2018)

'use strict';

module.exports = class Note {

  /**
   * @constructor
   * @param  {number} note - Note in MIDI table
   * @param  {number} [volume=null] -
   */
  constructor (note, volume = null) {
    this.midinote = note;
    this.volume = volume;
    this.note = this.midinote % 12;
    this.octave = ~~(this.midinote / 12);

    this.toFrequency = this.toFrequency.bind(this);
  }

  toFrequency () {
    return Note.octaver(Note.baseNoteFreq[this.note], this.octave);
  }

  [Symbol.toPrimitive] () {
    return this[Symbol.toStringTag]();
  }

  * [Symbol.iterator] () {
    yield this.midinote;
    yield this.volume;
  }

  [Symbol.toStringTag] () {
    return `${Note.notes[this.note]}${this.octave} ${this.volume}`;
  }

  static get notes () {
    return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];
  }

  static get baseNoteFreq () {
    return [65, 69, 73, 78, 82, 87, 92, 98, 104, 110, 116, 123];
  }

  static octaver (freq, octave) {
    return freq * Math.pow(2, octave - 2);
  }
};
