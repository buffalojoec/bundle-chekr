// import "@solana/webcrypto-ed25519-polyfill";

import { pipe } from "@solana/functional";
import {
  Blockhash,
  assertTransactionIsFullySigned,
  createDefaultRecentTransactionConfirmer,
  createDefaultRpcSubscriptionsTransport,
  createDefaultRpcTransport,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransaction,
  generateKeyPair,
  getAddressFromPublicKey,
  prependTransactionInstruction,
  sendAndConfirmTransaction,
  setTransactionFeePayer,
  setTransactionLifetimeUsingBlockhash,
  signTransaction,
} from "@solana/web3.js";
import { transferSolInstruction } from "./transferSol";

async () => {
  const sender = await generateKeyPair();
  const senderPubkey = await getAddressFromPublicKey(sender.publicKey);
  const toPubkey = await getAddressFromPublicKey(
    (
      await generateKeyPair()
    ).publicKey
  );

  const ix = transferSolInstruction(
    {
      source: senderPubkey,
      destination: toPubkey,
    },
    { amount: 1_000_000_000 }
  );

  const rpc = createSolanaRpc({
    transport: createDefaultRpcTransport({
      url: "https://api.devnet.solana.com",
    }),
  });

  const rpcSubscriptions = createSolanaRpcSubscriptions({
    transport: createDefaultRpcSubscriptionsTransport({
      url: "ws://api.devnet.solana.com",
    }),
  });

  const blockhashLifetime = await rpc
    .getLatestBlockhash()
    .send()
    .then(
      (res: {
        value: { blockhash: Blockhash; lastValidBlockHeight: bigint };
      }) => res.value
    );

  const tx = pipe(
    createTransaction({ version: 0 }),
    (tx) => setTransactionFeePayer(senderPubkey, tx),
    (tx) => setTransactionLifetimeUsingBlockhash(blockhashLifetime, tx),
    (tx) => prependTransactionInstruction(ix, tx)
  );

  const transaction = await signTransaction([sender], tx);
  assertTransactionIsFullySigned(transaction);

  await sendAndConfirmTransaction({
    commitment: "confirmed",
    confirmRecentTransaction: createDefaultRecentTransactionConfirmer({
      rpc,
      rpcSubscriptions,
    }),
    rpc,
    transaction,
  });
};
