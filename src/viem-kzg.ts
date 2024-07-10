import cKzg from "c-kzg";
import { resolve } from "path";
import { setupKzg } from "viem";
// import { mainnetTrustedSetupPath } from "viem/node";

const mainnetTrustedSetupPath = resolve(
  "./node_modules/viem/trusted-setups/mainnet.json"
);

export const viemKzg = setupKzg(cKzg, mainnetTrustedSetupPath);
