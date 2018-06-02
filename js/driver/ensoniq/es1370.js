/*
 * Copyright (c) 2017 UsernameAK
 * Copyright (c) 2018 PROPHESSOR
*/

// jsos start --append-qemu="-soundhw es1370"

'use strict';

const PciDevice = require('../../core/pci/pci-device');
const Buffer = require('buffer').Buffer;
const Driver = require('..');
const CONSTANT = require('./constants');

class ES1370 extends Driver {
  constructor () {
    super('es1370', 'ensoniq', 'UsernameAK & PROPHESSOR');
    this.onIRQ = this.onIRQ.bind(this);
  }

  static init (device) {
    return new ES1370().init(device);
  }

  init (device) {
    debug('Ensoinq Corp. AudioPCI ES1370 driver loading...');
    this.irq = device.getIRQ();
    device.setPciCommandFlag(PciDevice.commandFlag.BusMaster);
    device.getIRQ().on(this.onIRQ);
    const iobar = device.bars[0];
    const pagePort = iobar.resource.offsetPort(CONSTANT.DSP_Write);
    const addrPort = iobar.resource.offsetPort(0x38);
    const sizePort = iobar.resource.offsetPort(0x3c);
    const serialPort = iobar.resource.offsetPort(0x20);
    const cmdPort = iobar.resource.offsetPort(0x0);
    const fcPort = iobar.resource.offsetPort(0x28);

    debug('Controller reset');
    this.sampleRate = 48000; // TODO: set rate
    pagePort.write32(CONSTANT.DSP_Write);
    this.bufferInfo = __SYSCALL.allocDMA();
    this.buffer = Buffer.from(this.bufferInfo.buffer);
    addrPort.write32(this.bufferInfo.address);
    sizePort.write32(0xFFFF);
    fcPort.write32(0xFFFF);

    for (let i = 0; i < 256 * 1024; i += 4) {
      this.buffer.writeUInt32LE(i, i); // Math.floor(Math.random() * 0xFFFFFFFF), i);
    }

    debug('Playback buffer init');
    serialPort.write32(0x0020020C);
    cmdPort.write32(0x00000020);
  }

  onIRQ () {
    debug('ES1370 IRQ');
  }
}

$$.pci.addDriver(0x1274, 0x5000, ES1370);
