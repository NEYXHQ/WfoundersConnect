import { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";
import { BsArrowUpRightCircle, BsArrowDownCircle, BsArrowLeftRight } from "react-icons/bs";
import { FaRegCheckCircle } from "react-icons/fa";

import { useWeb3Auth } from "../context/Web3AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import neyxtLogo from "/NEYX_logo.svg";
import RPC from "../hooks/ethersRPC";


interface BalanceCardProps {
  walletAddress: string;
  neyxtBalance: number;
  networkBalance: number;
  prices: { [key: string]: string };
}

const BalanceCard: React.FC<BalanceCardProps> = ({ walletAddress, neyxtBalance, networkBalance, prices }) => {

  const [copied, setCopied] = useState<boolean>(false);

  const [showSendForm, setShowSendForm] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [token, setToken] = useState("POL"); // Default to POL
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [showQR, setShowQR] = useState(false);

  const { provider } = useWeb3Auth();


  const getTotalBalanceUSD = () => {
    const neyxtPrice = parseFloat(prices["0xYourNEYXTTokenAddress"] || "0");
    const networkPrice = parseFloat(prices["0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"] || "0");
    const totalUSD = (neyxtBalance * neyxtPrice) + (networkBalance * networkPrice);
    return totalUSD.toFixed(2);
  };

  const handleSendTransaction = async () => {

    if (!provider || !recipient || !amount) return;

    setLoading(true);

    try {
      let txReceipt;
      if (token === "POL") {
        txReceipt = await RPC.sendTransaction(provider, recipient, amount);
      } else {
        txReceipt = await RPC.sendToken(provider, recipient, amount);
      }

      const hash = txReceipt?.hash ?? txReceipt; // fallback if txReceipt is already a string
      setTxHash(hash);
      
      setShowSuccess(true);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error: unknown) {
      let errorMessage = "Transaction failed. Please try again.";
    
      if (error && typeof error === "object" && "message" in error) {
        const errMsg = (error as { message: string }).message.toLowerCase();
    
        if (errMsg.includes("insufficient funds")) {
          errorMessage = "Not enough balance to cover transaction fees.";
        } else if (errMsg.includes("invalid address")) {
          errorMessage = "Invalid recipient address.";
        } else if (errMsg.includes("user rejected transaction")) {
          errorMessage = "Transaction rejected by user.";
        }
      } else {
        console.error("❌ Unknown error:", error);
      }
    
      alert(errorMessage);
    } finally {
      setLoading(false);
      setShowSendForm(false); // Hide the form after sending
    }
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
    <div className="relative bg-[#1e1e1e] p-4 rounded-xl shadow-md border border-[#ff8600]/20">
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

      {/* ✅ NEYXT Balance */}
      <div className="flex items-center gap-4 mt-4">
        <img src={neyxtLogo} alt="NEYXT" className="w-10 h-10 rounded-full" />
        <div className="text-white">
          <p className="text-sm text-orange-400">Your WNEYXT Balance</p>
          <p className="text-xl font-bold text-white">{neyxtBalance.toFixed(2)} WNEYXT</p>
        </div>
      </div>




      {/* Actions */}
      <div className="flex justify-between mt-4 gap-3">
        <button onClick={() => setShowSendForm(!showSendForm)} className="flex-1 border border-[#ff8600] bg-[#ff8600]/80 px-4 py-2 rounded-lg text-white flex items-center justify-center hover:bg-[#ff8600] transition">
          <BsArrowUpRightCircle />
        </button>
        <button onClick={() => setShowQR(true)} className="flex-1 border border-[#ff8600] bg-[#ff8600]/80 px-4 py-2 rounded-lg text-white flex items-center justify-center hover:bg-[#ff8600] transition">
          <BsArrowDownCircle /></button>
        {/* <button className="flex-1 border border-white bg-blue-600 px-4 py-2 rounded-lg text-white flex items-center justify-center">
          <BsArrowLeftRight /></button> */}
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowQR(false)} // Close QR modal when clicking outside
        >
          <div className="bg-white p-6 rounded-lg shadow-lg text-center relative">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Receive Funds</h2>
            <div className="flex justify-center">
              <QRCodeCanvas value={walletAddress} size={180} />
            </div>

            <p className="text-gray-500 text-sm mt-2">{walletAddress}</p>
            <button
              onClick={() => setShowQR(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Send Form */}
      {showSendForm && (
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <input
            type="text"
            placeholder="Recipient Address"
            className="w-full p-2 rounded bg-gray-700 text-white mb-2"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <select
            className="w-full p-2 rounded bg-gray-700 text-white mb-2"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          >
            <option value="POL">POL</option>
            <option value="NEYXT">NEYXT</option>
          </select>

          <input
            type="number"
            placeholder="Amount"
            className="w-full p-2 rounded bg-gray-700 text-white mb-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setShowSendForm(false)}
              className={loading ?
                "border border-gray-500 text-gray-500 py-2 px-4 rounded-lg shadow-md"
                :
                "border border-white text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition"}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleSendTransaction}
              className="bg-orange-400 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Confirm Send"}
            </button>
          </div>
        </div>
      )}

      {/* Transaction Success Message */}
      {showSuccess && txHash && (
        <div
          onClick={() => setShowSuccess(false)}
          className="mt-4 bg-gray-800 p-4 rounded-lg shadow-md text-center cursor-pointer transition-opacity duration-300 hover:bg-gray-700"
        >
          {/* Icon & Success Message (Same Line) */}
          <div className="flex items-center justify-center space-x-2">
            <FaRegCheckCircle className="text-green-500 text-2xl" />
            <p className="text-green-500 font-medium">Success!</p>
          </div>

          {/* TxHash Label & Link (Separate Line) */}
          <p className="text-gray-400 mt-1">TxHash:</p>
          <a
            href={provider.chainConfig.blockExplorerUrl + "tx/" + txHash}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline font-medium hover:text-blue-300 block mt-1"
          >
            {txHash.slice(0, 6)}...{txHash.slice(-4)}
          </a>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;