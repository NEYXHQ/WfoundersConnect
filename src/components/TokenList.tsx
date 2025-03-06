
import { chainConfig } from "../context/Web3AuthContext";
import neyxtLogo from "/NEYX_logo.svg"; 

interface TokenListProps {
  neyxtBalance: number;
  networkBalance: number;
}

const TokenList: React.FC<TokenListProps> = ({ neyxtBalance, networkBalance }) => {

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300">Your Tokens</h2>
      <div className="mt-2 space-y-2">
        {/* NEYXT Balance */}
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <img src={neyxtLogo} alt="NEYXT" className="w-6 h-6 mr-2" />
          <span className="text-white font-medium">WNEYXT</span>
          <span className="ml-auto text-gray-300">{(neyxtBalance ?? 0).toFixed(4)}</span>
        </div>

        {/* Network Balance */}
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <img src={chainConfig.logo} alt={chainConfig.ticker} className="w-6 h-6 mr-2" />
          <span className="text-white font-medium">{chainConfig.ticker}</span>
          <span className="ml-auto text-gray-300">{(networkBalance ?? 0).toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};

export default TokenList;