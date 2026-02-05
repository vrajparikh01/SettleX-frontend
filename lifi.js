const { ethers } = require("ethers");
const qs = require("qs");
const fetch = require("node-fetch");
require("dotenv").config({ path: "../.env" });

const web3RpcUrl = process.env.RPC_URL;
const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(web3RpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

// Polygon Mainnet
const chain = '137'; // Changed from '1' (Ethereum) to '137' (Polygon)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function approveToken(tokenAddress, amount, spender) {
    console.log("Approving the allowance for the swap...");
    
    const contract = new ethers.Contract(tokenAddress, ["function approve(address spender, uint256 amount)"], wallet);
    const approvalTx = await contract.approve(spender, amount);
    console.log("Approval tx: ", approvalTx);
}

const headers = {
    headers: {
        Authorization: `Bearer ${process.env.LIFI_API_KEY}`,
        accept: "*/*",
    },
};

async function main(){
    // Polygon mainnet example - SWAP (same chain)
    const params = {
        fromChain: chain, // 137 = Polygon
        toChain: chain,   // 137 = Polygon (SWAP on same chain)
        fromToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
        toToken: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",   // WETH on Polygon
        fromAddress: wallet.address,
        fromAmount:"1000000" // 1 USDC (6 decimals)
    }

    const data = await fetch(`${process.env.LIFI_API}v1/quote?${qs.stringify(params)}`, headers);
    const {transactionRequest} = await data.json() 
    console.log(transactionRequest);

    await approveToken(params.fromToken, params.fromAmount, transactionRequest.to)
    await sleep(15000)
    
    const swapTxn = await wallet.sendTransaction({to:transactionRequest.to, data: transactionRequest.data});
    console.log("swapTxn : ", swapTxn);
}

main().catch((e) => {
    console.error(e);
});