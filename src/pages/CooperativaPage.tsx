import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { Package, AlertTriangle, ExternalLink, Recycle } from "lucide-react";
import { useTx } from "@/hooks/useTx";
import { formatDate, formatKg } from "@/utils/format";
import { Spinner } from "@/components/Spinner";

interface Props {
  plasticNFT: Contract | null;
  address: string | null;
  refreshKey: number;
  bumpRefresh: () => void;
}

interface Bale {
  tokenId: bigint;
  weightKg: bigint;
  mintedAt: bigint;
  retired: boolean;
}

export function CooperativaPage({ plasticNFT, address, refreshKey, bumpRefresh }: Props) {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [weight, setWeight] = useState("");
  const [uri, setUri] = useState("");
  const [bales, setBales] = useState<Bale[]>([]);
  const [loadingBales, setLoadingBales] = useState(false);
  const { pending, send } = useTx();
  const [retiringId, setRetiringId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!plasticNFT || !address) return;
      setLoadingBales(true);
      try {
        const approved = await plasticNFT.approvedCooperatives(address).catch(() => false);
        if (!cancelled) setIsApproved(approved);

        const filter = plasticNFT.filters.BaleMinted(null, address);
        const events = await plasticNFT.queryFilter(filter, -50000).catch(() => []);
        const list: Bale[] = [];
        for (const ev of events) {
          const tokenId = (ev as any).args?.[0] as bigint;
          try {
            const b = await plasticNFT.getBale(tokenId);
            list.push({
              tokenId,
              weightKg: b[1] as bigint,
              mintedAt: b[2] as bigint,
              retired: b[3] as boolean,
            });
          } catch { /* skip */ }
        }
        list.sort((a, b) => Number(b.mintedAt - a.mintedAt));
        if (!cancelled) setBales(list);
      } finally {
        if (!cancelled) setLoadingBales(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [plasticNFT, address, refreshKey]);

  async function handleMint() {
    if (!plasticNFT) return;
    const w = Number(weight);
    if (!w || w <= 0) return;
    if (!uri.trim()) return;
    const ok = await send(
      () => plasticNFT.mintBale(BigInt(Math.floor(w)), uri.trim()),
      { successMsg: "Fardo mintado com sucesso! ♻️", onSuccess: async () => { setWeight(""); setUri(""); bumpRefresh(); } }
    );
    if (!ok) return;
  }

  async function handleRetire(tokenId: bigint) {
    if (!plasticNFT) return;
    setRetiringId(tokenId.toString());
    await send(
      () => plasticNFT.retireBale(tokenId),
      { successMsg: "Fardo aposentado ✓", onSuccess: async () => bumpRefresh() }
    );
    setRetiringId(null);
  }

  return (
    <div className="container mt-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Cooperativa</h2>
        <p className="text-sm text-muted-foreground">Registre novos fardos de plástico reciclado como NFTs.</p>
      </div>

      {isApproved === false && (
        <div className="eco-card border-destructive/40 bg-destructive/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Carteira não aprovada</p>
              <p className="text-sm text-foreground/80 mt-1">
                Sua carteira não é uma cooperativa aprovada. Peça à DAO para aprovar seu endereço através de uma proposta de governança.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="eco-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Registrar novo fardo
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Peso do fardo (kg)</label>
            <input type="number" min="1" placeholder="1000" value={weight}
              onChange={(e) => setWeight(e.target.value)} className="eco-input mt-1.5" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">URI de metadados</label>
            <input type="text" placeholder="ipfs://Qm..." value={uri}
              onChange={(e) => setUri(e.target.value)} className="eco-input mt-1.5" />
          </div>
        </div>
        <button
          onClick={handleMint}
          disabled={pending || !plasticNFT || !weight || !uri || isApproved === false}
          className="eco-btn-primary mt-4"
        >
          {pending ? <Spinner /> : <Recycle className="h-4 w-4" />}
          Mintar NFT do Fardo
        </button>
      </div>

      <div className="eco-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Meus Fardos</h3>
          <span className="text-xs text-muted-foreground">{bales.length} fardo(s)</span>
        </div>

        {loadingBales ? (
          <div className="py-10 grid place-items-center text-muted-foreground"><Spinner className="h-6 w-6" /></div>
        ) : bales.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhum fardo registrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 pr-4">Token ID</th>
                  <th className="py-3 pr-4">Peso</th>
                  <th className="py-3 pr-4">Mintado em</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {bales.map((b) => (
                  <tr key={b.tokenId.toString()} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-mono">#{b.tokenId.toString()}</td>
                    <td className="py-3 pr-4">{formatKg(b.weightKg)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(b.mintedAt)}</td>
                    <td className="py-3 pr-4">
                      {b.retired ? (
                        <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">Consumido ✓</span>
                      ) : (
                        <span className="rounded-full bg-info/15 px-2.5 py-1 text-xs font-semibold text-info">Ativo</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {!b.retired && (
                        <button
                          onClick={() => handleRetire(b.tokenId)}
                          disabled={pending && retiringId === b.tokenId.toString()}
                          className="eco-btn-outline px-3 py-1.5 text-xs"
                        >
                          {pending && retiringId === b.tokenId.toString() ? <Spinner /> : <ExternalLink className="h-3.5 w-3.5" />}
                          Aposentar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
