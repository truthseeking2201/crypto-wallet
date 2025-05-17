const fs = require('fs').promises;
const crypto = require('crypto');

class SuiWallet {
  constructor(file = 'wallet.json') {
    this.file = file;
    this.keyPair = null;
  }

  async load() {
    try {
      const data = JSON.parse(await fs.readFile(this.file));
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
    } catch {
      // ignore if file doesn't exist
    }
  }

  async save() {
    if (!this.keyPair) return;
    const data = {
      publicKey: this.keyPair.publicKey
        .export({ type: 'spki', format: 'der' })
        .toString('hex'),
      privateKey: this.keyPair.privateKey
        .export({ type: 'pkcs8', format: 'der' })
        .toString('hex')
    };
    await fs.writeFile(this.file, JSON.stringify(data, null, 2));
  }

  async create() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    this.keyPair = { publicKey, privateKey };
    await this.save();
  }

  address() {
    if (!this.keyPair) return null;
    return this.keyPair.publicKey
      .export({ type: 'spki', format: 'der' })
      .toString('hex');
  }

  signMessage(message) {
    if (!this.keyPair) throw new Error('Wallet not loaded');
    return crypto
      .sign(null, Buffer.from(message), this.keyPair.privateKey)
      .toString('hex');
  }

  verifyMessage(message, signature) {
    if (!this.keyPair) throw new Error('Wallet not loaded');
    return crypto.verify(
      null,
      Buffer.from(message),
      this.keyPair.publicKey,
      Buffer.from(signature, 'hex')
    );
  }
}

async function main() {
  const [cmd, arg1, arg2] = process.argv.slice(2);
  const walletPath = process.env.WALLET_PATH || 'wallet.json';
  const wallet = new SuiWallet(walletPath);
  await wallet.load();

  switch (cmd) {
    case 'create':
      await wallet.create();
      console.log('New wallet created:', wallet.address());
      break;
    case 'address':
      console.log('Address:', wallet.address());
      break;
    case 'sign':
      if (!arg1) {
        console.log('Usage: node src/wallet.js sign <message>');
        break;
      }
      console.log('Signature:', wallet.signMessage(arg1));
      break;
    case 'verify':
      if (!arg1 || !arg2) {
        console.log('Usage: node src/wallet.js verify <message> <signature>');
        break;
      }
      console.log('Valid:', wallet.verifyMessage(arg1, arg2));
      break;
    default:
      console.log(
        'Usage: node src/wallet.js <create|address|sign|verify> [args]' 
      );
  }
}

if (require.main === module) {
  main();
}

module.exports = { SuiWallet };
