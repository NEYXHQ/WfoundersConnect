import { useWeb3Auth } from "../context/Web3AuthContext";
import ethersRPC from "../hooks/ethersRPC";
import { useEffect, useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

const BalanceCard = () => {
  const { provider } = useWeb3Auth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false); 
  const [prices, setPrices] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!provider) return;

    const fetchAddress = async () => {
      const address = await ethersRPC.getAccounts(provider);
      setWalletAddress(address);
    };

    fetchAddress();

    // ✅ Fetch USD prices
    // const fetchPrices = async () => {
    //   try {
    //     const response = await fetch(
    //       "https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0?include_market_cap=false&include_24hr_vol=false"
    //     );
    
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! Status: ${response.status}`);
    //     }
    
    //     const data = await response.json();
    //     if (data) {
    //       const priceMap: { [key: string]: number } = {};
    //       for (const token in data.data) {
    //         priceMap[token] = parseFloat(data.data[token].price);
    //       }
    //       setPrices(priceMap);
    //       console.log(`price map : ${response}`);
    //     }
    
    //     return data;
    //   } catch (error) {
    //     console.error("❌ Error fetching prices:", error);
    //     return null;
    //   }
    // };


    fetchPrices();
    
  }, [provider]);

  const fetchPrices = async () => {
    try {
      const response = await fetch(
        "https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0?include_market_cap=false&include_24hr_vol=false"
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("🟢 Price API Response:", data.data.attributes.token_prices); // ✅ Log the full JSON response
      if (data) {
        setPrices(data.data.attributes.token_prices);
      }
  
      return data;
    } catch (error) {
      console.error("❌ Error fetching prices:", error);
      return null;
    }
  };

  const getTotalBalanceUSD = () => {
    let total = 0;
    for (const key in prices) {
      total += prices[key];
    }
    return total;
  };

  // ✅ Format Address (e.g., 0x1234...5678)
  const formattedAddress = walletAddress
    ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}`
    : "Not Connected";

  // ✅ Copy Address to Clipboard
  const copyToClipboard = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);

    // Reset after 1 sec
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-700 to-blue-500 p-4 rounded-lg shadow-md">
      {/* ✅ Address Section */}
      <div className="flex items-center justify-between text-sm text-gray-200">
        <span>{formattedAddress}</span>
        <button
          onClick={copyToClipboard}
          className="text-gray-300 hover:text-white transition"
        >
          {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
        </button>
      </div>

      {/* ✅ Copy Overlay */}
      {copied && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center rounded-lg transition-opacity duration-300">
          <span className="text-white text-sm font-semibold">Address Copied!</span>
        </div>
      )}

      {/* ✅ Balance (Static for now) */}
      <div className="text-3xl font-bold mt-2">${getTotalBalanceUSD()} <span className="text-lg">USD</span></div>

      {/* ✅ Actions */}
      <div className="flex justify-between mt-4">
        <button className="bg-blue-600 px-4 py-2 rounded-lg text-white">⬆ Send</button>
        <button className="bg-blue-600 px-4 py-2 rounded-lg text-white">⬇ Receive</button>
        <button className="bg-blue-600 px-4 py-2 rounded-lg text-white">➕ Buy</button>
      </div>
    </div>
  );
};

export default BalanceCard;