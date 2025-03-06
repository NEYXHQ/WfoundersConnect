import RPC from "./ethersRPC";
import { IProvider } from "@web3auth/base";

export const useBlockchain = (provider: IProvider | null) => {

  const getAccounts = async () => {
    if (!provider) return "Provider not initialized";
    const accounts = await RPC.getAccounts(provider);
    console.log(JSON.stringify(accounts || {}, null, 2))
    return accounts;
  };

  const getBalance = async () => {
    if (!provider) return "Provider not initialized";
    return await RPC.getBalance(provider);
  };

  const signMessage = async () => {
    if (!provider) return "Provider not initialized";
    return await RPC.signMessage(provider);
  };

  const sendTransaction = async () => {
    if (!provider) return "Provider not initialized";
    // return await RPC.sendTransaction(provider);
  };

  return { getAccounts, getBalance, signMessage, sendTransaction };
};