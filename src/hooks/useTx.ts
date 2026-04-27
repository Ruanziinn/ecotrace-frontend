import { useCallback, useState } from "react";
import { toast } from "sonner";
import { parseTxError, txExplorerUrl } from "@/utils/format";

type TxFn = () => Promise<{ hash: string; wait: () => Promise<unknown> }>;

export function useTx() {
  const [pending, setPending] = useState(false);

  const send = useCallback(async (
    fn: TxFn,
    opts?: { successMsg?: string; onSuccess?: () => void | Promise<void> }
  ) => {
    setPending(true);
    let toastId: string | number | undefined;
    try {
      const tx = await fn();
      toastId = toast.loading("Transação enviada... aguardando confirmação ⏳", {
        description: tx.hash.slice(0, 10) + "...",
        action: {
          label: "Ver no Etherscan",
          onClick: () => window.open(txExplorerUrl(tx.hash), "_blank"),
        },
      });
      await tx.wait();
      toast.dismiss(toastId);
      toast.success(opts?.successMsg ?? "Transação confirmada! ✓", {
        action: {
          label: "Etherscan",
          onClick: () => window.open(txExplorerUrl(tx.hash), "_blank"),
        },
      });
      await opts?.onSuccess?.();
      return true;
    } catch (err) {
      if (toastId !== undefined) toast.dismiss(toastId);
      toast.error(parseTxError(err));
      return false;
    } finally {
      setPending(false);
    }
  }, []);

  return { pending, send };
}
