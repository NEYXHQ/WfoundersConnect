/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IProvider } from "@web3auth/base";
import { ethers } from "ethers";

// // NEYXT & NFT Contracts - PROD
// const NEYXT_CONTRACT_ADDRESS = "0x86b8B002ff72Be60C63E9Ae716348EDC1771F52e";
// const NFT_CONTRACT_ADDRESS = "0x5f200aB4e1aCa5cDABDA06dD8079f2EB63Dd01b4";

// NEYXT & NFT Contracts - DEV
const NEYXT_CONTRACT_ADDRESS = "0x5911FF908512f9CAC1FC8727dDBfca208F164814";
const NFT_CONTRACT_ADDRESS = "0x19fB0271e0F0380645b15C409e43e92F8774b5F1";

// ERC20 ABI for balance
const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];
const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

const getChainId = async (provider: IProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    // Get the connected Chain's ID
    const networkDetails = await ethersProvider.getNetwork();
    console.log(`Net Details : \n ${networkDetails}`);
    return networkDetails.chainId.toString();
  } catch (error) {
    return error;
  }
}

const getAccounts = async (provider: IProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get user's Ethereum public address
    const address = signer.getAddress();

    return await address;
  } catch (error) {
    return error;
  }
}

const getBalance = async (provider: IProvider): Promise<string> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get user's Ethereum public address
    const address = signer.getAddress();

    // Get user's balance in ether
    const balance = ethers.formatEther(
      await ethersProvider.getBalance(address) // Balance is in wei
    );

    return balance;
  } catch (error) {
    return error as string;
  }
}

const sendTransaction = async (provider: IProvider, recipient: string, amount: string): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const parsedAmount = ethers.parseEther(amount);
    const fees = await ethersProvider.getFeeData()

    // Submit transaction to the blockchain
    const tx = await signer.sendTransaction({
      to: recipient,
      value: parsedAmount,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas, // Max priority fee per gas
      maxFeePerGas: fees.maxFeePerGas, // Max fee per gas
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    return error as string;
  }
}

const sendToken = async (provider: IProvider, recipient: string, amount: string): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const contract = new ethers.Contract(NEYXT_CONTRACT_ADDRESS, ERC20_ABI, signer);

    const decimals = 18; // Adjust based on NEYXT token decimals
    const parsedAmount = ethers.parseUnits(amount, decimals);
    
    const tx = await contract.transfer(recipient, parsedAmount);
    return await tx.wait();
  } catch (error) {
    throw new Error(error as string);
  }
};

const signMessage = async (provider: IProvider): Promise<any> => {
  try {
    // For ethers v5
    // const ethersProvider = new ethers.providers.Web3Provider(provider);
    const ethersProvider = new ethers.BrowserProvider(provider);

    // For ethers v5
    // const signer = ethersProvider.getSigner();
    const signer = await ethersProvider.getSigner();
    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const signedMessage = await signer.signMessage(originalMessage);

    return signedMessage;
  } catch (error) {
    return error as string;
  }
}

// ✅ Get Native Token Balance (ETH, POL, etc.)
const getNetworkBalance = async (provider: IProvider): Promise<string> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const address = await getAccounts(provider);
    const balance = await ethersProvider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    return `Error: ${error}`;
  }
};

// ✅ Get NEYXT Token Balance (ERC-20)
const getNEYXTBalance = async (provider: IProvider): Promise<string> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const address = await getAccounts(provider);

    const contract = new ethers.Contract(NEYXT_CONTRACT_ADDRESS, ERC20_ABI, ethersProvider);
    const balance = await contract.balanceOf(address);
    
    return ethers.formatUnits(balance, 18); // Adjust decimals based on token config
  } catch (error) {
    return `Error: ${error}`;
  }
};

// for now only fetches in NFT per address
const getNFTs = async (provider: IProvider): Promise<any[]> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();

    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ERC721_ABI, ethersProvider);
    const balance = await contract.balanceOf(address);

    if (balance.toString() === "0") return [];

    const nfts = [];
    // // PROD
    // const response = await fetch(`https://wfounders.club/api/metadata/${address}`);

    // DEV
    const response = await fetch(`https://wfounders.club/api/metadata/amoy/${address}`);

    if (!response.ok) throw new Error("No NFT found for this wallet.");

    const metadata = await response.json();

    nfts.push({
      metadata,
    });


    return nfts;
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
};

const mintMemberNFT = async (provider: IProvider, recipient: string, tokenId: number): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, [
      "function safeMint(address to, uint256 tokenId) public",
    ], signer);

    const tx = await contract.safeMint(recipient, tokenId);
    console.log(`🚀 Minting NFT. TX: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Minted NFT for ${recipient}:`, receipt);
    return receipt;
  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    throw error;
  }
};

export default {
  getChainId,
  getAccounts,
  getBalance,
  getNetworkBalance,
  getNEYXTBalance,
  getNFTs,
  sendTransaction,
  sendToken,
  signMessage,
  mintMemberNFT, 
};

// export default {getChainId, getAccounts, getBalance, sendTransaction, signMessage};