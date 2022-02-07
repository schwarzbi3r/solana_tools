import {toPublicKey} from '../utils';

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

const METAPLEX_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'

// Demonstrae how findProgram address works
export const run = async (connection: Connection | null, payer: Keypair | null, wallet:string, mint:string) => {

    let addr = await PublicKey.findProgramAddress([
        toPublicKey(wallet).toBuffer(),
        toPublicKey(TOKEN_PROGRAM_ID).toBuffer(),
        toPublicKey(mint).toBuffer(),
    ], toPublicKey(ASSOCIATED_TOKEN_PROGRAM_ID))
    console.log("Associated Account: ", addr[0].toBase58())

    addr = await PublicKey.findProgramAddress([
        Buffer.from("metadata"),
        toPublicKey(METAPLEX_PROGRAM_ID).toBuffer(),
        toPublicKey(mint).toBuffer(),
    ], toPublicKey(METAPLEX_PROGRAM_ID))
    console.log("Metaplex Account Metadata: ", addr[0].toBase58())

    addr = await PublicKey.findProgramAddress([
        Buffer.from("metadata"),
        toPublicKey(METAPLEX_PROGRAM_ID).toBuffer(),
        toPublicKey(mint).toBuffer(),
        Buffer.from('edition'),
    ], toPublicKey(METAPLEX_PROGRAM_ID))
    console.log("Metaplex Account Metadata Master: ", addr[0].toBase58())
}
