/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IProvider } from "@web3auth/base";
import { ethers } from "ethers";

// Dont forget the Web3AuthContext change

// ERC20 ABI for balance
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
];
const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function claimNFTWithSig(address user, string tokenURI_, uint256 deadline, uint256 eventId, bytes signature)",
  "function nonces(address) view returns (uint256)",
  "function nftPrice() view returns (uint256)"
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
    const contract = new ethers.Contract(import.meta.env.VITE_NEYXT_CONTRACT_ADDRESS, ERC20_ABI, signer);

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

    const contract = new ethers.Contract(import.meta.env.VITE_NEYXT_CONTRACT_ADDRESS, ERC20_ABI, ethersProvider);
    const balance = await contract.balanceOf(address);

    console.log(`balance = ${ethers.formatUnits(balance, 18)} for NEYXT contract ${import.meta.env.VITE_NEYXT_CONTRACT_ADDRESS}`)

    return ethers.formatUnits(balance, 18); // Adjust decimals based on token config
  } catch (error) {
    return `Error: ${error}`;
  }
};

const getNFTs = async (provider: IProvider): Promise<any[]> => {
  try {
    console.log(`🔍 Getting all NFTs...`);
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();

    const allNFTs = [];

    // Membership NFT
    try {
      const membershipContract = new ethers.Contract(import.meta.env.VITE_NFT_MEMBERSHIP_ADDRESS, ERC721_ABI, ethersProvider);
      console.log(`Membership contract : ${membershipContract.target}`);
      const membershipBalance = await membershipContract.balanceOf(address);
      if (membershipBalance.toString() !== "0") {
        const membershipMetadataUrl = `${import.meta.env.VITE_API_URL}metadata/${address}`;
        console.log(`📦 Membership NFT: ${membershipMetadataUrl}`);
        const res = await fetch(membershipMetadataUrl);
        if (res.ok) {
          const metadata = await res.json();
          allNFTs.push({ type: "membership", metadata });
        }
      }
    } catch (err) {
      console.warn("❌ Error fetching membership NFT:", err);
    }

    console.log(`Fetching Event NFT`);
    // Event NFT (Claimable)
    try {
      const claimableContract = new ethers.Contract(import.meta.env.VITE_CLAIMABLE_NFT_CONTRACT, ERC721_ABI, ethersProvider);
      const claimableBalance = await claimableContract.balanceOf(address);
      console.log(`NFT Claim address = ${import.meta.env.VITE_CLAIMABLE_NFT_CONTRACT}`);
      console.log(`Claimable balance : ${claimableBalance}`);
      for (let i = 0; i < claimableBalance; i++) {
        console.log(`iteration : ${i}`);
        const tokenId = await claimableContract.tokenOfOwnerByIndex(address, i);
        console.log(`Token id : ${tokenId}`);
        const tokenURI = await claimableContract.tokenURI(tokenId);
        console.log(`📦 Event NFT [${tokenId}]: ${tokenURI}`);

        const res = await fetch(tokenURI);
        if (res.ok) {
          const metadata = await res.json();
          allNFTs.push({ type: "event", tokenId: tokenId.toString(), metadata });
        }
      }
    } catch (err) {
      console.warn("❌ Error fetching event NFT:", err);
    }

    return allNFTs;
  } catch (error) {
    console.error("❌ Error fetching NFTs:", error);
    return [];
  }
};

const mintMemberNFT = async (provider: IProvider, recipient: string, tokenId: number): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const contract = new ethers.Contract(import.meta.env.VITE_NFT_MEMBERSHIP_ADDRESS, [
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

const ensureApproval = async (
  signer: ethers.JsonRpcSigner,
  userAddress: string,
  spenderAddress: string,
  amount: bigint
): Promise<boolean> => {
  try {
    const wNEYXTContract = new ethers.Contract(import.meta.env.VITE_NEYXT_CONTRACT_ADDRESS, ERC20_ABI, signer);

    const currentAllowance = await wNEYXTContract.allowance(userAddress, spenderAddress);
    console.log("💰 Current allowance:", currentAllowance.toString());

    if (currentAllowance >= amount) {
      return true; // already approved
    }

    console.log("🛂 Not enough allowance. Requesting approval...");

    const tx = await wNEYXTContract.approve(spenderAddress, amount * 10n);
    console.log("⏳ Waiting for approval tx...");

    await tx.wait();

    console.log("✅ Approval successful.");
    return true;
  } catch (err: any) {
    console.error("❌ User rejected the approval or tx failed:", err.message || err);
    return false;
  }
};

// tokenId = (eventId << 64) | attendeeIndex
// Ensures uniqueness per user and event
const claimEventNFT = async (
  provider: IProvider,
  address: string,
  tokenURI = `${import.meta.env.VITE_API_URL}claim/metadata.json?uri=${import.meta.env.VITE_CLAIMABLE_EVENT_ID}`,
  eventId = import.meta.env.VITE_CLAIMABLE_EVENT_ID
): Promise<any> => {
  try {

    const ethersProvider = new ethers.BrowserProvider(provider);
    const wNEYXTContract = new ethers.Contract(import.meta.env.VITE_NEYXT_CONTRACT_ADDRESS, ERC20_ABI, ethersProvider);
    const allowance = await wNEYXTContract.allowance(address, import.meta.env.VITE_CLAIMABLE_NFT_CONTRACT);
    const balance = await wNEYXTContract.balanceOf(address);

    // const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    console.log("🔐 Signer address:", await signer.getAddress());

    const contract = new ethers.Contract(
      import.meta.env.VITE_CLAIMABLE_NFT_CONTRACT,
      ERC721_ABI,
      signer
    );
    console.log("📄 Connected to contract at:", import.meta.env.VITE_CLAIMABLE_NFT_CONTRACT);

    console.log("Checking approval ?");
    const nftPrice = await contract.nftPrice();
    console.log("🏷️ NFT Price:", nftPrice);
    const approved = await ensureApproval(signer, address, import.meta.env.VITE_CLAIMABLE_NFT_CONTRACT, nftPrice);

    if (!approved) {
      throw new Error("User rejected token approval. Cannot proceed with claim.");
    }

    const deadline = Math.floor(Date.now() / 1000) + 3600;
    console.log("⏱️ Deadline (epoch seconds):", deadline);

    const nonce = await contract.nonces(address);

    const rawHash = ethers.solidityPackedKeccak256(
      ["address", "string", "uint256", "uint256", "uint256"],
      [address, tokenURI, deadline, eventId, nonce]
    );

    const signature = await signer.signMessage(ethers.getBytes(rawHash));

    

    // https://wfounders.club/api/dev/
    console.log("API call on : ",import.meta.env.VITE_API_URL);
    const response = await fetch(`${import.meta.env.VITE_API_URL}claimNFT`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: address,
        tokenURI_: tokenURI,
        deadline: deadline.toString(),
        eventId,
        nonce: nonce.toString(),
        signature,
      }),
    });

    const result = await response.json();
    console.log("📨 Backend response:", result);

    // Check for HTTP errors
    if (!response.ok || result.status !== "success") {
      const errorMessage = result.message || "Unknown backend error";
      console.error("❌ Backend rejected the claim:", errorMessage);
      throw new Error(errorMessage);
    }

    return result;

  } catch (error: any) {
    console.error("❌ Error claiming NFT:", error.message || error);
    if (error?.data) {
      console.error("↩️ Error data:", error.data);
    }
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
  claimEventNFT,
};

// export default {getChainId, getAccounts, getBalance, sendTransaction, signMessage};