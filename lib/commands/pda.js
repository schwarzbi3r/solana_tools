"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const utils_1 = require("../utils");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const METAPLEX_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
// Demonstrae how findProgram address works
const run = async (connection, payer, wallet, mint) => {
    let addr = await web3_js_1.PublicKey.findProgramAddress([
        (0, utils_1.toPublicKey)(wallet).toBuffer(),
        (0, utils_1.toPublicKey)(spl_token_1.TOKEN_PROGRAM_ID).toBuffer(),
        (0, utils_1.toPublicKey)(mint).toBuffer(),
    ], (0, utils_1.toPublicKey)(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
    console.log("Associated Account: ", addr[0].toBase58());
    addr = await web3_js_1.PublicKey.findProgramAddress([
        Buffer.from("metadata"),
        (0, utils_1.toPublicKey)(METAPLEX_PROGRAM_ID).toBuffer(),
        (0, utils_1.toPublicKey)(mint).toBuffer(),
    ], (0, utils_1.toPublicKey)(METAPLEX_PROGRAM_ID));
    console.log("Metaplex Account Metadata: ", addr[0].toBase58());
    addr = await web3_js_1.PublicKey.findProgramAddress([
        Buffer.from("metadata"),
        (0, utils_1.toPublicKey)(METAPLEX_PROGRAM_ID).toBuffer(),
        (0, utils_1.toPublicKey)(mint).toBuffer(),
        Buffer.from('edition'),
    ], (0, utils_1.toPublicKey)(METAPLEX_PROGRAM_ID));
    console.log("Metaplex Account Metadata Master: ", addr[0].toBase58());
};
exports.run = run;
