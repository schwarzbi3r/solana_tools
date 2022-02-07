"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.programIds = void 0;
const ids_1 = require("./ids");
const programIds = () => {
    return {
        token: ids_1.TOKEN_PROGRAM_ID,
        associatedToken: ids_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        bpf_upgrade_loader: ids_1.BPF_UPGRADE_LOADER_ID,
        system: ids_1.SYSTEM,
        metadata: ids_1.METADATA_PROGRAM_ID,
        memo: ids_1.MEMO_ID,
        vault: ids_1.VAULT_ID,
        auction: ids_1.AUCTION_ID,
        metaplex: ids_1.METAPLEX_ID,
        pack_create: ids_1.PACK_CREATE_ID,
    };
};
exports.programIds = programIds;
