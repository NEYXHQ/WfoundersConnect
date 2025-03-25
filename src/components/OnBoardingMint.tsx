import { useEffect, useState } from "react";
import RPC from "../hooks/ethersRPC";
import { useWeb3Auth } from "../context/Web3AuthContext"; // To access the provider

enum UserClubStatus {
  UNAPPROVED = 0,
  WAITING = 1,
  APPROVED = 2,
  UNREGISTERED = 3,
}

interface OnBoardingMintProps {
  address: string;
  approvalStatus: UserClubStatus;
  onApprovalStatusChange: (status: UserClubStatus) => void;
  isMintingNFT: boolean;
  onMintChange: (minting: boolean) => void;
}

const OnBoardingMint: React.FC<OnBoardingMintProps> = ({ 
  address, 
  approvalStatus, 
  onApprovalStatusChange, 
  isMintingNFT,
  onMintChange
}) => {

  const [users, setUsers] = useState<{ name: string; email: string; address: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [inputValue, setInputValue] = useState(""); // ✅ Input field value
  const [selectedUser, setSelectedUser] = useState<{ name: string; email: string; address: string } | null>(null);

  const { provider } = useWeb3Auth(); // 👈 Get provider from context

  useEffect(() => {
    console.log("OnBoardMint is rendering...");

    const fetchUsers = async () => {
      try {
        const response = await fetch("https://wfounders.club/api/new-users");

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users.");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    console.log("🔵 Initializing WebSocket...");
    const socket = new WebSocket("wss://wfounders.club/ws/");

    socket.onopen = () => {
      console.log("✅ WebSocket connected successfully!");
      socket.send(JSON.stringify({
        event: "register_session",
        address: address, // user's current address
      }));
    };

    socket.onclose = (event) => {
      console.log(`⚠️ WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log(`📩 Data Event received: ${data.event}`, data);

      if (data.event === "approval_success") {
        setApprovalMessage("✅ Welcome to WFounders Web3 Ecosystem");
        onApprovalStatusChange(UserClubStatus.APPROVED);
        onMintChange(true);

        // try {
        //   await RPC.mintMemberNFT(provider, address, data.tokenID); // 🚀 MINT!
        //   console.log("🎉 NFT minted successfully!");
        // } catch (error) {
        //   console.error("❌ NFT minting failed:", error);
        // }
    
        setTimeout(() => {
          onMintChange(false);
        }, 5000); // Hide after 5 seconds
        console.log("🔹 Updating approval status to APPROVED");
      }
    };

    setWs(socket);

    return () => {
      console.log("🚪 Closing WebSocket due to unmounting");
      socket.close();
    };
  }, []);

  const handleUserApprovalRequest = () => {
    if (!selectedUser || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        event: "waiting_for_approval",
        new_address: address,
        name: selectedUser.name,
        email: selectedUser.email,
        address: selectedUser.address,
      })
    );

    setApprovalMessage(`⏳ Waiting for approval for ${selectedUser.name}`);
    onApprovalStatusChange(UserClubStatus.WAITING);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // **Filter users by input value**
    const matches = users.filter(user =>
      user.name.toLowerCase().includes(e.target.value.toLowerCase())
    );

    // **If only one name remains, auto-select it**
    if (matches.length === 1) {
      setSelectedUser(matches[0]);
    } else {
      setSelectedUser(null);
    }
  };

  return (
    <div className="flex flex-col items-center rounded-lg justify-center bg-gray-900 text-white p-4">

      {/* Display Approval Status */}
      <div className="relative bg-green-700 text-white p-4 rounded-lg shadow-lg max-w-md text-center">
        <p className="text-lg font-semibold">Status: {UserClubStatus[approvalStatus]}</p>
      </div>

      {/* Show Welcome Message */}
      {approvalStatus === UserClubStatus.APPROVED && (
        <div className="relative bg-green-700 text-white p-4 rounded-lg shadow-lg max-w-md text-center">
          <button onClick={() => setApprovalMessage(null)} className="absolute top-2 right-2 text-white hover:text-gray-300">
            ✖
          </button>
          <p className="text-lg font-semibold">🎉 Welcome to WFounders Club Ecosystem</p>
        </div>
      )}

      {/* Show QR Code when Waiting */}
      {approvalStatus === UserClubStatus.WAITING && (
        <div className="flex justify-center p-3 rounded-lg animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 w-full h-full bg-blue-500 blur-xl opacity-50 rounded-md animate-pulse" />
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`} alt="Wallet QR Code"
              className="relative w-40 h-40 rounded-md shadow-lg border-2 border-blue-400" />
          </div>
        </div>
      )}

      {/* Show Input Field When User Needs to Select Name */}
      {(approvalStatus === UserClubStatus.UNREGISTERED || approvalStatus === UserClubStatus.UNAPPROVED) && (
        <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-md mt-4">
          <h1 className="text-xl font-bold mb-4">Pick Your Name</h1>

          {/* Input Field */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Start typing your name..."
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          />

          {/* Display Selected Name If Available */}
          {selectedUser && (
            <div className="mt-4 p-3 bg-gray-900 text-white rounded-lg">
              <p className="text-lg font-bold">{selectedUser.name}</p>
              <button 
                onClick={handleUserApprovalRequest} 
                className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              >
                Confirm Selection
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default OnBoardingMint;