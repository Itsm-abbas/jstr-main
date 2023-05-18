import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  TransactionSignature,
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  VersionedMessage,
} from "@solana/web3.js";

import { FC, useCallback, useState } from "react";
import { notify } from "../utils/notifications";
import useUserSOLBalanceStore from "../stores/useUserSOLBalanceStore";
import {
  createBurnCheckedInstruction,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

export const RequestAirdrop = () => {
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [inputNo, setInputNo] = useState("");
  const spin = (value: string) => {
    console.log("clicked", value);
    const spinOnClick = document.getElementById("canvas");
    spinOnClick.click();
  };
  const burno = async () => {
    const MINT_ADDRESS = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"; // USDC-Dev from spl-token-faucet.com | replace with the mint you would like to burn
    let MINT_DECIMALS = 6; // Value for USDC-Dev from spl-token-faucet.com | replace with the no. decimals of mint you would like to burn
    let BURN_QUANTITY = 1;

    // you can access input box value from -> inputNo variable
    BURN_QUANTITY = Number.parseInt(inputNo);
    console.log(BURN_QUANTITY);

    console.log(
      `Attempting to burn ${BURN_QUANTITY} [${MINT_ADDRESS}] tokens from Owner Wallet: ${
        publicKey && publicKey.toString()
      }`
    );
    let signature: TransactionSignature = "";
    // Step 1 - Fetch Associated Token Account Address

    // Step 1 - Fetch Associated Token Account Address
    console.log(`Step 1 - Fetch Token Account`);
    let account: PublicKey;
    if (MINT_ADDRESS && publicKey) {
      const mintAddress = new PublicKey(MINT_ADDRESS);
      account = await getAssociatedTokenAddress(mintAddress, publicKey);
      // Rest of your code using the 'account' object
    }
    console.log(
      `    ✅ - Associated Token Account Address: ${
        account && account.toString()
      }`
    );

    // Step 2 - Create Burn Instructions
    console.log(`Step 2 - Create Burn Instructions`);
    const burnIx = createBurnCheckedInstruction(
      account, // PublicKey of Owner's Associated Token Account
      new PublicKey(MINT_ADDRESS), // Public Key of the Token Mint Address
      publicKey, // Public Key of Owner's Wallet
      BURN_QUANTITY * 10 ** MINT_DECIMALS, // Number of tokens to burn
      MINT_DECIMALS // Number of Decimals of the Token Mint
    );
    console.log(`    ✅ - Burn Instruction Created`);

    // Step 3 - Fetch Blockhash
    console.log(`Step 3 - Fetch Blockhash`);
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    console.log(`    ✅ - Latest Blockhash: ${blockhash}`);

    // Step 4 - Assemble Transaction
    console.log(`Step 4 - Assemble Transaction`);
    let latestBlockhash = await connection.getLatestBlockhash();
    let messageV0: VersionedMessage;
    if (publicKey) {
      messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [burnIx],
      }).compileToV0Message();

      // Rest of your code using the 'messageV0' object
    } else {
      console.log("publicKey is null or undefined");
      // Handle the case when 'publicKey' is null or undefined
    }
    let transaction: VersionedTransaction | Transaction;
    if (messageV0) {
      transaction = new VersionedTransaction(messageV0);

      // Rest of your code using the 'transaction' object
    } else {
      console.log("messageV0 is undefined");
      // Handle the case when 'messageV0' is undefined
    }
    // transaction.sign([useWallet()]);
    // const transactionV0 = new VersionedTransaction(messageV0);
    console.log(`    ✅ - Transaction Created and Signed`);
    try {
      const signature = await sendTransaction(transaction, connection);
      alert("Success");
      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      );
      console.log("   ✅ - Transaction sent to network");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Failed");
    }

    // Await for confirmation

    // Step 5 - Execute & Confirm Transaction

    console.log(MINT_DECIMALS);
    return 0;
  };

  // const onClick = useCallback(async () => {
  //     if (!publicKey) {
  //         console.log('error', 'Wallet not connected!');
  //         notify({type: 'error', message: 'error', description: 'Wallet not connected!'});
  //         return;
  //     }

  //     burno();
  //     console.log('burn now');

  //     let signature: TransactionSignature = '';

  //     try {

  //         signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);

  //         // Get the lates block hash to use on our transaction and confirmation
  //         let latestBlockhash = await connection.getLatestBlockhash()
  //         await connection.confirmTransaction({signature, ...latestBlockhash}, 'confirmed');

  //         notify({type: 'success', message: 'Airdrop successful!', txid: signature});

  //         getUserSOLBalance(publicKey, connection);
  //     } catch (error: any) {
  //         notify({type: 'error', message: `Airdrop failed!`, description: error?.message, txid: signature});
  //         console.log('error', `Airdrop failed! ${error?.message}`, signature);
  //     }
  // }, [publicKey, connection, getUserSOLBalance]);

  const burnClick = () => {
    burno();

    // use this function to spin wheel
    spin(inputNo);
  };

  return (
    <div className="flex flex-row justify-center align-items-center">
      <label>
        Amount:{" "}
        <input
          className={"txt-number"}
          type={"number"}
          value={inputNo}
          onChange={(e) => setInputNo(e.target.value)}
        />
      </label>
      <div className="relative group items-center">
        <div
          className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500
                    rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
        ></div>

        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
          onClick={() => burnClick()}
        >
          <span>Burn </span>
        </button>
      </div>
    </div>
  );
};
