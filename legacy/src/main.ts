import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

async () => {
  const sender = Keypair.generate();
  const toPubkey = PublicKey.default;

  const ix = SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey,
    lamports: LAMPORTS_PER_SOL,
  });

  const tx = new Transaction().add(ix);
  tx.sign(sender);

  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  await sendAndConfirmTransaction(connection, tx, [sender]);
};
