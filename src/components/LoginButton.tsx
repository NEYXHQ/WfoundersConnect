// src/components/LoginButton.tsx
import { useWeb3Auth } from "../context/Web3AuthContext";

const LoginButton = () => {
  const { loggedIn, login, logout } = useWeb3Auth();

  return (
    <button onClick={loggedIn ? logout : login} className="card">
      {loggedIn ? "Log Out" : "Login"}
    </button>
  );
};

export default LoginButton;