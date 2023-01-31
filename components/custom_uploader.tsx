import React, { useEffect, useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import { NFTStorage, File, Blob } from "nft.storage";
import { ethers } from "ethers";
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

async function getDeals(cid: string) {
  const status = await lighthouse.dealStatus(cid);
  console.log("deal status", status);
}

const NFT_STORAGE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGU2MzQ1NWE4OGM4MjVFMWZjMTZEY2JmQjgwQTE4OUZFMWUwODJiMDUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3NTEwMTUwNTg4MCwibmFtZSI6ImhhY2thdGhvbiJ9.mNM7_v3LKnHnQp7X6lqDH3eq9tqgCrkwMaWkCy6CA5E";
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

const readFileAsync = (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      reader.result && resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
};

function Uploader() {
  const [uploaded_cid, set_uploaded_cid] = useState("");
  const [decrypted_url, set_decrypted_url] = useState("");

  async function encrypt_file(f: any) {
    console.log(f);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const { masterKey: fileEncryptionKey, keyShards } = await generate();

    const fileData = await readFileAsync(f);
    const encryptedData = await encryptFile(fileData, fileEncryptionKey);

    const encrypted_blob = new Blob([encryptedData], { type: f.type });

    const cid = await client.storeBlob(encrypted_blob);

    console.log("encrypted cid tho nft.storage:", cid);
    set_uploaded_cid(cid);

    // save shard to lighthosue nodes
    const authMessage: AuthMessage = await getAuthMessage(address);
    const signedMessage = await signer.signMessage(authMessage.message);

    const { error, isSuccess } = await saveShards(
      address,
      cid,
      signedMessage,
      keyShards
    );

    console.log(error == null); //true;
    console.log(isSuccess == true); //true;
  }

  async function add_access_control(cid: string) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const authMessage: AuthMessage = await getAuthMessage(address);
    const signedMessage = await signer.signMessage(authMessage.message);
    const { error, isSuccess } = await accessControl(
      address,
      cid,
      signedMessage,
      [
        {
          id: 1,
          // contractAddress: "0xED8A53399ff554fCA91b58c2720886135A1821c1",
          contractAddress: "0xf636d4A7036a0DeB26Ac385484B6C9E826Fcdf7d",
          chain: "Mumbai",
          method: "balanceOf",
          standardContractType: "ERC20",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: ">=",
            value: "1",
          },
        },
      ],
      "([1])"
    );
    console.log(error == null);
    console.log(isSuccess == true);
  }


  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  const deploy = async (e) => {
    // Push file to lighthouse node

    console.log("files:", e.target.files[0]);
    await encrypt_file(e.target.files[0]);

    // const output = await lighthouse.upload(e, "950b59f4-ecee-4ebd-b1cf-29e5adb0e37f", progressCallback);
    // console.log('File Status:', output);
    /*
        output:
          {
            Name: "filename.txt",
            Size: 88000,
            Hash: "QmWNmn2gr4ZihNPqaC5oTeePsHvFtkWNpjY3cD6Fd5am1w"
          }
        Note: Hash in response is CID.
      */

    // console.log('Visit at https://gateway.lighthouse.storage/ipfs/' + output.data.Hash);

    // getDeals(output.data.Hash);
  };

  return (
    <div className="App">
      <input onChange={(e) => deploy(e)} type="file" />
      <p>Uploaded cid: {uploaded_cid}</p>
      <p> result should be encrypted...</p>
      <img src={"https://cloudflare-ipfs.com/ipfs/" + uploaded_cid} />

      <p>setting up condition here...</p>

      <button
        onClick={() => {
          add_access_control(uploaded_cid);
        }}
      >
        <p>add access control to : {uploaded_cid}</p>
      </button>

<div>


</div>
    </div>
  );
}

export default Uploader;
