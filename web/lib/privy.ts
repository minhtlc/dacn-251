import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
} from "viem";
import { sepolia } from "viem/chains";

const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC_URL),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPrivyClients(wallet: { getEthereumProvider: () => Promise<any> }) {
  const provider = await wallet.getEthereumProvider();

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(provider),
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: SEPOLIA_RPC_URL ? http(SEPOLIA_RPC_URL) : custom(provider),
  });

  const chainId = await walletClient.getChainId();
  if (chainId !== sepolia.id) {
    try {
        await walletClient.switchChain({ id: sepolia.id });
    } catch (error) {
        throw new Error(`Wrong network. Switch to Sepolia (chainId ${sepolia.id}). Current: ${chainId}. Error: ${error}`);
    }
  }

  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error("No connected account found in wallet");

  return { walletClient, publicClient, account: account as Address };
}
