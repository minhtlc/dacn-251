import { registryAbi } from "@/abis/Registry";
import {
  decodeEventLog,
  type Address,
  type Hex,
} from "viem";
import { getPrivyClients } from "./privy";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

export async function mintCertificate(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: { getEthereumProvider: () => Promise<any> };
  recipient: Address;
  tokenURI: string;
  metadataHash: Hex; // bytes32
}): Promise<{ txHash: Hex; tokenId: string | null }> {
  if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");

  const { walletClient, publicClient, account } = await getPrivyClients(params.wallet);

  const txHash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: registryAbi,
    functionName: "mintCertificate",
    args: [params.recipient, params.tokenURI, params.metadataHash],
    account,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  let tokenId: string | null = null;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: registryAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "Minted") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tokenId = (decoded.args as any).tokenId.toString();
        break;
      }
    } catch {
      // ignore non-matching logs
    }
  }

  return { txHash, tokenId };
}
