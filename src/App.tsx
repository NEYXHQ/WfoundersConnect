// src/App.tsx
import "./App.css";
import LoginButton from "./components/LoginButton";
import Dashboard from "./components/Dashboard";
import { Web3AuthProvider,useWeb3Auth } from "./context/Web3AuthContext";
import WalletScreen from "./components/WalletScreen";
import { useEffect, useState } from "react";

function App() {
  return (
    <Web3AuthProvider>
      <MainContent />
    </Web3AuthProvider>
  );
}

function MainContent() {
  const { loggedIn } = useWeb3Auth(); // Get login state from context

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen bg-[#141414] text-white">
      {loggedIn ? <WalletScreen /> : <LoginButton />}
    </div>
  );
}

export default App;