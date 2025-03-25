// src/App.tsx
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3AuthProvider, useWeb3Auth } from "./context/Web3AuthContext";
import LoginButton from "./components/LoginButton";
import WalletScreen from "./components/WalletScreen";
import QRScanner from "./components/OracleApproveScreen";

function App() {
  return (
    <Web3AuthProvider>
      <Router>
        <MainContent />
      </Router>
    </Web3AuthProvider>
  );
}

function MainContent() {
  const { loggedIn } = useWeb3Auth(); // Get login state from context

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen bg-[#141414] text-white">
      <Routes>
        <Route path="/" element={loggedIn ? <WalletScreen /> : <LoginButton />} />
        <Route path="/qr" element={<QRScanner />} /> 
      </Routes>
    </div>
  );
}

export default App;