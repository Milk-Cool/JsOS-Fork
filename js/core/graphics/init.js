'use strict';

function init() {
  if (!$$.graphics.graphicsAvailable()) {
    $$.stdio.defaultStdio.writeError('Graphics unavailable');
    return false;
  }

  $$.graphics.enableGraphics(1024, 768, 24);

  debug(`$$.graphics.displayBuffer.length: ${$$.graphics.displayBuffer.length}`);

  $$.graphics.displayBuffer.fill(0xff);
  setTimeout(() => $$.graphics.repaint(), 1000);

  return true;
}

module.exports = init;