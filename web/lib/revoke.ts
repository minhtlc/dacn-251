import { registryAbi } from "@/abis/Registry";
import type { Address, Hex } from "viem";
import { getPrivyClients } from "./privy";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

export async function revokeCertificate(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: { getEthereumProvider: () => Promise<any> };
  tokenId: bigint;
}): Promise<{ txHash: Hex }> {
  if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");

  const { walletClient, publicClient, account } = await getPrivyClients(params.wallet);

  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: registryAbi,
    functionName: "revoke",
    args: [params.tokenId],
    account,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash };
}
