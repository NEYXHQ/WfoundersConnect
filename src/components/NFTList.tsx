import { useEffect, useState } from "react";
import { useWeb3Auth } from "../context/Web3AuthContext";
import RPC from "../hooks/ethersRPC";

const NFTList = () => {
    const { provider } = useWeb3Auth();
    const [nfts, setNFTs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedNFT, setExpandedNFT] = useState<number | null>(null);

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
        <div className="w-full">
            <h2 className="text-lg font-semibold text-gray-300 my-4 text-center">Your NFTs</h2>

            {loading ? (
                <p className="text-gray-400">Loading NFTs...</p>
            ) : nfts.length === 0 ? (
                <p className="text-gray-500">No NFTs found for this wallet.</p>
            ) : (
                <div className="space-y-4">
                    {nfts.map((nft, index) => {
                        const isExpanded = expandedNFT === index;
                        return (
                            <div
                                key={index}
                                className={`bg-gray-700 rounded-lg overflow-hidden w-full shadow-lg ${isExpanded ? "" : "p-4 flex items-center cursor-pointer"
                                    }`}
                                onClick={() => setExpandedNFT(isExpanded ? null : index)}
                            >
                                {/* Default View */}
                                {!isExpanded ? (
                                    <>
                                        <img
                                            src={nft.metadata.image}
                                            alt={nft.metadata.name}
                                            className="w-12 h-12 rounded-lg mr-4"
                                        />
                                        <div>
                                            <p className="text-orange-300 font-medium">{nft.metadata.name}</p>
                                            <p className="text-gray-400 text-sm break-words whitespace-normal">{nft.metadata.description}</p>
                                        </div>
                                    </>
                                ) : (
                                    // Expanded View
                                    <>
                                        <div className="w-full">
                                            <img
                                                src={nft.metadata.image}
                                                alt={nft.metadata.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <p className="text-orange-300 font-medium text-lg">{nft.metadata.name}</p>
                                            <p className="text-gray-400 text-sm">{nft.metadata.description}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NFTList;