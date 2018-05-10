// Node.JS
'use strict';

console.log('for');
console.time('for');

const arr = [];

for (let i = 0; i < 100000000; i++) {
  arr[i] = i;
}

console.timeEnd('for');


console.log('while');
console.time('while');

let i = 0;
while (i < 100000000) { i++; }

console.timeEnd('while');

console.log('while2');
console.time('while2');

i = 100000000;
while (i--) {}

console.timeEnd('while2');
