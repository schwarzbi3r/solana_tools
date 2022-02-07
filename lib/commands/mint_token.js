#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.getAtaForMint = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3 = __importStar(require("@solana/web3.js"));
const bn_js_1 = __importDefault(require("bn.js"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const utils_1 = require("../utils");
const metadata_1 = require("../metadata");
const getAtaForMint = async (mint, buyer) => {
    return await web3.PublicKey.findProgramAddress([
        buyer.toBuffer(),
        spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()
    ], spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
};
exports.getAtaForMint = getAtaForMint;
const run = async (connection, payer, recipient, metadataUri) => {
    let metadata = {};
    try {
        const response = await (0, cross_fetch_1.default)(metadataUri);
        metadata = await response.json();
        if (!(metadata['name'] && metadata['symbol'])) {
            console.error("Expected to find token metadata name and symbol on: ", metadata);
            process.exit(1);
        }
    }
    catch (e) {
        console.error("Unable to get Metadata json");
        console.error("Error: ", e);
        process.exit(1);
    }
    const mint = web3.Keypair.generate();
    const programId = spl_token_1.TOKEN_PROGRAM_ID;
    const userTokenAccountAddress = (await (0, exports.getAtaForMint)(mint.publicKey, (0, utils_1.toPublicKey)(recipient)))[0];
    console.log("New Account: ", mint.publicKey.toBase58());
    console.log("Associated Account: ", userTokenAccountAddress.toBase58());
    console.log("Program Id: ", programId.toBase58());
    const instructions = [
        // Create empty account to hold Token data
        web3.SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint.publicKey,
            space: spl_token_1.MintLayout.span,
            lamports: await connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
            programId,
        }),
        // Let TOKEN_PROGRAM_ID initialize the Token data for the above account
        spl_token_1.Token.createInitMintInstruction(programId, mint.publicKey, 0, payer.publicKey, payer.publicKey),
        // Associate account using ASSOCIATED_TOKEN_PROGRAM_ID
        // Structure is:
        //  PubkeyOfAccount [u8;32]
        //  PubkeyOfOwner [u8;32]
        new web3.TransactionInstruction({
            keys: [
                { pubkey: payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: userTokenAccountAddress, isSigner: false, isWritable: true },
                { pubkey: (0, utils_1.toPublicKey)(recipient), isSigner: false, isWritable: false },
                { pubkey: mint.publicKey, isSigner: false, isWritable: false },
                { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false, },
                { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false, },
            ],
            programId: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            data: Buffer.from([]),
        }),
        spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, userTokenAccountAddress, payer.publicKey, [], 1),
    ];
    const data = new metadata_1.Data({
        symbol: metadata['symbol'],
        name: metadata['name'],
        uri: metadataUri,
        sellerFeeBasisPoints: 500,
        creators: null
    });
    console.log("Metadata: ", data);
    // Create the metadata acccount
    await (0, metadata_1.createMetadata)(data, payer.publicKey.toBase58(), mint.publicKey.toBase58(), payer.publicKey.toBase58(), instructions, payer.publicKey.toBase58(), false);
    // Create the metadata master edition acccount
    await (0, metadata_1.createMasterEdition)(new bn_js_1.default(1), mint.publicKey.toBase58(), payer.publicKey.toBase58(), payer.publicKey.toBase58(), payer.publicKey.toBase58(), instructions);
    const transaction = new web3.Transaction().add(...instructions);
    try {
        const sig = await web3.sendAndConfirmTransaction(connection, transaction, [payer, mint]);
        console.log(sig);
    }
    catch (err) {
        console.log(err);
    }
    console.log('Success');
};
exports.run = run;
