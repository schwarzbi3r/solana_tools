"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicKey = exports.createKeypairFromFile = exports.getPayer = exports.establishConnection = exports.getRpcUrl = void 0;
const os = __importStar(require("os"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
const web3_js_1 = require("@solana/web3.js");
/**
 * @private
 */
async function getConfig() {
    // Path to Solana CLI config file
    const CONFIG_FILE_PATH = path.resolve(os.homedir(), '.config', 'solana', 'cli', 'config.yml');
    const configYml = await fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' });
    return yaml.parse(configYml);
}
/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */
async function getRpcUrl() {
    try {
        const config = await getConfig();
        if (!config.json_rpc_url)
            throw new Error('Missing RPC URL');
        return config.json_rpc_url;
    }
    catch (err) {
        console.warn('Failed to read RPC url from CLI config file, falling back to localhost');
        return 'http://localhost:8899';
    }
}
exports.getRpcUrl = getRpcUrl;
/**
 * Establish a connection to the cluster
 */
async function establishConnection(rpcUrl) {
    const connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', rpcUrl, version, '\n');
    return connection;
}
exports.establishConnection = establishConnection;
/**
 * Load and parse the Solana CLI config file to determine which payer to use
 */
async function getPayer() {
    try {
        const config = await getConfig();
        if (!config.keypair_path)
            throw new Error('Missing keypair path');
        return await createKeypairFromFile(config.keypair_path);
    }
    catch (err) {
        console.warn('Failed to create keypair from CLI config file, falling back to new random keypair');
        return web3_js_1.Keypair.generate();
    }
}
exports.getPayer = getPayer;
/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
async function createKeypairFromFile(filePath) {
    const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return web3_js_1.Keypair.fromSecretKey(secretKey);
}
exports.createKeypairFromFile = createKeypairFromFile;
const toPublicKey = (key) => {
    if (typeof key !== 'string') {
        return key;
    }
    return new web3_js_1.PublicKey(key);
};
exports.toPublicKey = toPublicKey;
