#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const utils_1 = require("./utils");
const commands_1 = __importDefault(require("./commands"));
async function setup() {
    const payer = await (0, utils_1.getPayer)();
    const rpcURL = await (0, utils_1.getRpcUrl)();
    const connection = await (0, utils_1.establishConnection)(rpcURL);
    return {
        connection,
        payer
    };
}
const parse = async () => {
    commander_1.program
        .command('pda <wallet> <mint>')
        .description('Find the derived addresses for an account and mint')
        .action(async (wallet, mint) => {
        await commands_1.default.pda.run(null, null, wallet, mint);
    });
    commander_1.program
        .command('mint <wallet> <metadataUri>')
        .description('Mint a token based on a metadata json')
        .action(async (wallet, metadataUri) => {
        const context = await setup();
        await commands_1.default.mintToken.run(context.connection, context.payer, wallet, metadataUri);
    });
    commander_1.program
        .command('sk2b58 <pathToSecretKey>')
        .description('Get the base58 encoded secret key from a given path. Useful for importing a [u8;32] key to a web wallet')
        .action(async (pathToSecretKey) => {
        await commands_1.default.sk2b58.run(null, null, pathToSecretKey);
    });
    return commander_1.program.parseAsync();
};
parse().then((command) => {
    console.log(`\nFinished running command '${command.args[0]}`);
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(-1);
});
