import { formatEther, parseEther } from "ethers";

export function formatAddress(addr?: string | null): string {
  if (!addr) return "—";
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatREC(wei: bigint | string | number | undefined | null): string {
  if (wei === undefined || wei === null) return "0.0000";
  try {
    const value = typeof wei === "bigint" ? wei : BigInt(wei.toString());
    const str = formatEther(value);
    const num = Number(str);
    return num.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  } catch {
    return "0.0000";
  }
}

export function parseREC(value: string): bigint {
  if (!value || value.trim() === "") return 0n;
  const sanitized = value.replace(",", ".").trim();
  return parseEther(sanitized);
}

export function formatDate(timestamp: bigint | number | string): string {
  if (!timestamp) return "—";
  const ts = Number(typeof timestamp === "bigint" ? timestamp : BigInt(timestamp.toString()));
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatKg(n: bigint | number | string): string {
  if (n === undefined || n === null) return "0 kg";
  const num = Number(typeof n === "bigint" ? n : BigInt(n.toString()));
  return `${num.toLocaleString("pt-BR")} kg`;
}

export function txExplorerUrl(hash: string): string {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}

export function addressExplorerUrl(addr: string): string {
  return `https://sepolia.etherscan.io/address/${addr}`;
}

export function parseTxError(err: unknown): string {
  const msg = (err as { message?: string; shortMessage?: string })?.shortMessage
    || (err as { message?: string })?.message
    || String(err);
  const lower = msg.toLowerCase();
  if (lower.includes("user rejected") || lower.includes("user denied")) return "Transação cancelada.";
  if (lower.includes("insufficient funds")) return "Saldo insuficiente.";
  if (lower.includes("could not decode result data")) return "Contrato não encontrado neste endereço. Verifique config.ts.";
  return msg.length > 160 ? msg.slice(0, 160) + "..." : msg;
}
