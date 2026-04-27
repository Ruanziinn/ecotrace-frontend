import { Wallet, AlertTriangle, Download } from "lucide-react";

export function ConnectGate({ hasMetaMask, isConnected, isWrongNetwork, onConnect, onSwitch, isLoading }: {
  hasMetaMask: boolean;
  isConnected: boolean;
  isWrongNetwork: boolean;
  onConnect: () => void;
  onSwitch: () => void;
  isLoading: boolean;
}) {
  if (!hasMetaMask) {
    return (
      <div className="container mt-10">
        <div className="eco-card mx-auto max-w-xl text-center animate-fade-in">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="mb-2 text-xl font-bold">MetaMask não encontrada</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Você precisa da MetaMask para usar o EcoTrace. Instale a extensão e atualize a página.
          </p>
          <a href="https://metamask.io" target="_blank" rel="noreferrer" className="eco-btn-primary inline-flex">
            <Download className="h-4 w-4" /> Instalar MetaMask
          </a>
        </div>
      </div>
    );
  }
  if (!isConnected) {
    return (
      <div className="container mt-10">
        <div className="eco-card mx-auto max-w-xl text-center animate-fade-in">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full gradient-primary">
            <Wallet className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Conecte sua carteira</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Conecte a MetaMask na rede Sepolia para começar a rastrear reciclagem na blockchain.
          </p>
          <button onClick={onConnect} disabled={isLoading} className="eco-btn-primary mx-auto">
            <Wallet className="h-4 w-4" />
            {isLoading ? "Conectando..." : "Conectar MetaMask"}
          </button>
        </div>
      </div>
    );
  }
  if (isWrongNetwork) {
    return (
      <div className="container mt-10">
        <div className="eco-card mx-auto max-w-xl border-destructive/40 text-center animate-fade-in">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Rede incorreta</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            O EcoTrace funciona apenas na rede de teste <strong className="text-foreground">Sepolia</strong>.
          </p>
          <button onClick={onSwitch} className="eco-btn-primary mx-auto">
            Trocar para Sepolia
          </button>
        </div>
      </div>
    );
  }
  return null;
}
