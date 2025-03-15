# Quick spl token mint and transfer using Gill

As we know, there are several ways to mint or create an SPL token. We can use JavaScript/TypeScript with Solana Web3.js and Solana's developer helpers for SPL tokens, or create a Solana program in Rust/Anchor to mint an SPL token. In this guide, we will use the Gill library to mint an SPL token. We'll also utilize the quickest method, leveraging Gill's pre-built transaction builder methods for various transactions.

## What you will need

- Experience with Solana Web3.js v2
- Latest Node.js version installed
- TypeScript and `ts-node` installed

## Dependencies used in this guide

For this project, the dependencies in the `package.json` file will look like this:

```json
"dependencies": {
    "esrun": "^3.2.26",
    "gill": "^0.6.0"
  },
  "devDependencies": {
    "@types/node": "^22.13.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.2"
  }
```

Let’s set up a new project:

```tsx
mkdir spl-token && cd spl-token
```

Initialize your project as a Node.js project:

```tsx
npm init -y
```

Install the required dependencies:

```tsx
pnpm install gill esrun && pnpm install --save-dev @types/node typescript ts-node
```

Create a new file named `spl-token.ts` in your project directory:

```tsx
echo > spl-token.ts
```

Great! Now, let’s start coding.

## Import dependencies

In your `spl-token.ts` file, let's start by importing the necessary dependencies:

```tsx
import {
    address,
    KeyPairSigner,
    getBase58Codec,
    getExplorerLink,
    createSolanaClient,
    generateKeyPairSigner,
    getSignatureFromTransaction,
    createKeyPairSignerFromBytes,
    signTransactionMessageWithSigners,
    setTransactionMessageLifetimeUsingBlockhash,
  } from "gill";
  
  import {
    buildCreateTokenTransaction,
    buildMintTokensTransaction,
    buildTransferTokensTransaction
  } from "gill/programs/token";
  
```

Here, we're importing various functions from the Gill library for the creation, minting, and transfer of SPL tokens.

## Create an RPC connection to interact with the blockchain

```tsx
  // create Rpc connection
  const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: "devnet",
  });
  
  // get slot
  const slot = await rpc.getSlot().send();
  
  // get the latest blockhash
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
```

We are using Gill's `createSolanaClient` method to establish an RPC connection to Devnet. To call any RPC method, we need to use `.send()` on the RPC method to send the request to the RPC provider and receive a response.

## Generate Keypairs

```tsx
 const keypairBase58alice = "your_wallet_secret_key";
 const keypairBytesalice = getBase58Codec().encode(keypairBase58alice);
 const aliceKeyPair = await createKeyPairSignerFromBytes(keypairBytesalice);
  
 // KeyPairs and addresses
 const alice = aliceKeyPair.address;
  
 const bob = address("4d4zsfq4gtJixDGvisSdFjsY78uH7BypkwmkXL1D8RfT");
  
 const mint = await generateKeyPairSigner();
```

Here, we generate the Alice, Bob, and Mint addresses. For Alice, we use a secret key pair to generate her address. In this guide, Alice will create and mint tokens in her wallet, and then send the minted tokens to Bob’s wallet.

## **Create the Main Function**

Next, let's create our `main` function that will house the logic of our script:

```tsx
async function main(){

// Create token transaction

// Mint token transaction

// Transfer tokens transaction

}

main().catch(console.error);
```

## Create or mint spl token

Let's add the following code to the main function as the first step:

```tsx
const createTokenTx = await buildCreateTokenTransaction({
      feePayer: aliceKeyPair,
      latestBlockhash,
      mint: mint,  // Use mintKey here
      metadata: {
        isMutable: true, // if the `updateAuthority` can change this metadata in the future
        name: "Only Possible On Solana",
        symbol: "OPOS",
        uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/Climate/metadata.json",
      },
      decimals: 2,
    });
  
    
const signedTransaction = await signTransactionMessageWithSigners(createTokenTx);
const signature: string = getSignatureFromTransaction(signedTransaction);
console.log(getExplorerLink({ transaction: signatureformint }));
    
// default commitment level of `confirmed`
await sendAndConfirmTransaction(signedTransaction);
```

Here, we use the `buildCreateTokenTransaction` tx builder from Gill to create an SPL token, specifying `aliceKeypair` as the `feePayer` and providing metadata for the token.

Next, we use `signTransactionMessageWithSigners` to sign the transaction before sending it to the network, similar to Web3.js. We then obtain the signature using `getSignatureFromTransaction` and finally send the transaction to the network using `sendAndConfirmTransaction`.

Congrats! Our OPOS token has been created. You can open the Solana Explorer link and check it there.

## Minting Created token to Alice's wallet

Let's add the following code to the main function as the second step:

```tsx
const mintTokensTx = await buildMintTokensTransaction({
      feePayer: aliceKeyPair,
      latestBlockhash,
      mint,
      mintAuthority: aliceKeyPair,
      amount: 1000, // note: be sure to consider the mint's `decimals` value
      // if decimals=2 => this will mint 10.00 tokens
      // if decimals=4 => this will mint 0.100 tokens
      destination: alice,
      // use the correct token program for the `mint`
      // tokenProgram, // default=TOKEN_PROGRAM_ADDRESS
      // default cu limit set to be optimized, but can be overriden here
      // computeUnitLimit?: number,
      // obtain from your favorite priority fee api
      // computeUnitPrice?: number, // no default set
    });
  
  
  
    const signedTransactionformint = await signTransactionMessageWithSigners(mintTokensTx);
    const signatureformint: string = getSignatureFromTransaction(signedTransactionformint);
    console.log(getExplorerLink({ transaction: signatureformint }));
    // default commitment level of `confirmed`
    await sendAndConfirmTransaction(signedTransactionformint);
  
```

Here, we use the `buildMintTokensTransaction` tx builder from Gill to mint tokens to Alice's address, sign the transaction, obtain the signature, and send the transaction to the network.

You don't need to worry about associated token accounts because, in transaction builders, if the destination owner does not have an associated token account (ATA) for the mint, one will be automatically created for them.

Congrats! You have minted 10 OPOS SPL tokens into Alice's token account.

## Transfer the spl token to Bob’s wallet

Let's add the following code to the main function as the third step:

```tsx
const transferTokensTx = await buildTransferTokensTransaction({
      feePayer: aliceKeyPair,
      latestBlockhash,
      mint,
      authority: aliceKeyPair,
      // sourceAta, // default=derived from the `authority`.
      /*
       * if the `sourceAta` is not derived from the `authority` (like for multi-sig wallets),
       * manually derive with `getAssociatedTokenAccountAddress()`
      */
      amount: 900, // note: be sure to consider the mint's `decimals` value
      // if decimals=2 => this will transfer 9.00 tokens
      // if decimals=4 => this will transfer 0.090 tokens
      destination: bob,
      // use the correct token program for the `mint`
      //  tokenProgram, // default=TOKEN_PROGRAM_ADDRESS
      // default cu limit set to be optimized, but can be overriden here
      // computeUnitLimit?: number,
      // obtain from your favorite priority fee api
      // computeUnitPrice?: number, // no default set
    });
  
  
    const signedTransactionfortransfer = await signTransactionMessageWithSigners(transferTokensTx);
    const signaturefortransfer: string = getSignatureFromTransaction(signedTransactionfortransfer);
    console.log(getExplorerLink({ transaction: signaturefortransfer }));
  
    // default commitment level of `confirmed`
    await sendAndConfirmTransaction(signedTransactionfortransfer);
```

Here, we use the `buildTransferTokensTransaction` builder method from Gill to transfer SPL tokens from Alice's token address to Bob's token address. We then sign the transaction, obtain the signature, and send it to the network. Here, the associated token account (ATA) is also auto-created for Bob's wallet for this mint.

Congrats! You have transferred 9 OPOS tokens from Alice's token account to Bob's token account.

## Run Your Code
In your Terminal, type:

```bash
npx esrun ./index.ts
```
Upon successful execution, you should see an output of three Solana Explorer links for each operation: create, mint, and transfer of the 'OPOS' token.

```bash
https://explorer.solana.com/tx/58KC1GPc1f8aCUox6Pst7YheYRCqrQY9Np2gP6LfqDP5ogQjP5Hy76opzmJ8EKW2PyMdoGh71MYGWHL6oYHLAvdD
https://explorer.solana.com/tx/4DXAFBfsAVCgZ3X3rwEZ72EN81JVWj2zpzsYERCu5xitf1aztuytn9og3cyNbNeR3t5KnaJgneNckFy6MGAoWLGr
https://explorer.solana.com/tx/4PkHW9dSbQicKcempBoD3VCe2xQhJidJ6gptXPNvq4LVRBzJYAQrN5AGcaVfu88NabrczkgV8FrF4x1sVxKB7xSH
```
