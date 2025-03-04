import { useEffect, useState } from "react";
import { useWeb3Auth, chainConfig } from "../context/Web3AuthContext";
import RPC from "../hooks/ethersRPC";
import neyxtLogo from "/NEYX_logo.svg"; 

const TokenList = () => {
  const { provider } = useWeb3Auth();
  const [neyxtBalance, setNeyxtBalance] = useState<string | null>(null);
  const [networkBalance, setNetworkBalance] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!provider) return;
      
      try {
        const neyxt = await RPC.getNEYXTBalance(provider);
        const network = await RPC.getNetworkBalance(provider);
        
        setNeyxtBalance(parseFloat(neyxt).toFixed(2));
        setNetworkBalance(parseFloat(network).toFixed(4));
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
  }, [provider]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300">Your Tokens</h2>
      <div className="mt-2 space-y-2">
        {/* NEYXT Balance */}
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <img src={neyxtLogo} alt="NEYXT" className="w-6 h-6 mr-2" />
          <span className="text-white font-medium">NEYXT</span>
          <span className="ml-auto text-gray-300">{neyxtBalance ?? "--"} NEYXT</span>
        </div>

        {/* Network Balance */}
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <img src={chainConfig.logo} alt={chainConfig.ticker} className="w-6 h-6 mr-2" />
          <span className="text-white font-medium">POL</span>
          <span className="ml-auto text-gray-300">{networkBalance ?? "--"} POL</span>
        </div>
      </div>
    </div>
  );
};

export default TokenList;