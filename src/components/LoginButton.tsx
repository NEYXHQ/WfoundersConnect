import { useWeb3Auth } from "../context/Web3AuthContext";
import { IoPowerOutline } from "react-icons/io5";

const LoginButton = () => {
  const { login } = useWeb3Auth();

  return (
    <div className="w-full h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center">
        {/* Portal Image */}
        <img
          src="/WF_portail.jpg"
          alt="WFounders Portal"
          className="w-full max-w-md object-contain mb-8"
        />

        {/* Fingerprint Button */}
        <button
          onClick={login}
          className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-orange-200 backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-300"
        >
          <IoPowerOutline className="text-orange-400 text-2xl" />
          <span className="sr-only">Login</span>
        </button>
      </div>
    </div>
  );
};

export default LoginButton;