import { useEffect, useState } from "react";

enum UserClubStatus {
  UNAPPROVED = 0,
  WAITING = 1,
  APPROVED = 2,
  UNREGISTERED = 3,
}

interface OnBoardingMintProps {
  address: string;
  approvalStatus: UserClubStatus; // ✅ Ensure it's an enum
  onApprovalStatusChange: (status: UserClubStatus) => void; // ✅ Use correct type
}


const OnBoardingMint: React.FC<OnBoardingMintProps> = ({ 
  address, 
  approvalStatus, 
  onApprovalStatusChange 
}) => {
  
  const [localApprovalStatus, setLocalApprovalStatus] = useState<UserClubStatus>(approvalStatus);

  // Sync with parent when prop changes
  useEffect(() => {
    setLocalApprovalStatus(approvalStatus);
  }, [approvalStatus]);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const updateApprovalStatus = (status: UserClubStatus) => {
    setLocalApprovalStatus(status);
    onApprovalStatusChange(status); // 🔹 Notify WalletScreen
  };

  const generateRandomString = (length: number) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

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

    // Setup WebSocket connection
    console.log("🔵 Initializing WebSocket...");

    const socket = new WebSocket("wss://wfounders.club/ws/");

    socket.onopen = () => {
      console.log("✅ WebSocket connected successfully!");
    };

    socket.onclose = (event) => {
      console.log(`⚠️ WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(`📩 Data Event received: ${data.event}`);

      if (data.event === "approval_success") {
        setApprovalMessage("✅ Welcome to WFounders Web3 Ecosystem");
        updateApprovalStatus(UserClubStatus.APPROVED);
        console.log("🔹 Updating approval status to APPROVED");
      }
    };

    setWs(socket);

    return () => {
      console.log("🚪 Closing WebSocket due to unmounting");
      socket.close();
    };
  }, []);

  const handleUserApprovalRequest = (user: any) => {

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "waiting_for_approval",
          new_address: address,
          name: user.name,
          email: user.email,
          address: user.address,
        })
      );
      setUsers([]); // Remove list of new users
      setApprovalMessage(`⏳ Waiting for approval for ${user.name}`);
      updateApprovalStatus(UserClubStatus.WAITING);
      console.log("setApprovalStatus in OnBoardingMint (waiting for approval)");
    }
  };

  return (

    <div className="flex flex-col items-center rounded-lg justify-center bg-gray-900 text-white">
      <div className="relative bg-green-700 text-white p-4 rounded-lg shadow-lg max-w-md text-center">
          <p className="text-lg font-semibold">Status : {approvalStatus}</p>
        </div>

      {approvalStatus === UserClubStatus.APPROVED ? (
        <div className="relative bg-green-700 text-white p-4 rounded-lg shadow-lg max-w-md text-center">
          <button onClick={() => setApprovalMessage(null)} className="absolute top-2 right-2 text-white hover:text-gray-300">✖</button>
          <p className="text-lg font-semibold">🎉 Welcome to WFounders Club Ecosystem</p>
        </div>
      ) : approvalStatus === UserClubStatus.WAITING ? (
        <div className="flex justify-center p-3 rounded-lg animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 w-full h-full bg-blue-500 blur-xl opacity-50 rounded-md animate-pulse" />
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`} alt="Wallet QR Code"
              className="relative w-40 h-40 rounded-md shadow-lg border-2 border-blue-400" />
          </div>
        </div>
      ) : loading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No new users found.</p>
      ) : (
        <ul className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-md">
          <h1 className="text-xl font-bold mb-4">Pick your Name</h1>
          {users.map((user, index) => (
            <li key={index} className="border-b border-gray-700 p-2 cursor-pointer hover:bg-gray-700 transition"
              onClick={() => handleUserApprovalRequest(user)}>
              <p className="text-white font-medium">{user.name}</p>
              <p className="text-gray-400 text-sm">{user.email} - Address - {user.address}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OnBoardingMint;