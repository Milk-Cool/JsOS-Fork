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

const Color = require('../utils/Color');

module.exports = class Desktop {
  constructor (background) {
    try {
      this.background = new Color(background); // If background is a Color
      this.backgroundImage = null;
    } catch (e) {
      this.background = new Color([128, 64, 0]);
      this.backgroundImage = background;
    }
  }

  /** Render
   * @param  {GBuffer} buffer - GBuffer of screen
   */
  render (buffer) {
    const rgba = this.background.toRgba();

    buffer.buffer.map((_, i) => rgba[i % buffer.colorLength]);
  }
};
