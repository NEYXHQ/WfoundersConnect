import { useWeb3Auth } from "../context/Web3AuthContext";

const LoginButton = () => {
  const { login } = useWeb3Auth();

  return (
    <button 
      onClick={login} 
      className="w-full h-screen flex items-center justify-center bg-no-repeat bg-center bg-contain "
      style={{ backgroundImage: `url('/WF_portail.jpg')` }}
    >
      <span className="sr-only">Login</span>
    </button>
  );
};

export default LoginButton;