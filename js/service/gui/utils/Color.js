/**
 *    Copyright 2018 JsOS authors
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

'use strict';

// TODO: Jest

module.exports = class Color {
  constructor (color) {
    [this.r, this.g, this.b] = [0, 0, 0];

    if (color instanceof Array) {

      if (color.length === 3) { // RGB

        [this.r, this.g, this.b] = color;
        this.a = 255;

      } else if (color.length === 4) { // RGBA

        [this.r, this.g, this.b, this.a] = color;

      } else {

        throw new TypeError('Unknown color array!');

      }

    } else if (color instanceof Color) { // Color

      [this.r, this.g, this.b, this.a] = color;

    } else if (typeof color === 'object') {

      if (Number.isInteger(color.r) && Number.isInteger(color.g) && Number.isInteger(color.b)) {

        if (Number.isInteger(color.a)) { // RGBA Object

          const { r, g, b, a } = color;

          [this.r, this.g, this.b, this.a] = [r, g, b, a];

        } else { // RGB Object

          const { r, g, b } = color;

          [this.r, this.g, this.b] = [r, g, b];

        }
      }
    }
  }

  // Covert
  toHex () {
    const [r, g, b] = this;

    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  }
  toRgb () {
    return [this.r, this.g, this.b];
  }
  toRgba () {
    return [this.r, this.g, this.b, this.a];
  }
  toColorString () {
    return 'cyan'; // TODO: Write me
  }

  [Symbol.toStringTag] () {
    const [r, g, b, a] = this;

    return `RGBA(${r}, ${g}, ${b}, ${a}`;
  }

  * [Symbol.iterator] () {
    yield this.r;
    yield this.g;
    yield this.b;
    yield this.a;
  }
};
