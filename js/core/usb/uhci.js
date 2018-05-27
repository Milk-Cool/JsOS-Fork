// Copyright 2017-present JsOS project authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable no-use-before-define */
// ^ Classes are exported, and additional classes are better declared below

'use strict';

const PciDevice = require('../pci/pci-device');
const co = require('./constants');
const DMAPool = require('../system/dma-pool');
const {TypeError} = require('errors');

const FRAMELIST_SIZE = 1024 * 4;
const MAX_QH = 8; // queue heads
const QH_SIZE = 8;
const PORTS = 2;

class UHCIController {
  constructor() {
    this.iobar = null;
    this.cmd = null;
    this.intr = null;
    this.frnum = null;
    this.frbaseadd = null;
    this.sofmod = null;
    this.portPorts = null;  //  Array
    this.dmaPool = null;    //  DMAPool
    this.frameList = null;  //  DMABuffer
    this.qhPool = null;     //  DMABuffer
    this.qhPoolInfo = null; //  Array: [QH]
    this.firstQh = null;    //  qhPoolInfo[i] || null
  }

  /** .
   * @param  {PciDevice} device - .
   * @returns {void}
   */
  init(device) {
    // Initialize the PCI device
    device.setPciCommandFlag(PciDevice.commandFlag.BusMaster);

    this.iobar = device.bars[4];
    this.cmd = this.iobar.resource.offsetPort(co.REG_CMD);
    this.intr = this.iobar.resource.offsetPort(co.REG_INTR);
    this.frnum = this.iobar.resource.offsetPort(co.REG_FRNUM);
    this.frbaseadd = this.iobar.resource.offsetPort(co.REG_FRBASEADD);
    this.sofmod = this.iobar.resource.offsetPort(co.REG_SOFMOD);
    this.portPorts = [];

    const from = 0x10;

    for (let i = from; i < from + (PORTS * 2); i += 2) {
      this.portPorts.push(this.iobar.resource.offsetPort(i));
    }

    this.dmaPool = new DMAPool();
    this.frameList = this.dmaPool.allocBuffer(FRAMELIST_SIZE, 4096);
    this.qhPool = this.dmaPool.allocBuffer(QH_SIZE * MAX_QH, 8);
    this.qhPoolInfo = Array(MAX_QH);

    for (let i = 0; i < this.qhPoolInfo.length; i++) {
      this.qhPoolInfo[i] = new QH(false, i * QH_SIZE, this.qhPoolInfo[i], this.qhPoolInfo[i]);
      this.qhPoolInfo[i].write = this.writeQH.bind(this, this.qhPoolInfo[i]);
      this.qhPoolInfo[i].read = this.readQH.bind(this, this.qhPoolInfo[i]);
      this.qhPoolInfo[i].free = this.freeQH.bind(this, this.qhPoolInfo[i]);
      this.qhPoolInfo[i].address = this.QHaddr.bind(this, this.qhPoolInfo[i]);
    }

    this.firstQh = this.allocQH();
    this.firstQh.write(co.TD_PTR_TERMINATE, co.TD_PTR_TERMINATE);
    this.initFrameList();

    this.intr.write16(0);

    this.frnum.write16(0);
    this.frbaseadd.write32(this.frameList.address);
    this.sofmod.write16(0x40);
    this.cmd.write16(co.CMD_GRESET);

    while (this.cmd.read16() & co.CMD_GRESET) __SYSCALL.halt();

    this.cmd.write16(co.CMD_RS);
    $$.usb.addController(this);
  }

  initFrameList() {
    for (let i = 0; i < FRAMELIST_SIZE; i += 4) {
      this.frameList.buffer.writeUInt32LE(co.TD_PTR_QH | this.firstQh.address());
    }
  }

  /** Get port status (connection and speed)
   * @param  {Number} port - Port id E [0, PORTS)
   * @returns {PortStatus} .
   */
  getPortStatus(port) {
    const val = this.portPorts[port].read16();

    return new PortStatus(Boolean(val & (1 << 0)), val & (1 << 8));
  }

  getPortCount() {
    return PORTS;
  }

  allocQH() {
    for (let i = 0; i < this.qhPoolInfo.length; i++) {
      if (!this.qhPoolInfo[i].active) {
        this.qhPoolInfo[i].active = true;
        return this.qhPoolInfo[i];
      }
    }
    return null;
  }

  writeQH(qh, head, element) {
    this.qhPool.buffer.writeUInt32LE(head, qh.offset);
    this.qhPool.buffer.writeUInt32LE(element, qh.offset + 4);
  }

  /**
   * @param  {QH} qh -
   * @returns {Object} {head, element}
   */
  readQH(qh) {
    if (!(qh instanceof QH)) throw new TypeError('[UHCI] readQH needs the argument of QH instances');

    const head = this.qhPool.buffer.readUInt32LE(qh.offset);
    const element = this.qhPool.buffer.readUInt32LE(qh.offset + 4);

    return {
      head,
      element
    };
  }

  /**
   * @param  {QH} qh -
   * @returns {void}
   */
  freeQH(qh) {
    if (!(qh instanceof QH)) throw new TypeError('[UHCI] freeQH needs the argument of QH instances');
    qh.active = false;
  }

  QHaddr(qh) { // TODO: Alias to the QH
    if (!(qh instanceof QH)) throw new TypeError('[UHCI] QHaddr needs the argument of QH instances');
    return this.qhPool.address + qh.offset;
  }

  static init(device) {
    return new UHCIController().init(device);
  }

  static load() {
    return $$.pci.addClassDriver(0x0C, 0x03, 0x00, UHCIController);
  }
}

class PortStatus {
  /**
   * @constructor
   * @param  {Boolean} connected -
   * @param  {Number} speed - *:low, 0:high
   */
  constructor(connected, speed) {
    this._connected = connected;
    this._speed = speed;
  }

  get speed() {
    return this._speed ? 'low' : 'high';
  }

  get connected() {
    return this._connected;
  }

  *[Symbol.iterator]() {
    yield this.connected;
    yield this.speed;
  }
}

class QH {
  /**
   * @constructor
   * @param  {Boolean} active -
   * @param  {Number} offset -
   * @param  {QH} next -
   * @param  {QH} prev=next -
   */
  constructor(active, offset, next, prev = next) {
    this.active = active;
    this.offset = offset;
    this.next = next;
    this.prev = prev;
  }

  *[Symbol.iterator]() {
    yield this.active;
    yield this.offset;
    yield* this.next; // TODO: Check
  }
}

module.exports = UHCIController;