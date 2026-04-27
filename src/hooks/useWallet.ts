import { useCallback, useEffect, useState } from "react";
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX } from "@/contracts/config";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasMetaMask: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isLoading: false,
    error: null,
    hasMetaMask: typeof window !== "undefined" && !!window.ethereum,
  });

  const refresh = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;
    try {
      const accounts: string[] = await window.ethereum.request({ method: "eth_accounts" });
      const chainHex: string = await window.ethereum.request({ method: "eth_chainId" });
      const chainId = parseInt(chainHex, 16);
      setState((s) => ({
        ...s,
        address: accounts[0] ?? null,
        chainId,
        isConnected: !!accounts[0],
      }));
    } catch {
      // ignore
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setState((s) => ({ ...s, error: "MetaMask não encontrada." }));
      return;
    }
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      const chainHex: string = await window.ethereum.request({ method: "eth_chainId" });
      const chainId = parseInt(chainHex, 16);
      setState((s) => ({
        ...s,
        address: accounts[0] ?? null,
        chainId,
        isConnected: !!accounts[0],
        isLoading: false,
      }));
    } catch (err: any) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err?.message ?? "Falha ao conectar carteira.",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState((s) => ({
      ...s,
      address: null,
      chainId: null,
      isConnected: false,
      error: null,
    }));
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (err: any) {
      // 4902 = chain not added
      if (err?.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: "Sepolia",
              nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            }],
          });
        } catch (e: any) {
          setState((s) => ({ ...s, error: e?.message ?? "Falha ao adicionar Sepolia." }));
        }
      } else {
        setState((s) => ({ ...s, error: err?.message ?? "Falha ao trocar de rede." }));
      }
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    refresh();

    const handleAccountsChanged = (accounts: string[]) => {
      setState((s) => ({
        ...s,
        address: accounts[0] ?? null,
        isConnected: !!accounts[0],
      }));
    };
    const handleChainChanged = (chainHex: string) => {
      setState((s) => ({ ...s, chainId: parseInt(chainHex, 16) }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [refresh]);

  const isWrongNetwork = state.isConnected && state.chainId !== null && state.chainId !== SEPOLIA_CHAIN_ID;

  return {
    ...state,
    connectWallet,
    disconnect,
    switchToSepolia,
    isWrongNetwork,
  };
}
