# Crypto Wallet

A simple cryptocurrency wallet application. This repository now includes a
minimal wallet implementation for the Sui blockchain.

## Features
- Generate and store an Ed25519 key pair
- Display the wallet address
- Sign arbitrary messages

## Getting Started

1. Ensure Node.js is installed (version 18 or later).
2. Run `node src/wallet.js create` to generate a new wallet.
3. Use `node src/wallet.js address` to view the wallet address.
4. Sign a message with `node src/wallet.js sign "Hello"`.

Network functions such as querying balances or sending transactions are not
implemented. This example focuses on key management and signing only.

