function bufToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

async function loadKeyPair() {
  const data = await chrome.storage.local.get(['publicKey', 'privateKey']);
  if (!data.publicKey || !data.privateKey) return null;
  const publicKey = await crypto.subtle.importKey(
    'raw',
    hexToBuf(data.publicKey),
    { name: 'Ed25519' },
    false,
    ['verify']
  );
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    hexToBuf(data.privateKey),
    { name: 'Ed25519' },
    false,
    ['sign']
  );
  return { publicKey, privateKey, pubHex: data.publicKey };
}

async function saveKeyPair(keyPair) {
  const pub = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const priv = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  await chrome.storage.local.set({
    publicKey: bufToHex(pub),
    privateKey: bufToHex(priv)
  });
}

async function createWallet() {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify']
  );
  await saveKeyPair(keyPair);
  document.getElementById('address').textContent =
    bufToHex(await crypto.subtle.exportKey('raw', keyPair.publicKey));
}

async function updateAddress() {
  const pair = await loadKeyPair();
  if (pair) {
    document.getElementById('address').textContent = pair.pubHex;
  }
}

async function signMessage() {
  const pair = await loadKeyPair();
  if (!pair) {
    alert('Create a wallet first');
    return;
  }
  const msg = new TextEncoder().encode(document.getElementById('message').value);
  const signature = await crypto.subtle.sign('Ed25519', pair.privateKey, msg);
  document.getElementById('signature').textContent = bufToHex(signature);
}

async function verifyMessage() {
  const pair = await loadKeyPair();
  if (!pair) {
    alert('Create a wallet first');
    return;
  }
  const msg = new TextEncoder().encode(
    document.getElementById('verifyMessage').value
  );
  const sigHex = document.getElementById('verifySignature').value.trim();
  const valid = await crypto.subtle.verify(
    'Ed25519',
    pair.publicKey,
    hexToBuf(sigHex),
    msg
  );
  document.getElementById('verifyResult').textContent = valid ? 'Valid' : 'Invalid';
}

document.getElementById('create').addEventListener('click', createWallet);
document.getElementById('sign').addEventListener('click', signMessage);
document.getElementById('verify').addEventListener('click', verifyMessage);

updateAddress();
