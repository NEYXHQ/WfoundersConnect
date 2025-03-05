import { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

interface BalanceCardProps {
  walletAddress: string;
  neyxtBalance: number;
  networkBalance: number;
  prices: { [key: string]: string };
}

const BalanceCard: React.FC<BalanceCardProps> = ({ walletAddress, neyxtBalance, networkBalance, prices }) => {

  const [copied, setCopied] = useState<boolean>(false); 
  
  const getTotalBalanceUSD = () => {
    const neyxtPrice = parseFloat(prices["0xYourNEYXTTokenAddress"] || "0");
    const networkPrice = parseFloat(prices["0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"] || "0");
    const totalUSD = (neyxtBalance * neyxtPrice) + (networkBalance * networkPrice);
    return totalUSD.toFixed(2);
  };

  // const getTotalBalanceUSD = () => {
    
  //   let total = 0;
  //   for (const key in prices) {
  //     total += prices[key];
  //     console.log(` prices ${prices[key]} / key ${key}`);
  //   }
  //   return total;
  // };

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