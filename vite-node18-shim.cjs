// Build-env shim: Node 18 lacks crypto.hash (added in Node 21.7).
// vite 7.3.6 calls crypto.hash during CSS processing. Polyfill it via createHash.
// serialize-javascript also expects a global `crypto` (webcrypto); ensure it exists.
// Loaded through NODE_OPTIONS=--require for `npm run build` on this machine.
const nodeCrypto = require("crypto");
if (typeof nodeCrypto.hash !== "function") {
  nodeCrypto.hash = (algorithm, data, outputEncoding) => {
    const h = nodeCrypto.createHash(algorithm);
    h.update(data);
    return outputEncoding ? h.digest(outputEncoding) : h.digest();
  };
}
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = nodeCrypto.webcrypto;
}
