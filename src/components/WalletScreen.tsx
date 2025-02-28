import BalanceCard from "./BalanceCard";
import TokenList from "./TokenList";
import BottomNav from "./BottomNav";
import { useWeb3Auth } from "../context/Web3AuthContext";

const WalletScreen = () => {
  const { loggedIn, logout } = useWeb3Auth(); // ✅ Use logout from context

  if (!loggedIn) return null; // Hide if not logged in
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 p-4 text-white">
      <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-lg">
        
        {/* Logo & Profile */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold">W</div>
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-sm font-semibold">AB</span>
          </div>
          <button
            onClick={logout}
            className="self-end text-gray-400 hover:text-white bg-gray-700 px-3 py-1 rounded-md"
          >
            Logout
          </button>
        </div>

        {/* Balance & Actions */}
        <BalanceCard />

        {/* Toggle Buttons */}
        <div className="flex justify-between my-4">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold">
            Tokens
          </button>
          <button className="flex-1 bg-gray-700 text-gray-400 py-2 rounded-lg font-semibold ml-2">
            NFT
          </button>
        </div>

        {/* Token List */}
        <TokenList />

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default WalletScreen;