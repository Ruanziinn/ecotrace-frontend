import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { Coins, Gift, ArrowDownToLine, ArrowUpFromLine, CheckCircle2 } from "lucide-react";
import { useTx } from "@/hooks/useTx";
import { formatREC, parseREC } from "@/utils/format";
import { Spinner } from "@/components/Spinner";
import { ADDRESSES } from "@/contracts/config";

interface Props {
  recToken: Contract | null;
  ecoStaking: Contract | null;
  address: string | null;
  recBalance: bigint | null;
  refreshKey: number;
  bumpRefresh: () => void;
}

export function StakingPage({ recToken, ecoStaking, address, recBalance, refreshKey, bumpRefresh }: Props) {
  const [stakedAmount, setStakedAmount] = useState<bigint>(0n);
  const [pendingReward, setPendingReward] = useState<bigint>(0n);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [stakeInput, setStakeInput] = useState("");
  const [unstakeInput, setUnstakeInput] = useState("");

  const tx = useTx();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ecoStaking || !recToken || !address) return;
      try {
        const [stk, pr, allw] = await Promise.all([
          ecoStaking.stakes(address).catch(() => [0n, 0n, 0n]),
          ecoStaking.pendingReward(address).catch(() => 0n),
          recToken.allowance(address, ADDRESSES.EcoStaking).catch(() => 0n),
        ]);
        if (cancelled) return;
        setStakedAmount(stk[0] as bigint);
        setPendingReward(pr as bigint);
        setAllowance(allw as bigint);
      } catch { /* */ }
    }
    load();
    return () => { cancelled = true; };
  }, [ecoStaking, recToken, address, refreshKey]);

  // refresh pending reward every 15s
  useEffect(() => {
    if (!ecoStaking || !address) return;
    const i = setInterval(async () => {
      try {
        const pr = await ecoStaking.pendingReward(address);
        setPendingReward(pr);
      } catch { /* */ }
    }, 15000);
    return () => clearInterval(i);
  }, [ecoStaking, address]);

  let needsApproval = true;
  let parsedStake = 0n;
  try { parsedStake = stakeInput ? parseREC(stakeInput) : 0n; } catch { /* */ }
  if (parsedStake > 0n && allowance >= parsedStake) needsApproval = false;

  async function handleApprove() {
    if (!recToken || parsedStake === 0n) return;
    await tx.send(
      () => recToken.approve(ADDRESSES.EcoStaking, parsedStake),
      { successMsg: "Aprovação confirmada ✓", onSuccess: async () => bumpRefresh() }
    );
  }
  async function handleStake() {
    if (!ecoStaking || parsedStake === 0n) return;
    await tx.send(
      () => ecoStaking.stake(parsedStake),
      { successMsg: "Stake realizado ✓", onSuccess: async () => { setStakeInput(""); bumpRefresh(); } }
    );
  }
  async function handleUnstake() {
    if (!ecoStaking) return;
    let amt = 0n;
    try { amt = parseREC(unstakeInput); } catch { return; }
    if (amt === 0n) return;
    await tx.send(
      () => ecoStaking.unstake(amt),
      { successMsg: "Unstake realizado ✓", onSuccess: async () => { setUnstakeInput(""); bumpRefresh(); } }
    );
  }
  async function handleClaim() {
    if (!ecoStaking) return;
    await tx.send(
      () => ecoStaking.claimReward(),
      { successMsg: "Recompensa coletada ✓", onSuccess: async () => bumpRefresh() }
    );
  }

  return (
    <div className="container mt-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Staking</h2>
        <p className="text-sm text-muted-foreground">Faça stake de $REC e receba recompensas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="eco-card md:col-span-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Sua posição</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">REC em stake</p>
              <p className="text-2xl font-bold mt-1">{formatREC(stakedAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recompensa pendente</p>
              <p className="text-2xl font-bold mt-1 text-primary">{formatREC(pendingReward)}</p>
            </div>
          </div>
        </div>
        <div className="eco-card flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Gift className="h-4 w-4 text-primary" /> Recompensas
          </div>
          <button
            onClick={handleClaim}
            disabled={tx.pending || pendingReward === 0n}
            className="eco-btn-primary mt-3 w-full"
          >
            {tx.pending ? <Spinner /> : <Gift className="h-4 w-4" />}
            Claim Reward
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Stake */}
        <div className="eco-card">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
            <ArrowDownToLine className="h-5 w-5 text-primary" /> Fazer Stake
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Saldo disponível: {formatREC(recBalance)} REC</p>

          {/* Stepper */}
          <div className="mb-4 flex items-center gap-2 text-xs">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${needsApproval ? "bg-primary/15 text-primary" : "bg-success/15 text-success"}`}>
              {needsApproval ? <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              1. Aprovar $REC
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${!needsApproval ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              {!needsApproval && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
              2. Fazer Stake
            </div>
          </div>

          <input
            type="text" inputMode="decimal" placeholder="0.0"
            value={stakeInput}
            onChange={(e) => setStakeInput(e.target.value)}
            className="eco-input"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleApprove}
              disabled={tx.pending || parsedStake === 0n || !needsApproval}
              className="eco-btn-outline flex-1"
            >
              {tx.pending && needsApproval ? <Spinner /> : null}
              Aprovar
            </button>
            <button
              onClick={handleStake}
              disabled={tx.pending || parsedStake === 0n || needsApproval}
              className="eco-btn-primary flex-1"
            >
              {tx.pending && !needsApproval ? <Spinner /> : <Coins className="h-4 w-4" />}
              Fazer Stake
            </button>
          </div>
        </div>

        {/* Unstake */}
        <div className="eco-card">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
            <ArrowUpFromLine className="h-5 w-5 text-primary" /> Retirar Stake
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Em stake: {formatREC(stakedAmount)} REC</p>
          <input
            type="text" inputMode="decimal" placeholder="0.0"
            value={unstakeInput}
            onChange={(e) => setUnstakeInput(e.target.value)}
            className="eco-input"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setUnstakeInput(formatREC(stakedAmount).replace(/\./g, "").replace(",", "."))}
              className="eco-btn-outline"
            >
              Máx
            </button>
            <button
              onClick={handleUnstake}
              disabled={tx.pending || !unstakeInput}
              className="eco-btn-primary flex-1"
            >
              {tx.pending ? <Spinner /> : <ArrowUpFromLine className="h-4 w-4" />}
              Retirar Stake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
