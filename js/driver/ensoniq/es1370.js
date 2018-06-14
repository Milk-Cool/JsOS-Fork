/*
 * Copyright (c) 2017 UsernameAK
 * Copyright (c) 2018 PROPHESSOR
*/

// jsos start --append-qemu="-soundhw es1370"

'use strict';

const PciDevice = require('../../core/pci/pci-device');
const { Buffer } = require('buffer');
const Driver = require('..');
const CONSTANT = require('./constants');

class ES1370 extends Driver {
  constructor () {
    super('es1370', 'ensoniq', 'UsernameAK & PROPHESSOR');
    this.onIRQ = this.onIRQ.bind(this);
    $$.audio = this;
  }

  static init (device) {
    return new ES1370().init(device);
  }

  init (device) {
    debug('Ensoinq Corp. AudioPCI ES1370 driver loading...');
    this.irq = device.getIRQ();
    device.setPciCommandFlag(PciDevice.commandFlag.BusMaster);
    device.getIRQ().on(this.onIRQ);
    this.iobar = device.bars[0];
    this.pagePort = this.iobar.resource.offsetPort(CONSTANT.DSP_Write);
    this.addrPort = this.iobar.resource.offsetPort(0x38);
    this.sizePort = this.iobar.resource.offsetPort(0x3c);
    this.serialPort = this.iobar.resource.offsetPort(0x20);
    this.cmdPort = this.iobar.resource.offsetPort(0x0);
    this.fcPort = this.iobar.resource.offsetPort(0x28);

    debug('Controller reset');
    this.test1();
  }

  test1 (func) { // use #$$.audio.test1((x)=>somecode)
    this.sampleRate = 48000; // TODO: set rate
    this.pagePort.write32(CONSTANT.DSP_Write);
    this.bufferInfo = __SYSCALL.allocDMA();
    this.buffer = Buffer.from(this.bufferInfo.buffer);
    this.addrPort.write32(this.bufferInfo.address);
    this.sizePort.write32(0xFFFF);
    this.fcPort.write32(0xFFFF);

    for (let i = 0; i < 256 * 1024; i += 4) {
      this.buffer.writeFloatLE(func ? func(i) : i * 0.8 /* tone */ + 20000000 /* type */, i);
      // Math.floor(Math.random() * 0xFFFFFFFF), i);
    }

    debug('Playback buffer init');
    this.serialPort.write32(0x0020020C);
    this.cmdPort.write32(0x00000020);
  }

  onIRQ () {
    debug('ES1370 IRQ');
  }
}

$$.pci.addDriver(0x1274, 0x5000, ES1370);
