const bufferMod = require('buffer');

if (!bufferMod.SlowBuffer) {
  const SlowBuffer = function (size: number) {
    return Buffer.alloc(size);
  } as any;
  SlowBuffer.prototype = Buffer.prototype;
  bufferMod.SlowBuffer = SlowBuffer;
}

if (!bufferMod.SlowBuffer.prototype.equal) {
  bufferMod.SlowBuffer.prototype.equal = Buffer.prototype.equals;
}
