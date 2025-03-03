// src/context/Web3AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";


const clientId = "BPYjbc75TRunCKQfGPUQ3794T-KzcR1toGj7mPxw4B4L6c4MxLZ_JMQoMOIbKlFtADx7xUl9TNR7ZMRvMqTe48M";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x89", // Polygon Mainnet
  rpcTarget: "https://rpc.ankr.com/polygon",
  displayName: "Polygon Mainnet",
  blockExplorerUrl: "https://polygonscan.com",
  ticker: "POL",
  tickerName: "Polygon Ecosystem Token",
  logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
};

const web3auth = new Web3Auth(web3AuthOptions);

// IMP START - Configuring External Wallets
const adapters = await getDefaultExternalAdapters({ options: web3AuthOptions });
adapters.forEach((adapter: IAdapter<unknown>) => {
  web3auth.configureAdapter(adapter);
});
// IMP END - Configuring External Wallets

const Web3AuthContext = createContext<any>(null);

export const Web3AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ profileImage: string | null; verifierId: string | null }>({
    profileImage: null,
    verifierId: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        console.log(`In useEffect`);
        await web3auth.initModal();
        setProvider(web3auth.provider);
        if (web3auth.connected) {
          const user = await getUserInfo(); // ✅ Fetch user info immediately after login
          
          if (user) {
            console.log(`user info : ${user.profileImage}`);
            setLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("Web3Auth Initialization Error:", error);
      }
    };
    init();
  }, []);

  const login = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      
      console.log("Login successful, fetching user info...");
      await getUserInfo(); // ✅ Fetch user info after login
      setLoggedIn(true);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo({
        profileImage: null,
        verifierId: null,
      });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const getUserInfo = async () => {
    console.log("here");
    const user = await web3auth.getUserInfo();
    if (user) {
      console.log(`setting user profile with ${user.profileImage}`);
      setUserInfo({
        profileImage: user.profileImage || null,
        verifierId: user.verifierId || null,
      });
    }
    console.log(`after set ${user.profileImage}`);
    return user;
  };

  return (
    <Web3AuthContext.Provider value={{ provider, loggedIn, login, logout, getUserInfo, userInfo }}>
      {children}
    </Web3AuthContext.Provider>
  );
};

// Custom Hook to Access Web3Auth
export const useWeb3Auth = () => useContext(Web3AuthContext);