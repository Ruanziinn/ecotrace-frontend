import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import {
  ADDRESSES,
  REC_TOKEN_ABI,
  PLASTIC_NFT_ABI,
  STAKING_ABI,
  GOVERNANCE_ABI,
  ECOSALE_ABI,
  SEPOLIA_CHAIN_ID,
} from "@/contracts/config";

interface ContractsBundle {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  recToken: Contract | null;
  plasticNFT: Contract | null;
  ecoStaking: Contract | null;
  ecoGovernance: Contract | null;
  ecoSale: Contract | null;
}

const empty: ContractsBundle = {
  provider: null,
  signer: null,
  recToken: null,
  plasticNFT: null,
  ecoStaking: null,
  ecoGovernance: null,
  ecoSale: null,
};

export function useContracts(opts: {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}) {
  const { address, chainId, isConnected } = opts;
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!isConnected || !window.ethereum || chainId !== SEPOLIA_CHAIN_ID) {
        setProvider(null);
        setSigner(null);
        return;
      }
      try {
        const p = new BrowserProvider(window.ethereum);
        const s = await p.getSigner();
        if (cancelled) return;
        setProvider(p);
        setSigner(s);
      } catch {
        if (cancelled) return;
        setProvider(null);
        setSigner(null);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [isConnected, chainId, address]);

  const bundle = useMemo<ContractsBundle>(() => {
    if (!signer || !provider) return empty;
    return {
      provider,
      signer,
      recToken: new Contract(ADDRESSES.RecToken, REC_TOKEN_ABI, signer),
      plasticNFT: new Contract(ADDRESSES.PlasticNFT, PLASTIC_NFT_ABI, signer),
      ecoStaking: new Contract(ADDRESSES.EcoStaking, STAKING_ABI, signer),
      ecoGovernance: new Contract(ADDRESSES.EcoGovernance, GOVERNANCE_ABI, signer),
      ecoSale: new Contract(ADDRESSES.EcoSale, ECOSALE_ABI, signer),
    };
  }, [signer, provider]);

  return bundle;
}
