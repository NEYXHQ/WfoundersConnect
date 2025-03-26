import { useState, useEffect, useRef } from "react";
import OnBoardingMint from "./OnBoardingMint";
import BalanceCard from "./BalanceCard";
import TokenList from "./TokenList";
import NFTList from "./NFTList";
import BottomNav from "./BottomNav";
import { useWeb3Auth, chainConfig } from "../context/Web3AuthContext";
import { LuUserRoundCheck } from "react-icons/lu";
import { FaSpinner, FaRegCheckCircle } from "react-icons/fa"; // ✅ Loading icon


import RPC from "../hooks/ethersRPC";


const WalletScreen = () => {
  const { loggedIn, logout, userInfo, provider } = useWeb3Auth(); // ✅ Use logout from context
  const { profileImage, verifierId } = userInfo;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null); // 🔹 Reference for the menu
  const [showNFTs, setShowNFTs] = useState(false);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [neyxtBalance, setNeyxtBalance] = useState<number>(0);
  const [networkBalance, setNetworkBalance] = useState<number>(0);
  const [prices, setPrices] = useState<{ [key: string]: string }>({});

  enum UserClubStatus {
    UNAPPROVED = 0, // No wallet
    WAITING = 1, // Connected wallet and approval process started and waiting to be approved
    APPROVED = 2, // Approved
    UNREGISTERED = 3, // No wallet and no name 
  }

  const [approvalStatus, setApprovalStatus] = useState(UserClubStatus.APPROVED);
  const [isOnboarding, setIsOnBoarding] = useState(false); // ✅ New state for NFT minting


  useEffect(() => {
    const fetchBalancesAndPrices = async () => {
      if (!provider) return;

      try {
        // Fetch Address
        const address = await RPC.getAccounts(provider);
        setWalletAddress(address);

        // Fetch balances
        const neyxt = await RPC.getNEYXTBalance(provider);
        const network = await RPC.getNetworkBalance(provider);
        setNeyxtBalance(parseFloat(neyxt));
        setNetworkBalance(parseFloat(network));

        // Fetch token prices
        const response = await fetch(
          "https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0?include_market_cap=false&include_24hr_vol=false"
        );
        const data = await response.json();
        setPrices(data.data.attributes.token_prices);

      } catch (error) {
        console.error("Error fetching balances/prices:", error);
      }
    };

    fetchBalancesAndPrices();
  }, [provider]);

  // 🔹 Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkUserClubStatus = async () => {
      if (!walletAddress) return;

      try {
        const response = await fetch(`https://wfounders.club/api/is-approved?address=${walletAddress}`);
        const data = await response.json();

        setApprovalStatus(data.status);
        console.log(`Approval Status (in walletScreen)= ${data.status}`);

      } catch (error) {
        console.error("Error checking user approval:", error);
      }
    };

    if (walletAddress) {
      checkUserClubStatus();
    }
  }, [walletAddress]);

  if (!loggedIn) return null; // Hide if not logged in

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-[#141414] p-0 text-white ">
      <div className="w-full max-w-[500px] min-w-[250] bg-gray-800 p-4 rounded-lg shadow-lg">

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
              <div ref={menuRef} className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={logout}
                  className="block w-full text-left px-2 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
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

        <div className="text-xs text-gray-500 text-right opacity-70 mt-2 mb-2">
          {chainConfig.displayName}
        </div>

        {/* Approval & Onboarding Section */}
        <div className="text-xs text-gray-400 text-right opacity-70 mt-2 mb-2">
          {isOnboarding ? (
            <div className="bg-green-700 p-4 rounded-lg shadow-lg text-white flex items-center justify-center space-x-2">
              <FaSpinner className="animate-spin text-white text-lg" />
              <p>Welcome to WFounders Club, minting your membership NFT...</p>
            </div>
          ) : approvalStatus === UserClubStatus.APPROVED ? (
            <span className="text-orange-300 flex items-center justify-end gap-1">
              <FaRegCheckCircle className="text-lg" />
              Approved
            </span>
          ) : (
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg mt-4">
              <h2 className="text-white text-sm font-semibold mb-2">Onboarding Required</h2>
              <OnBoardingMint
                address={walletAddress ?? ""}
                approvalStatus={approvalStatus} // ✅ Pass initial status
                onApprovalStatusChange={(newStatus: UserClubStatus) => setApprovalStatus(newStatus)}
                isOnBoarding={isOnboarding}
                onIsOnBoardingChange={(isOnBoardingChange: boolean) => setIsOnBoarding(isOnboarding)}
              />
            </div>
          )}
        </div>

        {/* Balance & Actions */}
        {/* Balance Card */}
        <BalanceCard
          walletAddress={walletAddress ?? ""}
          neyxtBalance={neyxtBalance}
          networkBalance={networkBalance}
          prices={prices}
        />

        {/* Toggle Buttons */}
        {/* <div className="flex justify-between my-4">
          <button
            onClick={() => setShowNFTs(false)}
            className={`flex-1 py-2 rounded-lg font-semibold ml-2 ${!showNFTs ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
          >
            Tokens
          </button>
          <button
            onClick={() => setShowNFTs(true)}
            className={`flex-1 py-2 rounded-lg font-semibold ml-2 ${showNFTs ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
          >
            NFT
          </button>
        </div> */}

        {/* Show Tokens or NFTs based on selection */}
        {/*showNFTs ? <NFTList /> : <TokenList neyxtBalance={neyxtBalance} networkBalance={networkBalance} />*/}
        {approvalStatus === UserClubStatus.APPROVED && (
          <NFTList key={`nftlist-${approvalStatus}`} />
        )}

        {/* Bottom Navigation */}
        {/* <BottomNav /> */}

      </div>


    </div>
  );
};

export default WalletScreen;