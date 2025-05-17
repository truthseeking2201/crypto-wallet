const assert = require('assert');
const fs = require('fs');
const { SuiWallet } = require('../src/wallet');

(async () => {
  const file = 'test-wallet.json';
  if (fs.existsSync(file)) fs.unlinkSync(file);
  const wallet = new SuiWallet(file);
  await wallet.create();
  await wallet.load();
  assert.ok(wallet.address(), 'address should exist');
  const msg = 'hello';
  const sig = wallet.signMessage(msg);
  assert.ok(sig, 'signature should exist');
  assert.strictEqual(wallet.verifyMessage(msg, sig), true, 'signature valid');
  fs.unlinkSync(file);
  console.log('All tests passed');
})();
