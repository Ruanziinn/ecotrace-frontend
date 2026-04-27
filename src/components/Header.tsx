import { Recycle, Wallet, LogOut, AlertTriangle } from "lucide-react";
import { formatAddress, formatREC, addressExplorerUrl } from "@/utils/format";

interface HeaderProps {
  address: string | null;
  recBalance: bigint | null;
  isConnected: boolean;
  isLoading: boolean;
  isWrongNetwork: boolean;
  hasMetaMask: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: () => void;
}

export function Header(p: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary shadow-[var(--shadow-glow)]">
            <Recycle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-extrabold tracking-tight">
              Eco<span className="text-gradient">Trace</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Rastreabilidade ♻️ Sepolia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {p.isConnected && p.isWrongNetwork && (
            <button onClick={p.onSwitchNetwork} className="eco-btn-danger">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Trocar para Sepolia</span>
              <span className="sm:hidden">Sepolia</span>
            </button>
          )}

          {p.isConnected && !p.isWrongNetwork && (
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
              <span className="text-muted-foreground">Saldo</span>
              <span className="font-semibold text-primary">{formatREC(p.recBalance ?? 0n)} REC</span>
            </div>
          )}

          {!p.isConnected ? (
            <button
              onClick={p.onConnect}
              disabled={p.isLoading || !p.hasMetaMask}
              className="eco-btn-primary"
            >
              <Wallet className="h-4 w-4" />
              {p.isLoading ? "Conectando..." : "Conectar Carteira"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href={p.address ? addressExplorerUrl(p.address) : "#"}
                target="_blank" rel="noreferrer"
                className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono hover:border-primary transition"
              >
                {formatAddress(p.address)}
              </a>
              <button onClick={p.onDisconnect} className="eco-btn-outline px-3" title="Desconectar">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
