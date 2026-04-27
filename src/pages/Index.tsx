import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Tabs, TabKey } from "@/components/Tabs";
import { ConnectGate } from "@/components/ConnectGate";
import { useWallet } from "@/hooks/useWallet";
import { useContracts } from "@/hooks/useContracts";
import { DashboardPage } from "./DashboardPage";
import { CooperativaPage } from "./CooperativaPage";
import { StakingPage } from "./StakingPage";
import { GovernancaPage } from "./GovernancaPage";

const Index = () => {
  const wallet = useWallet();
  const contracts = useContracts({
    address: wallet.address,
    chainId: wallet.chainId,
    isConnected: wallet.isConnected,
  });

  const [tab, setTab] = useState<TabKey>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  const [recBalance, setRecBalance] = useState<bigint | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!contracts.recToken || !wallet.address) {
        setRecBalance(null);
        return;
      }
      try {
        const b = await contracts.recToken.balanceOf(wallet.address);
        if (!cancelled) setRecBalance(b);
      } catch {
        if (!cancelled) setRecBalance(0n);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [contracts.recToken, wallet.address, refreshKey]);

  const ready = wallet.isConnected && !wallet.isWrongNetwork && wallet.hasMetaMask;

  return (
    <div className="min-h-screen">
      <Header
        address={wallet.address}
        recBalance={recBalance}
        isConnected={wallet.isConnected}
        isLoading={wallet.isLoading}
        isWrongNetwork={wallet.isWrongNetwork}
        hasMetaMask={wallet.hasMetaMask}
        onConnect={wallet.connectWallet}
        onDisconnect={wallet.disconnect}
        onSwitchNetwork={wallet.switchToSepolia}
      />

      {!ready ? (
        <ConnectGate
          hasMetaMask={wallet.hasMetaMask}
          isConnected={wallet.isConnected}
          isWrongNetwork={wallet.isWrongNetwork}
          isLoading={wallet.isLoading}
          onConnect={wallet.connectWallet}
          onSwitch={wallet.switchToSepolia}
        />
      ) : (
        <>
          <Tabs active={tab} onChange={setTab} />
      {tab === "dashboard" && (
        <DashboardPage
        recToken={contracts.recToken}
        plasticNFT={contracts.plasticNFT}
        ecoStaking={contracts.ecoStaking}
        ecoSale={contracts.ecoSale}
        address={wallet.address}
        recBalance={recBalance}
        refreshKey={refreshKey}
        bumpRefresh={bumpRefresh}
        />
        )}
          {tab === "cooperativa" && (
            <CooperativaPage
              plasticNFT={contracts.plasticNFT}
              address={wallet.address}
              refreshKey={refreshKey}
              bumpRefresh={bumpRefresh}
            />
          )}
          {tab === "staking" && (
            <StakingPage
              recToken={contracts.recToken}
              ecoStaking={contracts.ecoStaking}
              address={wallet.address}
              recBalance={recBalance}
              refreshKey={refreshKey}
              bumpRefresh={bumpRefresh}
            />
          )}
          {tab === "governanca" && (
            <GovernancaPage
              ecoGovernance={contracts.ecoGovernance}
              address={wallet.address}
              refreshKey={refreshKey}
              bumpRefresh={bumpRefresh}
            />
          )}
          <footer className="container mt-12 mb-8 text-center text-xs text-muted-foreground">
            EcoTrace ♻️ — Rastreabilidade de reciclagem de plástico na Ethereum Sepolia
          </footer>
        </>
      )}
    </div>
  );
};

export default Index;
