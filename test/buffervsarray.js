// Node.JS!
'use strict';

const length = 1566720;

console.log('Buffer');
console.time('buffer');

const a = Buffer.allocUnsafeSlow(length);
for (let i = 0; i < a.length; i++) {
  a[i] = 0xFF;
}
// a.fill(0xFF);

console.timeEnd('buffer');

console.time('array');

const b = new ArrayBuffer(length);
const b_data = new DataView(b);
for (let i = 0; i < b.length; i++) {
	b_data.setInt8(i, 0xFF);
}
// b.fill(0xFF);

console.timeEnd('array');

console.time('uint8');

const c = new Uint8Array(length);
for (let i = 0; i < c.length; i++) {
  c[i] = 0xFF;
}
// c.fill(0xFF);

console.timeEnd('uint8');
