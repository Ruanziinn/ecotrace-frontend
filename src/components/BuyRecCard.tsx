import { useEffect, useMemo, useState } from "react";
import { Contract, parseEther, formatEther } from "ethers";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTx } from "@/hooks/useTx";
import { formatREC } from "@/utils/format";

interface Props {
  ecoSale: Contract | null;
  onPurchased?: () => void;
}

const MIN_ETH = 0.001;
const MAX_ETH = 10;

export function BuyRecCard({ ecoSale, onPurchased }: Props) {
  const [ethAmount, setEthAmount] = useState("0.1");
  const [estimated, setEstimated] = useState<bigint | null>(null);
  const [rate, setRate] = useState<bigint | null>(null);
  const [saleActive, setSaleActive] = useState<boolean | null>(null);
  const [estimating, setEstimating] = useState(false);
  const { pending, send } = useTx();

  // Carrega rate e status uma vez (e quando contrato muda)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ecoSale) {
        setRate(null);
        setSaleActive(null);
        return;
      }
      try {
        const [r, active] = await Promise.all([
          ecoSale.rate().catch(() => null),
          ecoSale.saleActive().catch(() => null),
        ]);
        if (cancelled) return;
        setRate(r);
        setSaleActive(active);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [ecoSale]);

  // Cálculo dinâmico via getRECAmount com debounce
  useEffect(() => {
    if (!ecoSale) {
      setEstimated(null);
      return;
    }
    const sanitized = ethAmount.replace(",", ".").trim();
    if (!sanitized || isNaN(Number(sanitized)) || Number(sanitized) <= 0) {
      setEstimated(null);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        setEstimating(true);
        const wei = parseEther(sanitized);
        const out = await ecoSale.getRECAmount(wei);
        setEstimated(out);
      } catch {
        setEstimated(null);
      } finally {
        setEstimating(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [ethAmount, ecoSale]);

  const numericEth = useMemo(() => {
    const n = Number(ethAmount.replace(",", "."));
    return isNaN(n) ? 0 : n;
  }, [ethAmount]);

  const validation = useMemo(() => {
    if (!ethAmount.trim()) return { ok: false, msg: "Informe um valor em ETH." };
    if (isNaN(numericEth) || numericEth <= 0) return { ok: false, msg: "Valor inválido." };
    if (numericEth < MIN_ETH) return { ok: false, msg: `Mínimo: ${MIN_ETH} ETH` };
    if (numericEth > MAX_ETH) return { ok: false, msg: `Máximo: ${MAX_ETH} ETH` };
    return { ok: true, msg: "" };
  }, [ethAmount, numericEth]);

  const handleBuy = async () => {
    if (!ecoSale) return;
    if (!validation.ok) {
      toast.error(validation.msg);
      return;
    }
    if (saleActive === false) {
      toast.error("Vendas pausadas no momento.");
      return;
    }
    const sanitized = ethAmount.replace(",", ".").trim();
    await send(
      async () => {
        return await ecoSale.buyREC({ value: parseEther(sanitized) });
      },
      {
        successMsg: `Compra confirmada! Você recebeu ~${formatREC(estimated)} $REC ✓`,
        onSuccess: async () => {
          onPurchased?.();
        },
      }
    );
  };

  const rateLabel = (() => {
    if (!rate) return "1 ETH = — $REC";
    try {
      // Convenção: rate = quantidade de tokens (em wei) por 1 ETH (em wei)
      const tokensPerEth = formatEther(rate);
      const num = Number(tokensPerEth);
      return `1 ETH = ${num.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} $REC`;
    } catch {
      return `1 ETH = ${rate.toString()} $REC`;
    }
  })();

  const disabled = pending || !validation.ok || saleActive === false || !ecoSale;

  return (
    <div className="eco-card animate-fade-in relative overflow-hidden">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Comprar $REC</h3>
              <p className="text-xs text-muted-foreground">{rateLabel}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              saleActive === false
                ? "bg-destructive/15 text-destructive"
                : saleActive
                ? "bg-success/15 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {saleActive === null ? "—" : saleActive ? "Vendas ativas" : "Vendas pausadas"}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Quantidade de ETH
          </label>
          <input
            type="number"
            min={MIN_ETH}
            max={MAX_ETH}
            step="0.001"
            inputMode="decimal"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="0.1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Mín: {MIN_ETH} ETH · Máx: {MAX_ETH} ETH
            </span>
            {!validation.ok && ethAmount.trim() !== "" && (
              <span className="text-destructive">{validation.msg}</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Você receberá
          </p>
          <p className="mt-1 flex items-center gap-2 text-xl font-bold text-primary">
            {estimating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>{formatREC(estimated)} $REC</>
            )}
          </p>
        </div>

        <button
          onClick={handleBuy}
          disabled={disabled}
          className="w-full gradient-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-semibold shadow-[var(--shadow-glow)] transition disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-110"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </span>
          ) : saleActive === false ? (
            "Vendas pausadas"
          ) : (
            "Comprar $REC"
          )}
        </button>
      </div>
    </div>
  );
}
