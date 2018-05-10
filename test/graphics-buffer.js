// Node.JS!
'use strict';

const secondBuffer = new Array((80 * 8) * (25 * 16) * (24 / 8))
const colorArray = [0xFF, 0, 0];

console.log('Filling with .map');
console.time('map');

const map = Array(secondBuffer.length).map((_, i) => colorArray[i % 3]);

console.timeEnd('map');

console.log('Setting into the buffer');

const buffer = Buffer.alloc(secondBuffer.length);
console.time('buffer');

buffer.set(map);

console.timeEnd('buffer');