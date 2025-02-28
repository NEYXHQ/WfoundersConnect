// src/App.tsx
import "./App.css";
import LoginButton from "./components/LoginButton";
import Dashboard from "./components/Dashboard";
import { Web3AuthProvider } from "./context/Web3AuthContext";

function App() {
  return (
    <Web3AuthProvider>
      <div className="container">
        <h1 className="text-3xl font-bold text-orange-500">
          <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/modal" rel="noreferrer">
            Web3Auth
          </a>
          & Steph's React App
        </h1>

        <div className="grid">
          <LoginButton />
          <Dashboard />
        </div>

        <footer className="footer">
          Steph's Footer
        </footer>
      </div>
    </Web3AuthProvider>
  );
}

export default App;