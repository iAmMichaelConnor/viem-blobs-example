import { createWalletClient, publicActions, http, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, foundry, hardhat } from "viem/chains";

let privKey = process.env.PRIV_KEY as Hex;

if (!privKey) {
  throw new Error(
    "Private key not found in environment variables. Use command:\n`clear && export PRIV_KEY=<your 0th anvil private key> && yarn build && yarn start`"
  );
}

export const account = privateKeyToAccount(privKey);

export const client = createWalletClient({
  account,
  chain: foundry, // using anvil to test
  transport: http(),
}).extend(publicActions);
