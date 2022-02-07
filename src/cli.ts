#!/usr/bin/env node
import * as web3 from "@solana/web3.js";
import { Command, program } from 'commander'

import {getPayer, getRpcUrl, establishConnection } from './utils';

import commands from './commands'

type Context = {
  connection: web3.Connection,
  payer: web3.Keypair
}

async function setup(): Promise<Context> {
  const payer = await getPayer()
  const rpcURL = await getRpcUrl()
  const connection = await establishConnection(rpcURL);
  return {
    connection,
    payer
  }
}

const parse = async (): Promise<Command> => {
  program
    .command('pda <wallet> <mint>')
    .description('Find the derived addresses for an account and mint')
    .action(async (wallet, mint) => {
      await commands.pda.run(null, null, wallet, mint)
    })

  program
    .command('mint <wallet> <metadataUri>')
    .description('Mint a token based on a metadata json')
    .action(async (wallet, metadataUri) => {
      const context = await setup();
      await commands.mintToken.run(context.connection, context.payer, wallet, metadataUri)
    })

  program
    .command('sk2b58 <pathToSecretKey>')
    .description('Get the base58 encoded secret key from a given path. Useful for importing a [u8;32] key to a web wallet')
    .action(async (pathToSecretKey: string) => {
      await commands.sk2b58.run(null, null, pathToSecretKey)
    })

  return program.parseAsync()
}


parse().then((command: Command) => {
  console.log(`\nFinished running command '${command.args[0]}`);
  process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(-1);
  },
);