// src/context/Web3AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK, getEvmChainConfig } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";


export const chainConfig = getEvmChainConfig(Number(import.meta.env.VITE_CHAIN_ID), import.meta.env.VITE_WEB3AUTH_CLIENTID)!;

// {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: import.meta.env.VITE_CHAIN_ID,
//   rpcTarget: import.meta.env.VITE_RPC_TARGET,
//   displayName: import.meta.env.VITE_DISPLAY_NAME,
//   blockExplorerUrl: import.meta.env.VITE_BLOCK_EXPLORER_URL,
//   ticker: import.meta.env.VITE_TICKER,
//   tickerName: import.meta.env.VITE_TICKER_NAME,
//   logo: import.meta.env.VITE_LOGO,
// };

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENTID
const envNetwork = import.meta.env.VITE_WEB3AUTH_NETWORK?.toUpperCase(); 
const selectedNetwork = WEB3AUTH_NETWORK[envNetwork as keyof typeof WEB3AUTH_NETWORK];
const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: selectedNetwork,
  privateKeyProvider,
};

const web3auth = new Web3Auth(web3AuthOptions);

console.table({
  MODE: import.meta.env.MODE,
  CLIENT_ID: import.meta.env.VITE_WEB3AUTH_CLIENT_ID,
  NETWORK: import.meta.env.VITE_WEB3AUTH_NETWORK,
});

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
    console.log(`chain ID : ${import.meta.env.VITE_CHAIN_ID}`)
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);
        if (web3auth.connected) {
          const user = await getUserInfo(); // ✅ Fetch user info immediately after login
          
          if (user) {
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
    const user = await web3auth.getUserInfo();
    if (user) {
      // console.log(`setting user profile with ${user.profileImage}`);
      setUserInfo({
        profileImage: user.profileImage || null,
        verifierId: user.verifierId || null,
      });
    }

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