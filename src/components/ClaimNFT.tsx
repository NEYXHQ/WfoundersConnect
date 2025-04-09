import { useState } from "react";
import { IProvider } from "@web3auth/base";
import { useWeb3Auth } from "../context/Web3AuthContext";
import RPC from "../hooks/ethersRPC";
import { FaRegCircleCheck } from "react-icons/fa6";

interface ClaimNFTProps {
  address: string;
}

const ClaimNFT: React.FC<ClaimNFTProps> = ({ address }) => {
  const { provider } = useWeb3Auth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await RPC.claimEventNFT(provider as IProvider, address);
      console.log("✅ Claimed:", result);
      setSuccess(true);
    } catch (err) {
      setError("Claim failed. Ensure you have enough WNEYXT.");
      console.log(`Error in handleClaim : ${err}`)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1f1c] p-4 rounded-xl border border-orange-500/30 text-center shadow-inner">
      <p className="text-orange-300 mb-4">Mint your exclusive Event NFT</p>
      <button
        onClick={handleClaim}
        disabled={loading || success}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
          success
            ? "bg-green-700 text-white"
            : "bg-orange-500 hover:bg-orange-400 text-white"
        }`}
      >
        {loading ? "Minting..." : success ? (
          <span className="flex items-center justify-center gap-2">
            <FaRegCircleCheck /> NFT Claimed
          </span>
        ) : (
          "Claim NFT"
        )}
      </button>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ClaimNFT;