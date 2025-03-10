import {
  address,
  getBase58Codec,
  getExplorerLink,
  createSolanaClient,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  createKeyPairSignerFromBytes,
  signTransactionMessageWithSigners,
} from "gill";

import {
  buildCreateTokenTransaction,
  buildMintTokensTransaction,
  buildTransferTokensTransaction
} from "gill/programs/token";


// create Rpc connection
const { rpc, sendAndConfirmTransaction } = createSolanaClient({
  urlOrMoniker: "devnet",
});

// get slot
const slot = await rpc.getSlot().send();

// get the latest blockhash
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const keypairBase58alice =
"your_wallet_secret_key";
const keypairBytesalice = getBase58Codec().encode(keypairBase58alice);
const aliceKeyPair = await createKeyPairSignerFromBytes(keypairBytesalice);

// KeyPairs and addresses
const alice = aliceKeyPair.address;
const bob = address("4d4zsfq4gtJixDGvisSdFjsY78uH7BypkwmkXL1D8RfT");
const mint = await generateKeyPairSigner();

async function main() {

  // create token
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
  console.log(getExplorerLink({ transaction: signature }));
  // default commitment level of `confirmed`
  await sendAndConfirmTransaction(signedTransaction);


 // mint tokens
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


  // transfer tokens
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

}

main().catch(console.error);






