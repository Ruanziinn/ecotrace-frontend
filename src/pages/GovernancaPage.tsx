import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { Vote, ThumbsUp, ThumbsDown, PlayCircle, FileText } from "lucide-react";
import { useTx } from "@/hooks/useTx";
import { formatAddress, formatDate, formatREC } from "@/utils/format";
import { Spinner } from "@/components/Spinner";
import { PROPOSAL_STATE } from "@/contracts/config";

interface Props {
  ecoGovernance: Contract | null;
  address: string | null;
  refreshKey: number;
  bumpRefresh: () => void;
}

interface Proposal {
  id: bigint;
  cooperative: string;
  description: string;
  votesFor: bigint;
  votesAgainst: bigint;
  deadline: bigint;
  executed: boolean;
  isRevoke: boolean;
  state: number;
  hasVoted: boolean;
}

const STATE_BADGES: Record<number, { label: string; cls: string }> = {
  0: { label: "Em votação", cls: "bg-info/15 text-info" },
  1: { label: "Aprovada",   cls: "bg-success/15 text-success" },
  2: { label: "Rejeitada",  cls: "bg-destructive/15 text-destructive" },
  3: { label: "Executada",  cls: "bg-muted text-muted-foreground" },
};

export function GovernancaPage({ ecoGovernance, address, refreshKey, bumpRefresh }: Props) {
  const [coopAddr, setCoopAddr] = useState("");
  const [desc, setDesc] = useState("");
  const [isRevoke, setIsRevoke] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const tx = useTx();
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ecoGovernance || !address) return;
      setLoading(true);
      try {
        const count: bigint = await ecoGovernance.proposalCount().catch(() => 0n);
        const total = Number(count);
        if (total === 0) { setProposals([]); return; }
        const start = Math.max(0, total - 10);
        const ids = Array.from({ length: total - start }, (_, i) => BigInt(start + i));
        const list: Proposal[] = await Promise.all(ids.map(async (id) => {
          const p = await ecoGovernance.proposals(id);
          const [state, voted] = await Promise.all([
            ecoGovernance.getState(id).catch(() => 0),
            ecoGovernance.hasVoted(id, address).catch(() => false),
          ]);
          return {
            id,
            cooperative: p[0] as string,
            description: p[1] as string,
            votesFor: p[2] as bigint,
            votesAgainst: p[3] as bigint,
            deadline: p[4] as bigint,
            executed: p[5] as boolean,
            isRevoke: p[6] as boolean,
            state: Number(state),
            hasVoted: voted as boolean,
          };
        }));
        list.sort((a, b) => Number(b.id - a.id));
        if (!cancelled) setProposals(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [ecoGovernance, address, refreshKey]);

  async function handlePropose() {
    if (!ecoGovernance) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(coopAddr)) return;
    if (!desc.trim()) return;
    await tx.send(
      () => ecoGovernance.propose(coopAddr, desc.trim(), isRevoke),
      { successMsg: "Proposta criada ✓", onSuccess: async () => { setCoopAddr(""); setDesc(""); setIsRevoke(false); bumpRefresh(); } }
    );
  }

  async function handleVote(id: bigint, support: boolean) {
    if (!ecoGovernance) return;
    setActionId(id.toString() + (support ? "Y" : "N"));
    await tx.send(
      () => ecoGovernance.vote(id, support),
      { successMsg: "Voto registrado ✓", onSuccess: async () => bumpRefresh() }
    );
    setActionId(null);
  }
  async function handleExecute(id: bigint) {
    if (!ecoGovernance) return;
    setActionId(id.toString() + "X");
    await tx.send(
      () => ecoGovernance.execute(id),
      { successMsg: "Proposta executada ✓", onSuccess: async () => bumpRefresh() }
    );
    setActionId(null);
  }

  return (
    <div className="container mt-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Governança</h2>
        <p className="text-sm text-muted-foreground">Crie e vote em propostas para gerenciar cooperativas aprovadas.</p>
      </div>

      <div className="eco-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Nova proposta
        </h3>
        <div className="grid gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Endereço da cooperativa</label>
            <input type="text" placeholder="0x..." value={coopAddr}
              onChange={(e) => setCoopAddr(e.target.value)} className="eco-input mt-1.5 font-mono text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição</label>
            <textarea rows={3} placeholder="Descreva a proposta..." value={desc}
              onChange={(e) => setDesc(e.target.value)} className="eco-input mt-1.5 resize-none" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-input/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium">{isRevoke ? "Revogar cooperativa" : "Aprovar cooperativa"}</p>
              <p className="text-xs text-muted-foreground">Tipo de proposta</p>
            </div>
            <button
              type="button"
              onClick={() => setIsRevoke(!isRevoke)}
              className={`relative h-7 w-12 rounded-full transition ${isRevoke ? "bg-destructive" : "bg-primary"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${isRevoke ? "left-[calc(100%-1.625rem)]" : "left-0.5"}`} />
            </button>
          </div>
          <button
            onClick={handlePropose}
            disabled={tx.pending || !coopAddr || !desc}
            className="eco-btn-primary self-start"
          >
            {tx.pending ? <Spinner /> : <Vote className="h-4 w-4" />}
            Criar Proposta
          </button>
        </div>
      </div>

      <div className="eco-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Últimas propostas</h3>
          <span className="text-xs text-muted-foreground">{proposals.length} proposta(s)</span>
        </div>

        {loading ? (
          <div className="py-10 grid place-items-center text-muted-foreground"><Spinner className="h-6 w-6" /></div>
        ) : proposals.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Nenhuma proposta ainda.</div>
        ) : (
          <div className="space-y-3">
            {proposals.map((p) => {
              const total = p.votesFor + p.votesAgainst;
              const pctFor = total > 0n ? Number((p.votesFor * 10000n) / total) / 100 : 0;
              const pctAgainst = total > 0n ? 100 - pctFor : 0;
              const badge = STATE_BADGES[p.state] ?? STATE_BADGES[0];
              const isActive = p.state === PROPOSAL_STATE.Active;
              const isApproved = p.state === PROPOSAL_STATE.Approved;
              return (
                <div key={p.id.toString()} className="rounded-xl border border-border bg-input/30 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">#{p.id.toString()}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.isRevoke ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                          {p.isRevoke ? "Revogar" : "Aprovar"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium">{p.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground font-mono">
                        Cooperativa: {formatAddress(p.cooperative)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Prazo: {formatDate(p.deadline)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-success">A favor: {formatREC(p.votesFor)} ({pctFor.toFixed(1)}%)</span>
                      <span className="text-destructive">Contra: {formatREC(p.votesAgainst)} ({pctAgainst.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted flex">
                      <div className="h-full bg-success transition-all" style={{ width: `${pctFor}%` }} />
                      <div className="h-full bg-destructive transition-all" style={{ width: `${pctAgainst}%` }} />
                    </div>
                  </div>

                  {(isActive || isApproved) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {isActive && !p.hasVoted && (
                        <>
                          <button
                            onClick={() => handleVote(p.id, true)}
                            disabled={tx.pending}
                            className="eco-btn bg-success text-success-foreground hover:opacity-90"
                          >
                            {actionId === p.id.toString() + "Y" ? <Spinner /> : <ThumbsUp className="h-4 w-4" />}
                            Votar Sim ✓
                          </button>
                          <button
                            onClick={() => handleVote(p.id, false)}
                            disabled={tx.pending}
                            className="eco-btn-danger"
                          >
                            {actionId === p.id.toString() + "N" ? <Spinner /> : <ThumbsDown className="h-4 w-4" />}
                            Votar Não ✗
                          </button>
                        </>
                      )}
                      {isActive && p.hasVoted && (
                        <span className="text-xs text-muted-foreground self-center">Você já votou nesta proposta.</span>
                      )}
                      {isApproved && (
                        <button
                          onClick={() => handleExecute(p.id)}
                          disabled={tx.pending}
                          className="eco-btn-primary"
                        >
                          {actionId === p.id.toString() + "X" ? <Spinner /> : <PlayCircle className="h-4 w-4" />}
                          Executar Proposta
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
