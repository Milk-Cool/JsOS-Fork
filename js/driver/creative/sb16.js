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

// This driver doesn't implemented
return; /* eslint-disable */

const Driver = require('..');
const driverUtils = require('../../core/driver-utils');
const ISADMAChannel = require('../../core/isa/dma');

// const randomBuffer = require('random-buffer');

function pad (n, width, z) {
  z = z || '0';
  n = `${n}`;

  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


class SB16 extends Driver {
  constructor () {
    super('Sound Blaster 16', 'Creative Technology Ltd.', 'UsernameAK');
    this.offset = 0x220;
    this.dmaChId = 1;
    this.irqId = 5;
    this.irq = driverUtils.irq(this.irqId);
    this.irq.on(() => console.log('received sb irq'));
    this.dma = new ISADMAChannel(this.dmaChId);
    this.ports = [];
    for (let i = 0; i < 16; i++) {
      this.ports.push(driverUtils.ioPort(this.offset + i));
    }
    this.reset();
    this.ports[0xC].write8(0xE1);
    this.version = `${this.ports[0xA].read8()}.${pad(this.ports[0xA].read8(), 2)}`;
    if (this.version === '0.00' || this.version === '255.255') {
      debug('SB16 DSP NOT FOUND');

      return;
    }
    this.setSampleRate(44100);
    this.configure();
    this.writeDSP();
    this.play();
    debug(`SB16 DSP VERSION IS ${this.version}`);
  }

  reset () {
    // TODO:
  }

  play () {
    this.ports[0xC].write8(0xD4);
  }

  stop () {
    this.ports[0xC].write8(0xD0);
  }

  writeDSP (buffer) {
    if (buffer) this.dma.getBuffer().set(buffer);
    this.dma.prepareWrite();
  }

  setSampleRate (rate) {
    this.ports[0xC].write8(0x41);
    this.ports[0xC].write8(rate >> 8 & 0xFF);
    this.ports[0xC].write8(rate & 0xFF);
  }

  configure (mode = 0x10, length = 0xFFFF) {
    length--;
    this.ports[0xC].write8(0xB6);
    this.ports[0xC].write8(mode);
    this.ports[0xC].write8(length & 0xFF);
    this.ports[0xC].write8(length >> 8 & 0xFF);
  }
}

module.exports = new SB16();
