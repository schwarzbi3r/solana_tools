#!/usr/bin/env node

import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout } from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import BN from 'bn.js';
import fetch from 'cross-fetch'

import { toPublicKey } from '../utils';
import { createMasterEdition, createMetadata, Data } from "../metadata";

export const getAtaForMint = async (
  mint: web3.PublicKey,
  buyer: web3.PublicKey,
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [
    buyer.toBuffer(),
    TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
};

export const run = async (connection: web3.Connection, payer: web3.Keypair, recipient: string, metadataUri: string) => {

  let metadata: any = {}
  try {
    const response = await fetch(metadataUri);
    metadata = await response.json() as any;
    if (!(metadata['name'] && metadata['symbol'])) {
      console.error("Expected to find token metadata name and symbol on: ", metadata)
      process.exit(1)
    }
  } catch(e) {
    console.error("Unable to get Metadata json")
    console.error("Error: ", e)
    process.exit(1)
  }

  const mint = web3.Keypair.generate()
  const programId = TOKEN_PROGRAM_ID

  const userTokenAccountAddress = (
    await getAtaForMint(mint.publicKey, toPublicKey(recipient))
  )[0]

  console.log("New Account: ", mint.publicKey.toBase58())
  console.log("Associated Account: ", userTokenAccountAddress.toBase58())
  console.log("Program Id: ", programId.toBase58())

  const instructions = [

    // Create empty account to hold Token data
    web3.SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey:mint.publicKey,
      space: MintLayout.span,
      lamports:
        await connection.getMinimumBalanceForRentExemption(MintLayout.span),
      programId,
    }),

    // Let TOKEN_PROGRAM_ID initialize the Token data for the above account
    Token.createInitMintInstruction(
      programId,
      mint.publicKey,
      0,
      payer.publicKey,
      payer.publicKey,
    ),

    // Associate account using ASSOCIATED_TOKEN_PROGRAM_ID
    // Structure is:
    //  PubkeyOfAccount [u8;32]
    //  PubkeyOfOwner [u8;32]
    new web3.TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: userTokenAccountAddress, isSigner: false, isWritable: true },
        { pubkey: toPublicKey(recipient), isSigner: false, isWritable: false },
        { pubkey: mint.publicKey, isSigner: false, isWritable: false },
        { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false, },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false, },

      ],
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([]),

    }),
    Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      userTokenAccountAddress,
      payer.publicKey,
      [],
      1,
    ),

  ]

  const data = new Data({
    symbol: metadata['symbol'],
    name: metadata['name'],
    uri: metadataUri,
    sellerFeeBasisPoints: 500,
    creators: null
  })
  
  console.log("Metadata: ", data)

  // Create the metadata acccount
  await createMetadata(
    data,
    payer.publicKey.toBase58(),
    mint.publicKey.toBase58(),
    payer.publicKey.toBase58(),
    instructions,
    payer.publicKey.toBase58(),
    false
  )
  
  // Create the metadata master edition acccount
  await createMasterEdition(
    new BN(1),
    mint.publicKey.toBase58(),
    payer.publicKey.toBase58(),
    payer.publicKey.toBase58(),
    payer.publicKey.toBase58(),
    instructions
  )

  const transaction = new web3.Transaction().add(...instructions)

  try {
    const sig = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [payer, mint],
    )
    console.log(sig)
  } catch (err) {
      console.log(err)
  }
  console.log('Success');
}
