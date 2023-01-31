import React, { useEffect } from "react";
import lighthouse from '@lighthouse-web3/sdk';

async function getDeals(cid: string) {
    const status = await lighthouse.dealStatus(cid)
    console.log('deal status', status)

}

function Uploader() {

    const progressCallback = (progressData) => {
      let percentageDone =
        100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
      console.log(percentageDone);
    };
  
    const deploy = async(e) =>{
      // Push file to lighthouse node
      const output = await lighthouse.upload(e, "950b59f4-ecee-4ebd-b1cf-29e5adb0e37f", progressCallback);
      console.log('File Status:', output);
      /*
        output:
          {
            Name: "filename.txt",
            Size: 88000,
            Hash: "QmWNmn2gr4ZihNPqaC5oTeePsHvFtkWNpjY3cD6Fd5am1w"
          }
        Note: Hash in response is CID.
      */
  
        console.log('Visit at https://gateway.lighthouse.storage/ipfs/' + output.data.Hash);
        
        // getDeals(output.data.Hash);
    }

    useEffect(()=> {

        getDeals("QmU5JkZipVLWQ2sDe5CcCB2sY8971NL1qSoADzEV4MMxAk");
        getDeals("QmRxfGCNHgKXNvZ47aKAovQPrVM4kZnyS692pivYkTy2eH");
        getDeals("Qme9p9vAg25szVtpTfiMQmpEb3KpwzE7WPRaMq4p94H7op");
    },[])
  
    return (
      <div className="App">
        <input onChange={e=>deploy(e)} type="file" />
      </div>
    );
  }
  
  export default Uploader;