import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import Uploader from "../components/custom_uploader";
import {
  recoverShards,
  getAuthMessage,
  saveShards,
  AuthMessage,
  shareToAddress,
  generate,
  accessControl,
  recoverKey,
} from "@lighthouse-web3/kavach";
import { decryptFile, encryptFile } from "@/utils/encryption_lib";
import { ethers } from "ethers";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [cid, setCid] = useState("");


  const [decrypted_url, set_decrypted_url] = useState("");

  async function decrypt() {
    // recover shared from an address that matches the above condition
    // that is
    // has a balance equal to or greater than Zero on the Optimism mainnet and has a token balance greater than equal to zero of the token 0xF0Bc72fA04aea04d04b1fA80B359Adb566E1c8B1 on fantom's testnet
    // or if block height is greater than zero

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const authMessage: AuthMessage = await getAuthMessage(address);
    const signedMessage = await signer.signMessage(authMessage.message);
    console.log(address);

    //retrieve 3 keys
    const { error, shards } = await recoverShards(
      address,
      cid,
      signedMessage,
      3
    );

    const { masterKey } = await recoverKey(shards);

    console.log("fetch key from nodes", error, masterKey);

    const result = await fetch(
      "https://cloudflare-ipfs.com/ipfs/" + cid
    );

    const decrypted = await decryptFile(
      // await result.data.arrayBuffer(),
      await result.arrayBuffer(),
      masterKey
    );

    console.log("decrypted", decrypted);

    if (decrypted) {
      const blob = new Blob([decrypted], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      set_decrypted_url(url);
    } else {
      return null;
    }
  }

  useEffect(() => {}, []);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>Kavach Decrypt cid: {cid}</p>

          <input
            placeholder="cid hash here"
            onChange={(e) => setCid(e.target.value)}
            type="text"
          />
        </div>

        <div>
        <button
        onClick={() => {
          decrypt()
        }}
      >
        <p>decrypt : {cid}</p>
        <img src={decrypted_url} />

      </button>

        </div>
      </main>
    </>
  );
}
