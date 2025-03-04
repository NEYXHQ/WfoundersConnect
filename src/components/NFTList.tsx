import { useEffect, useState } from "react";
import { useWeb3Auth } from "../context/Web3AuthContext";
import RPC from "../hooks/ethersRPC";

const NFTList = () => {
  const { provider } = useWeb3Auth();
  const [nfts, setNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!provider) return;

      try {
        setLoading(true);
        const fetchedNFTs = await RPC.getNFTs(provider);
        setNFTs(fetchedNFTs);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [provider]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300">Your NFTs</h2>
      
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : nfts.length === 0 ? (
        <p className="text-gray-400">No NFTs found</p>
      ) : (
        <div className="mt-2 space-y-2">
          {nfts.map((nft, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg flex items-center">
              <img src={nft.metadata} alt={`NFT ${nft.tokenId}`} className="w-12 h-12 mr-3 rounded-lg" />
              <div>
                <span className="text-white font-medium">NFT #{nft.tokenId}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTList;