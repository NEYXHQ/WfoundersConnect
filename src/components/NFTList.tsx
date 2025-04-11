import { useEffect, useState } from "react";
import { useWeb3Auth } from "../context/Web3AuthContext";
import RPC from "../hooks/ethersRPC";

interface NFTListProps {
    nfts: any[];
    setNFTs: React.Dispatch<React.SetStateAction<any[]>>;
    setNftsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  }


const NFTList: React.FC<NFTListProps> = ({ nfts, setNFTs, setNftsLoading }) => {
    const { provider } = useWeb3Auth();
    const [expandedNFT, setExpandedNFT] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchNFTs = async () => {
            if (!provider) {
                console.log(`No provider`);
                return;
            }

            try {
                
                const fetchedNFTs = await RPC.getNFTs(provider);
                setNFTs(fetchedNFTs);
            } catch (error) {
                console.error("Error fetching NFTs:", error);
            } finally {
                setNftsLoading(false);
                setLoading(false);
            }
        };

        fetchNFTs();
    }, [provider, setNFTs]);
  

    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold text-gray-300 my-4 text-center">Your NFTs</h2>

            {loading ? (
                <p className="text-gray-400">Loading NFTs...</p>
            ) : nfts.length === 0 ? (
                <p className="text-gray-500">No NFTs found for this wallet...</p>
            ) : (
                <div className="space-y-4">
                    {nfts.map((nft, index) => {
                        const isExpanded = expandedNFT === index;
                        const eventDateAttr = nft.metadata.attributes?.find(
                            (attr: any) => attr.trait_type === "Formatted Date"
                          );

                          const formattedDate = eventDateAttr
                          ? new Date(eventDateAttr.value).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })
                          : null;
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
                                            <p className="text-gray-400 text-sm">
                                              {nft.metadata.description}
                                              {formattedDate && (
                                                <span className="text-orange-200 italic text-xs"> - ({formattedDate})</span>
                                              )}
                                            </p>
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
                                            <p className="text-gray-400 text-sm">
                                              {nft.metadata.description}
                                              {formattedDate && (
                                                <span className="text-orange-200 italic text-xs"> - ({formattedDate})</span>
                                              )}
                                            </p>
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