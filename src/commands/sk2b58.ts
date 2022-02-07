import { PathLike, promises as fs } from "fs"
import { Keypair  } from '@solana/web3.js';
import bs58 from 'bs58'

export const run  = async(_connection, _payer, path: PathLike) => {
  try {
    const fileData = await fs.readFile(path, 'utf-8')
    const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fileData)))
    console.log("Public Key:", keypair.publicKey.toBase58())
    console.log("Secret Key:", bs58.encode(keypair.secretKey))
  } catch (e) {
    console.error("Unable to read file at ", path)
    console.error("Error: ", e)
    process.exit(2)
  }
}