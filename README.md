# Copying viem blob txs

---

In one terminal:

`anvil`

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
