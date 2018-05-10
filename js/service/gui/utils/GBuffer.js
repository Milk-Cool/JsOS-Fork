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

module.exports = class GBuffer {
  /**
   * @param  {number} width - Screen width
   * @param  {number} height - Screen height
   * @param  {number} color - Color length (4 = RGBA)
   */
  constructor (width, height, color = 4) {
    this.buffer = new Uint8ClampedArray(width * height * color);
    this.width = width;
    this.height = height;
    this.color = color;
  }
  
  /** Mix two colors
   * @param  {array} color1
   * @param  {array} color2
   * @param  {number} fac - Factor of mix [-1; 1]
   */
  mixColors(color1, color2, fac) {
    //
  }

  setPixel (x, y, { alpha = 255, color = [255, 255, 255]}) {
    this.buffer[(x + (y * x)) * this.color]
  }
};
