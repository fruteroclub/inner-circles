import type {
  Address,
  ContractRunner,
  TransactionRequest,
} from "@aboutcircles/sdk-types";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  WaitForTransactionReceiptReturnType,
} from "viem";
import { gnosis } from "viem/chains";

const circlesRPC = "https://rpc.aboutcircles.com";

export const createBrowserRunner = async () => {
  const publicClient = createPublicClient({
    chain: gnosis,
    transport: http(circlesRPC),
  });

  const walletClient = createWalletClient({
    chain: gnosis,
    transport: custom(window.ethereum),
  });

  const [address] = await walletClient.getAddresses();

  console.log(`Runner address: ${address}`);

  const runner: ContractRunner = {
    publicClient,
    address,
    async init() {
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      this.address = account as Address;

      const currentChain = await walletClient.getChainId();
      if (currentChain !== gnosis.id) {
        throw new Error(
          "Please switch your wallet to Gnosis Chain (chainId 100)."
        );
      }
    },
    estimateGas: (tx: TransactionRequest) =>
      publicClient.estimateGas({ account: runner.address!, ...tx }),
    call: async (tx: TransactionRequest) => {
      const result = await publicClient.call({
        account: tx.from || runner.address!,
        ...tx,
      });
      return result.data || "0x";
    },
    resolveName: (name: string) => publicClient.getEnsAddress({ name }),
    async sendTransaction(
      txs: TransactionRequest[]
    ): Promise<WaitForTransactionReceiptReturnType> {
      if (!runner.address)
        throw new Error("Runner not initialised. Call init() first.");

      let receipt: WaitForTransactionReceiptReturnType | undefined;
      for (const tx of txs) {
        const hash = await walletClient.sendTransaction({
          account: runner.address,
          ...tx,
        });
        receipt = await publicClient.waitForTransactionReceipt({ hash });
      }

      if (!receipt) {
        throw new Error("No transactions submitted.");
      }
      return receipt;
    },
  };

  return runner;
};
