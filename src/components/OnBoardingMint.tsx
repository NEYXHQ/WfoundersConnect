import { useEffect, useState } from "react";

const OnBoardingMint = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
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
    const socket = new WebSocket("wss://wfounders.club/ws/");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "approval_success" && selectedUser) {
        setApprovalMessage(
          `${selectedUser.name} approved. JWT Token: ${selectedUser.jwt_token}, Email: ${selectedUser.email}, Address: ${selectedUser.address}`
        );
        setSelectedUser(null);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const handleUserApprovalRequest = (user: any) => {
    const temp_jwt = "new_jwt_0133"
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "waiting_for_approval",
          new_jwt_token: temp_jwt,
          name: user.name,
          email: user.email,
          address: user.address,
          jwt_token: user.jwt_token
        })
      );
      setSelectedUser(user);
      setUsers([]); // Remove list of new users
      setApprovalMessage(`Waiting for approval for ${user.name} and ${user.jwt_token}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-xl font-bold mb-4">User Onboarding</h1>

      {loading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : selectedUser ? (
        <p className="text-yellow-400">{approvalMessage}</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No new users found.</p>
      ) : (
        <ul className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-md">
          {users.map((user, index) => (
            <li
              key={index}
              className="border-b border-gray-700 p-2 cursor-pointer hover:bg-gray-700 transition"
              onClick={() => handleUserApprovalRequest(user)}
            >
              <p className="text-white font-medium">{user.name}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OnBoardingMint;