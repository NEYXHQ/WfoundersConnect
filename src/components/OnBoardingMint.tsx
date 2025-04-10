import { useEffect, useState } from "react";
import { useWeb3Auth } from "../context/Web3AuthContext"; // To access the provider
import { FiUnlock } from "react-icons/fi";
import { FaRegCheckCircle } from "react-icons/fa";

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
  isOnBoarding: boolean;
  onIsOnBoardingChange: (isOnBoarding: boolean) => void;
}

const OnBoardingMint: React.FC<OnBoardingMintProps> = ({
  address,
  approvalStatus,
  onApprovalStatusChange,
  isOnBoarding,
  onIsOnBoardingChange
}) => {

  const [users, setUsers] = useState<{ name: string; email: string; address: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [inputValue, setInputValue] = useState(""); // ✅ Input field value
  const [selectedUser, setSelectedUser] = useState<{ name: string; email: string; address: string } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [displayQR, setDisplayQR]  = useState<boolean | null>(null);

  useEffect(() => {
    console.log("OnBoardMint is rendering...");

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}new-users`);

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
    const socket = new WebSocket(import.meta.env.VITE_WEBSOCKET_LINK);

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

        
        setApprovalMessage(" Minting successful!");
        setTxHash(data.txHash); // new state

        setTimeout(() => {
          onApprovalStatusChange(UserClubStatus.APPROVED);
          onIsOnBoardingChange(false);
        }, 5000); // Hide after 5 seconds
        console.log("🔹 Updating approval status to APPROVED");


      } else if (data.event === "minting in progress") {
        setDisplayQR(false);
        setApprovalMessage("Minting in progress");
      }
    };

    setWs(socket);

    return () => {
      console.log("🚪 Closing WebSocket due to unmounting in 5 sec");
      setTimeout(() => {
        socket.close();
      }, 5000); 
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

    setDisplayQR(true);
    onApprovalStatusChange(UserClubStatus.WAITING);
  };

  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    setInputValue(rawInput);
  
    const normalizedInput = normalize(rawInput);
  
    const matches = users.filter(user =>
      normalize(user.name).includes(normalizedInput)
    );
  
    if (matches.length === 1) {
      setSelectedUser(matches[0]);
    } else {
      setSelectedUser(null);
    }
  };

  return (
    <div className="flex flex-col items-center rounded-lg justify-center bg-gray-900 text-white p-4">

      {approvalMessage && (
        <div className="relative bg-[#1a1f1c] border border-orange-400/40 p-6 rounded-2xl shadow-inner max-w-md text-center mt-4">
          <button
            onClick={() => {
              setApprovalMessage(null);
              onIsOnBoardingChange(false);
            }}
            className="absolute top-4 right-4 text-orange-100 hover:text-orange-100"
          >
            ✖
          </button>
        
          <div className="flex justify-center items-center gap-2 text-orange-300 text-lg font-semibold mb-2">
            {txHash && <FaRegCheckCircle className="text-orange-400 text-xl" />}
            {approvalMessage}
          </div>
        
          {txHash && (
            <a
              href={`https://polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline text-blue-300 mt-2 inline-block"
            >
              View on Polygonscan ↗
            </a>
          )}
        </div>
      )}

      {/* Show Welcome Message */}
      {/* {approvalStatus === UserClubStatus.APPROVED && (
        <div className="relative bg-green-700 text-white p-4 rounded-lg shadow-lg max-w-md text-center">
          <button onClick={() => setApprovalMessage(null)} className="absolute top-2 right-2 text-white hover:text-gray-300">
            ✖
          </button>
          <p className="text-lg font-semibold">🎉 Welcome to WFounders Club Ecosystem</p>
        </div>
      )} */}

      {/* Show QR Code when Waiting */}
      {displayQR && (
        <div className="flex flex-col items-center gap-4 p-4 rounded-lg bg-gray-800 shadow-md animate-fade-in w-full max-w-md">

          {/* Status Message */}
          <div className="w-full max-w-md bg-[#1a1f1c] border border-orange-400/40 rounded-2xl p-4 shadow-inner text-center">
            <div className="flex items-center justify-center gap-2 text-orange-300 text-base font-semibold">
              <FiUnlock className="text-orange-400 text-xl" />
              Almost there!
            </div>
            <p className="text-sm text-orange-200 mt-2">
              Please show your screen to an Oracle to complete your onboarding.
            </p>
          </div>

          {/* QR Code */}
          <div className="relative">
            <div className="absolute inset-0 w-full h-full bg-blue-500 blur-xl opacity-50 rounded-md animate-pulse" />
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`}
              alt="Wallet QR Code"
              className="relative w-40 h-40 rounded-md shadow-lg border-2 border-blue-400"
            />
          </div>
        </div>
      )}

      {/* Show Input Field When User Needs to Select Name */}
      {(approvalStatus === UserClubStatus.UNREGISTERED || approvalStatus === UserClubStatus.UNAPPROVED) && (
        <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-md mt-4">


          {/* Input Field */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Start typing your name..."
            className="text-base w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
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