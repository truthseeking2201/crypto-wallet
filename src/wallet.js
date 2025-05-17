const fs = require('fs');
const crypto = require('crypto');

class SuiWallet {
  constructor(file = 'wallet.json') {
    this.file = file;
    this.keyPair = null;
  }

  load() {
    if (fs.existsSync(this.file)) {
      const data = JSON.parse(fs.readFileSync(this.file));
      this.keyPair = {
        publicKey: crypto.createPublicKey({
          key: Buffer.from(data.publicKey, 'hex'),
          format: 'der',
          type: 'spki'
        }),
        privateKey: crypto.createPrivateKey({
          key: Buffer.from(data.privateKey, 'hex'),
          format: 'der',
          type: 'pkcs8'
        })
      };
    }
  }

  save() {
    if (this.keyPair) {
      const data = {
        publicKey: this.keyPair.publicKey
          .export({ type: 'spki', format: 'der' })
          .toString('hex'),
        privateKey: this.keyPair.privateKey
          .export({ type: 'pkcs8', format: 'der' })
          .toString('hex'),
      };
      fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
    }
  }

  create() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    this.keyPair = { publicKey, privateKey };
    this.save();
  }

  address() {
    if (!this.keyPair) return null;
    // Simplified address: hex of public key
    return this.keyPair.publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
  }

  signMessage(message) {
    if (!this.keyPair) throw new Error('Wallet not loaded');
    return crypto.sign(null, Buffer.from(message), this.keyPair.privateKey);
  }
}

function main() {
  const cmd = process.argv[2];
  const message = process.argv[3];
  const wallet = new SuiWallet();
  wallet.load();

  switch (cmd) {
    case 'create':
      wallet.create();
      console.log('New wallet created:', wallet.address());
      break;
    case 'address':
      console.log('Address:', wallet.address());
      break;
    case 'sign':
      if (!message) {
        console.log('Usage: node src/wallet.js sign <message>');
        break;
      }
      const signature = wallet.signMessage(message);
      console.log('Signature:', signature.toString('hex'));
      break;
    default:
      console.log('Usage: node src/wallet.js <create|address|sign <message>>');
  }
}

if (require.main === module) {
  main();
}

module.exports = { SuiWallet };
