import { useEffect, useState } from "react";
import { Coins, Layers, Package, Wallet, ShieldCheck, ShieldOff } from "lucide-react";
import { Contract } from "ethers";
import { StatCard } from "@/components/StatCard";
import { BuyRecCard } from "@/components/BuyRecCard";
import { formatREC } from "@/utils/format";

interface Props {
  recToken: Contract | null;
  plasticNFT: Contract | null;
  ecoStaking: Contract | null;
  ecoSale: Contract | null;
  address: string | null;
  recBalance: bigint | null;
  refreshKey: number;
  bumpRefresh: () => void;
}

export function DashboardPage({ recToken, plasticNFT, ecoStaking, ecoSale, address, recBalance, refreshKey, bumpRefresh }: Props) {
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [totalStaked, setTotalStaked] = useState<bigint | null>(null);
  const [baleCount, setBaleCount] = useState<number | null>(null);
  const [isCoop, setIsCoop] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!recToken || !ecoStaking || !plasticNFT || !address) return;
      try {
        const [ts, stk, coop] = await Promise.all([
          recToken.totalSupply().catch(() => 0n),
          ecoStaking.totalStaked().catch(() => 0n),
          plasticNFT.approvedCooperatives(address).catch(() => false),
        ]);
        if (cancelled) return;
        setTotalSupply(ts);
        setTotalStaked(stk);
        setIsCoop(coop);

        try {
          const filter = plasticNFT.filters.BaleMinted();
          const events = await plasticNFT.queryFilter(filter, -50000);
          if (!cancelled) setBaleCount(events.length);
        } catch {
          if (!cancelled) setBaleCount(0);
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [recToken, ecoStaking, plasticNFT, address, refreshKey]);

  return (
    <div className="container mt-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Visão geral do protocolo EcoTrace na rede Sepolia.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="REC em circulação"
          value={<span>{formatREC(totalSupply)}</span>}
          hint="Total Supply"
          icon={<Coins className="h-5 w-5" />}
          accent
        />
        <StatCard
          label="REC em stake"
          value={<span>{formatREC(totalStaked)}</span>}
          hint="Total Staked"
          icon={<Layers className="h-5 w-5" />}
        />
        <StatCard
          label="Fardos mintados"
          value={baleCount ?? "—"}
          hint="via eventos BaleMinted"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Seu saldo"
          value={<span>{formatREC(recBalance)}</span>}
          hint="$REC"
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BuyRecCard ecoSale={ecoSale} onPurchased={bumpRefresh} />

        <div className="eco-card">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${isCoop ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                {isCoop ? <ShieldCheck className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold">Status da carteira</p>
                <p className="text-xs text-muted-foreground">
                  {isCoop === null ? "Verificando..." : isCoop
                    ? "Você é uma cooperativa aprovada e pode mintar fardos."
                    : "Sua carteira não é uma cooperativa aprovada."}
                </p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCoop ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
              {isCoop ? "Aprovada ✓" : "Não aprovada"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
