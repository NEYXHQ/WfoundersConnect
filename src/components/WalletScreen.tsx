import { useState, useEffect, useRef } from "react";
import OnBoardingMint from "./OnBoardingMint";
import BalanceCard from "./BalanceCard";
import TokenList from "./TokenList";
import NFTList from "./NFTList";
import BottomNav from "./BottomNav";
import { useWeb3Auth, chainConfig } from "../context/Web3AuthContext";
import { LuUserRoundCheck } from "react-icons/lu";
import { FaSpinner, FaRegCheckCircle } from "react-icons/fa"; // ✅ Loading icon
import ClaimNFT from "./ClaimNFT";

import RPC from "../hooks/ethersRPC";


const WalletScreen = () => {
  const { loggedIn, logout, userInfo, provider } = useWeb3Auth(); // ✅ Use logout from context
  const { profileImage, verifierId } = userInfo;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null); // 🔹 Reference for the menu

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [neyxtBalance, setNeyxtBalance] = useState<number>(0);
  const [networkBalance, setNetworkBalance] = useState<number>(0);
  const [prices, setPrices] = useState<{ [key: string]: string }>({});

  const [nfts, setNFTs] = useState<any[]>([]);

  const [statusLoading, setStatusLoading] = useState(true);
  const [nftsLoading, setNftsLoading] = useState(true);

  const ALLOWED_ADDRESSES_CLAIM = [
    // "0xe6005AF5C11d13e6c8DA19672AEBB7f043f63F3B", // Steph Phone #10
    "0xffdd175FF06b54D0C845059C63f7124BD603755f",
    "0x637246DBFc706caD0E8A59838Dc1dc3A39f618Ef",
    "0x7338B7Ecf49514270f4A3f05D4696947Ee4F730A",
    "0x518Ed219200d04d6a715805864Dab5614baC7732",
    "0x85D582f33e303747CCbC0B362C7E90A0cC9a3887",
    "0x4Ca4808767497f24D88C6EF5B0f835a3BB2CdFDE",
    "0x1D7De1a2a02B55D0B179Bdae9365c801b6b7ca4C",
    "0x372554f4C89D095a0F5E630e40FA22F3F4cE1Bd9",
    "0x7d25D0565fCef91F156D840D5879fB47f53732C2"
  ].map(addr => addr.toLowerCase());

  // console.log(`Allowed addresses to claim : ${ALLOWED_ADDRESSES_CLAIM}`);

  enum UserClubStatus {
    UNAPPROVED = 0, // No wallet
    WAITING = 1, // Connected wallet and approval process started and waiting to be approved
    APPROVED = 2, // Approved
    UNREGISTERED = 3, // No wallet and no name 
  }

  const ONBOARDING_OPEN = import.meta.env.VITE_ONBOARDING_OPEN === "true" ? true : false;

  const [approvalStatus, setApprovalStatus] = useState(UserClubStatus.APPROVED);
  const [isOnboarding, setIsOnBoarding] = useState(false); 


  useEffect(() => {
    console.log("Onboarding open ? ",ONBOARDING_OPEN);
    const fetchBalancesAndPrices = async () => {
      if (!provider) return;

      try {
        // Fetch Address
        const address = await RPC.getAccounts(provider);
        setWalletAddress(address);

        // Fetch balances
        const neyxtBalance = await RPC.getNEYXTBalance(provider);
        const network = await RPC.getNetworkBalance(provider);
        setNeyxtBalance(parseFloat(neyxtBalance));
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
        setStatusLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}is-approved?address=${walletAddress}`);
        const data = await response.json();

        setApprovalStatus(data.status);
        console.log(`Approval Status (in walletScreen)= ${data.status}`);

      } catch (error) {
        console.error("Error checking user approval:", error);
      } finally {
        setStatusLoading(false);
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
              <span className="text-xs text-gray-400">
                {verifierId.length > 23
                  ? `${verifierId.slice(0, 10)}...${verifierId.slice(-10)}`
                  : verifierId}
              </span>
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
          {!statusLoading && isOnboarding ? (
            <div className="bg-green-700 p-4 rounded-lg shadow-lg text-white flex items-center justify-center space-x-2">
              <FaSpinner className="animate-spin text-white text-lg" />
              <p>Welcome to WFounders Club, minting your membership NFT...</p>
            </div>
          ) : approvalStatus === UserClubStatus.APPROVED ? (
            <span className="text-orange-300 flex items-center justify-end gap-1">
              <FaRegCheckCircle className="text-lg" />
              Approved
            </span>
          ) : ONBOARDING_OPEN || walletAddress === import.meta.env.VITE_ONBOARDING_TEST_ADDRESS ? (
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg mt-4">
              <h2 className="text-white text-sm font-semibold mb-2">Onboarding Required</h2>
              <OnBoardingMint
                address={walletAddress ?? ""}
                verifierId={verifierId}
                approvalStatus={approvalStatus} // ✅ Pass initial status
                onApprovalStatusChange={(newStatus: UserClubStatus) => setApprovalStatus(newStatus)}
                isOnBoarding={isOnboarding}
                onIsOnBoardingChange={(isOnBoardingChange: boolean) => setIsOnBoarding(isOnboarding)}
              />
            </div>
          ) : (
            <p className="text-center text-lg text-orange-200 font-medium mt-6">
              You are not onboarded yet <br/>
              😔<br />
              We only onboard during our live events<br />
              See you then ({import.meta.env.VITE_NEXT_EVENT})! 
            </p>
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

        {/* NFTList and clainNFT button */}
        {approvalStatus === UserClubStatus.APPROVED && (
        <>
          <NFTList nfts={nfts} setNFTs={setNFTs} setNftsLoading={setNftsLoading} />

          {!nftsLoading && ALLOWED_ADDRESSES_CLAIM.includes(walletAddress?.toLowerCase() ?? "") && (
            <div className="mt-6">
              <ClaimNFT address={walletAddress ?? ""} onClaimSuccess={() => {
                RPC.getNFTs(provider!).then(setNFTs);
              }} />
            </div>
          )}
        </>
      )}

        {/* Bottom Navigation */}
        {/* <BottomNav /> */}

      </div>


    </div>
  );
};

export default WalletScreen;