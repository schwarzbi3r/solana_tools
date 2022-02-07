# Solana CLI tools

Mostly for the purpose of demonstrating how to interact with the solana blockchain.

## Usage

`npx github:schwarzbi3r/solana_tools --help`

## Commands

### pda

Derive the associated accounts for a wallet and mint

`npx github:schwarzbi3r/solana_tools pda <wallet> <mint>`

### mint

Create a NFT token from metaplex metadata JSON

`npx github:schwarzbi3r/solana_tools pda <recipient> <metadataUri>`

### sk2b58

Export your Uin8Array into a base58 encoded string for easier import into a web wallet from dev

`npx github:schwarzbi3r/solana_tools sk2b58 <pathToConfig.json>`
