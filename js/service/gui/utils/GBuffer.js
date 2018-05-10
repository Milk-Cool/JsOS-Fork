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

const Color = require('./Color');

module.exports = class GBuffer {

  /**
   * @param  {number} width - Screen width
   * @param  {number} height - Screen height
   * @param  {number} colorLength - Color length (3 = RGB)
   */
  constructor (width, height, colorLength = 3) {
    this.buffer = new Uint8ClampedArray(width * height * colorLength);
    this.width = width;
    this.height = height;
    this.color = colorLength;
  }

  /** Mix two colors
   * @param  {Color} color1 - Color
   * @param  {Color} color2 - Color
   * @param  {number} fac - Factor of mix [-1; 1]
   * @returns {Color} mixed color
   */
  mixColors (color1, color2, fac = 0) {
    if (!(color1 instanceof Color)) throw new TypeError('First argument must be a Color');
    if (!(color2 instanceof Color)) throw new TypeError('Second argument must be a Color');
    if (typeof fac !== 'number') throw new TypeError('Third argument must be a Number');
    // TODO: Write me...

    return color2;
  }

  /** Set pixel color
   * @param  {number} x - X coordinate of the pixel
   * @param  {number} y - Y coordinate of the pixel
   * @param  {object} options - Options
   * @param  {number} [options.alpha=0xFF] - Alpha transparent value (0 - full transparent)
   * @param  {Color} options.color - Color
   */
  setPixel (x, y, { alpha = 0xFF, color = new Color([0xFF, 0xFF, 0xFF]) }) {
    if (!(color instanceof Color)) throw new TypeError('color must be a Color');
    if (!alpha) return;

    const index = (x + y * x) * this.colorLength;

    if (alpha !== 0xFF) {
      color = this.mixColors(new Color(this.buffer.slice(index, index + this.colorLength), color));
    }

    this.buffer[index + 0] = color[0];
    this.buffer[index + 1] = color[1];
    this.buffer[index + 2] = color[2];
  }

  /** Validate screen coordinates (> 0 and < screen size)
   * @param  {number} x - X coordinate
   * @param  {number} y - Y coordinate
   * @returns {bool} true/false
   */
  validateCoords (x, y) {
    // TODO: Write me!
    return true;
  }
};
