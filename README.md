# Crypto Wallet

A simple cryptocurrency wallet application. This repository includes a minimal
wallet implementation for the Sui blockchain along with a small Chrome
extension so you can experiment in the browser.

## Features
- Generate and store an Ed25519 key pair
- Display the wallet address
- Sign arbitrary messages and verify signatures
- Chrome extension popup for easy testing

## Node Usage

1. Ensure Node.js is installed (version 18 or later).
2. Run `node src/wallet.js create` to generate a new wallet.
3. Use `node src/wallet.js address` to view the wallet address.
4. Sign a message with `node src/wallet.js sign "Hello"`.
5. Verify a signature with `node src/wallet.js verify "Hello" <signature>`.

## Chrome Extension

The `extension/` directory contains a simple Chrome extension that exposes the
same wallet functionality in a popup.

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder in this repository.
4. Click the wallet extension icon and use the popup to create a wallet, sign
   messages and verify signatures.

Network functions such as querying balances or sending transactions are not
implemented. This example focuses on key management and signing only.
