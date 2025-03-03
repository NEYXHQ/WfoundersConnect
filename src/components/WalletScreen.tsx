import { useState } from "react";
import BalanceCard from "./BalanceCard";
import TokenList from "./TokenList";
import BottomNav from "./BottomNav";
import { useWeb3Auth } from "../context/Web3AuthContext";
import { LuUserRoundCheck } from "react-icons/lu";

const WalletScreen = () => {
  const { loggedIn, logout, getUserInfo, userInfo } = useWeb3Auth(); // ✅ Use logout from context
  const { profileImage, verifierId } = userInfo;
  const [menuOpen, setMenuOpen] = useState(false); // ✅ Toggle state for menu

  if (!loggedIn) return null; // Hide if not logged in
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 p-4 text-white">
      <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-lg">
        
        {/* Logo & Profile */}
        <div className="flex justify-between items-center mb-4 relative">
          <div className="text-2xl font-bold">WF</div>

          {/* Profile Section */}
          <div className="relative flex items-center space-x-2">
            {/* Verifier ID (email) */}
            {verifierId && (
              <span className="text-xs text-gray-400 truncate">{verifierId}</span>
            )}

            {/* Profile Picture / Initials */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none"
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : verifierId ? (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {verifierId.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <LuUserRoundCheck className="text-green-200 text-lg" />
                </div>
              )}
            </button>

            {/* Logout Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
                >
                  Logout
                </button>
                {/* <button
                  onClick={async () => {
                    console.log("Manually fetching user info...");
                    await getUserInfo(); // 🔄 Force fetching user data
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
                >
                  🔄 Force Update
                </button> */}
              </div>
            )}
          </div>
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