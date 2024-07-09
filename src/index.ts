import { parseGwei, stringToHex, toBlobs } from "viem";
import { client } from "./client.js";
import { viemKzg as kzg } from "./viem-kzg.js";

//***********************************************/

// A simple transfer of eth works:

let request = await client.prepareTransactionRequest({
  to: "0x0000000000000000000000000000000000000000",
  value: 1000000000000000000n,
});

console.log("\n\nHere's the eth transfer request:\n", request);

let serializedTransaction = await client.signTransaction(request);

let hash = await client.sendRawTransaction({ serializedTransaction });

//***********************************************/

// But a blob tx, formatted like https://viem.sh/docs/guides/blob-transactions does not work. I get:
// InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
// Double check you have provided the correct parameters.

const blobs = toBlobs({ data: stringToHex("hello world") });

request = await client.prepareTransactionRequest({
  blobs,
  kzg,
  maxFeePerBlobGas: parseGwei("30"),
  to: "0x0000000000000000000000000000000000000000",
});

console.log("\n\nHere's the blob tx request:\n", request);

serializedTransaction = await client.signTransaction(request);

hash = await client.sendRawTransaction({ serializedTransaction });
