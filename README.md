# Copying viem blob txs

---

In one terminal:

`anvil`

> Or, to run a hardhat network node, which is the only one I can get to work with blob txs: `npx hardhat node`

Make note of the 0th private key.

---

In another terminal:

Clone this repo.

`cd viem-blobs-example`

`nvm use 18`

`yarn install`

`export PRIV_KEY=<your 0th anvil private key>`

e.g. `export PRIV_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

`yarn build && yarn start`

It will first send an ordinary eth transfer tx, to demonstrate that this works.

Then it will try to send a blob tx, in keeping with https://viem.sh/docs/guides/blob-transactions. This blob tx will fail with:

```
InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
Double check you have provided the correct parameters.
```

and later:

```
shortMessage: 'RPC Request failed.',
version: 'viem@2.17.2',
cause: { code: -32602, message: 'Failed to decode transaction' },
```

---

Ok, so I had a go at sending the same txs (using the same tests) to a "hardhat network node".
Interestingly (confusingly and frustratingly), if you `client.sendRawTransaction` to a hardhat node, the tx data is formatted _differently_ from when it's sent to a foundry node. That's with the same client configuration `chain: foundry`. Viem seemingly figures out that it's talking with a hardhat node and _reformats_ the `sendRawTransaction` request to be in a non-raw, jsonified format. But hardhat can't understand a jsonified blob tx\*; it only supports raw (rlp-encoded) blob tx requests formatted with sendRawTransaction - except viem's `sendRawTransaction` is reformatting the request into json form for a hardhat node (but not for an anvil node)!!! Setting `chain: hardhat` didn't help, so I kept it at `foundry`. This `foundry` setting didn't affect non-blob txs from being successfully processed by the hardhat node.

> \* Hardhat says this when you feed it a jsonified, non-raw tx:
> `An EIP-4844 (shard blob) call request was received, but Hardhat only supports them via 'eth_sendRawTransaction'. See https://github.com/NomicFoundation/hardhat/issues/5182` ([link](https://github.com/NomicFoundation/hardhat/issues/5182))

So how to send a raw tx to a hardhat node? Curl! But the size of the blob is way bigger than what curl allows. So I stored the command in a text file `raw-tx.json` and did:

`curl -X POST -H "Content-Type: application/json" --data @raw-tx.json 127.0.0.1:8545`

Hooray! The hardhat network node didn't complain - it gave me a tx receipt!

I tried the same with anvil and got: "Failed to decode transaction" - the same error as I've been getting all along from anvil, even if sending via viem.

> Note: the nonce for the `raw-tx.json` is nonce 0 (encoded as `0x80` "nothing here"), so if it fails, you'll need to restart anvil to run it again. Or you could manually modify the nonce:
> From the start of the raw params string, it's here:
>
> ```
> "0x03fa020102f894827a6980...
>                        ^^ these two bytes are the nonce
>                          `80` means nonce `0`, `01` is nonce `1`. `02` is nonce `2`, etc.
> ```

<!-- prettier-ignore -->
|   | Viem | Curl |
|---|---|---|
| anvil node  | ❌ `InvalidParamsRpcError: Invalid parameters were provided to the RPC method.`  | ❌ `InvalidParamsRpcError: Invalid parameters were provided to the RPC method.`  |
| hardhat network node | ❌ `An EIP-4844 (shard blob) call request was received, but Hardhat only supports them via 'eth_sendRawTransaction'. See https://github.com/NomicFoundation/hardhat/issues/5182` but viem isn't sending the tx as raw. | ✅ |

Oooh, it's calling estimate_gas that seems to be killing it. If you specify all gas values (gas limit, max fee per ...) then it seems to work. No, it doesn't...

## Compiling

`cd contracts`
`forge build --evm-version cancun`
