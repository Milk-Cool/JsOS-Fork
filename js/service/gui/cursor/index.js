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

module.exports = class Cursor {
  constructor (x = 0, y = 0, w = 8, h = 12, image = 'default') {
    { // this.
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.state = 'standart';
      this.color = [0xFF, 0xFF, 0xFF];
      try {
        this.image = require(`./cursors/${image}`);
      } catch (e) {
        throw new Error(`Can't load image ${image}! ${e}`);
      }
    }
    { // bind this
      this.draw = this.draw.bind(this);
    }
  }

  get standart () {
    // Alpha array [0 - 255]
    return Uint8ClampedArray.from(this.image.standart);
  }

  draw (buffer) {
    for (let x = this.x, ix = 0; x < this.x + this.w; x++, ix++) {
      for (let y = this.y, iy = 0; y < this.y + this.h; y++, iy++) {
        buffer.setPixel(x, y, {
          alpha: this[this.state][ix * iy], color: this.color });
      }
    }
  }
}
;
