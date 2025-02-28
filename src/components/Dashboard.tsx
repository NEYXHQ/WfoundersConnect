// src/components/Dashboard.tsx
import { useWeb3Auth } from "../context/Web3AuthContext";
import { useBlockchain } from "../hooks/useBlockchain";

const Dashboard = () => {
  const { provider, getUserInfo, loggedIn } = useWeb3Auth();
  const { getAccounts, getBalance, signMessage, sendTransaction } = useBlockchain(provider);

  if (!loggedIn) return null;

  return (
    <div className="flex-container">
      <button onClick={getUserInfo} className="card">Get User Info</button>
      <button onClick={getAccounts} className="card">Get Accounts</button>
      <button onClick={getBalance} className="card">Get Balance</button>
      <button onClick={signMessage} className="card">Sign Message</button>
      <button onClick={sendTransaction} className="card">Send Transaction</button>
    </div>
  );
};

export default Dashboard;