"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const fs_1 = require("fs");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const run = async (_connection, _payer, path) => {
    try {
        const fileData = await fs_1.promises.readFile(path, 'utf-8');
        const keypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fileData)));
        console.log("Public Key:", keypair.publicKey.toBase58());
        console.log("Secret Key:", bs58_1.default.encode(keypair.secretKey));
    }
    catch (e) {
        console.error("Unable to read file at ", path);
        console.error("Error: ", e);
        process.exit(2);
    }
};
exports.run = run;
