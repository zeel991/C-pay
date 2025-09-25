import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccountAPTBalance } from "@/view-functions/getAccountBalance";
import { transferAPT } from "@/entry-functions/transferAPT";
import { Send, Wallet } from "lucide-react";

export function TransferAPT() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const [aptBalance, setAptBalance] = useState<number>(0);
  const [recipient, setRecipient] = useState<string>();
  const [transferAmount, setTransferAmount] = useState<number>();
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({
    queryKey: ["apt-balance", account?.address],
    refetchInterval: 10_000,
    queryFn: async () => {
      try {
        if (!account) return { balance: 0 };
        const balance = await getAccountAPTBalance({ accountAddress: account!.address.toStringLong() });
        return { balance };
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error });
        return { balance: 0 };
      }
    },
  });

  useEffect(() => {
    if (data) setAptBalance(data.balance);
  }, [data]);

  const formattedBalance = aptBalance / Math.pow(10, 8);
  const isTransferDisabled =
    !account || !recipient || !transferAmount || transferAmount > formattedBalance || transferAmount <= 0;

  const onClickButton = async () => {
    if (!account || !recipient || !transferAmount) return;

    try {
      const committedTransaction = await signAndSubmitTransaction(
        transferAPT({ to: recipient, amount: Math.pow(10, 8) * transferAmount })
      );
      const executedTransaction = await aptosClient().waitForTransaction({ transactionHash: committedTransaction.hash });
      queryClient.invalidateQueries();
      toast({ title: "Success", description: `Transaction succeeded, hash: ${executedTransaction.hash}` });
      setShowForm(false);
      setRecipient("");
      setTransferAmount(undefined);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Transaction failed" });
    }
  };

  return (
    <>
      {!showForm && (
        <div className="max-w-md mx-auto min-h-[280px] flex flex-col justify-center gap-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your Aptos Balance</h2>
            <p className="text-gray-500 mb-5">Send APT to any Aptos address quickly and securely.</p>
          </div>

          {/* Balance display */}
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="h-6 w-6 text-cyan-600" />
            <span className="text-lg font-semibold text-gray-900">{formattedBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} APT</span>
          </div>

          {/* Send button */}
          <Button
            onClick={() => setShowForm(true)}
            className="w-full px-6 py-3 rounded-xl font-semibold flex items-center gap-3 bg-black text-white hover:bg-gray-900 shadow-lg transition-all duration-300"
          >
            <Send className="h-5 w-5" />
            Send APT
          </Button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-5 shadow-lg border border-gray-200">
            {/* Balance Display */}
            <div className="flex items-center gap-2 mb-1 text-gray-900">
              <Wallet className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Balance</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {formattedBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} APT
            </div>

            {/* Recipient Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Recipient Address</label>
              <Input
                disabled={!account}
                placeholder="0x1234..."
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 rounded-lg"
              />
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-2 text-gray-900">
                <label className="text-sm font-semibold">Amount</label>
                <span className="text-xs text-gray-500">
                  Max: {formattedBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} APT
                </span>
              </div>
              <Input
                disabled={!account}
                placeholder="0.00"
                type="number"
                step="0.00000001"
                min="0"
                max={formattedBalance}
                onChange={(e) => setTransferAmount(parseFloat(e.target.value))}
                className="bg-gray-50 border border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 rounded-lg"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-100 transition"
              >
                Cancel
              </Button>
              <Button
                onClick={onClickButton}
                disabled={isTransferDisabled}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition ${
                  isTransferDisabled
                    ? "bg-gray-300 cursor-not-allowed text-gray-600"
                    : "bg-black shadow hover:bg-gray-900"
                }`}
              >
                Send
              </Button>
            </div>

            {/* Status Messages */}
            {!account && <p className="text-sm text-gray-500 text-center">Connect your wallet to send APT</p>}
            {account && transferAmount && transferAmount > formattedBalance && (
              <p className="text-sm text-red-600 text-center">Insufficient balance</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
