import type { Address, Hex } from "viem";
import { keccak256, stringToHex } from "viem";
import stringify from "json-stable-stringify";
import { publicClient } from "./privy";
import { registryAbi } from "@/abis/Registry";
import { CertificateMetadata } from "./metadata";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;
const DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0");

export type CertificateListItem = {
  tokenId: string;
  issuer: Address;
  tokenURI: string;
  issuedAt: number;
  revoked: boolean;
  onchainMetadataHash: Hex;
  computedMetadataHash: Hex;
  status: "VALID" | "REVOKED" | "INVALID";
  metadata?: CertificateMetadata;
};

function hashCanonicalJson(canonicalJson: string): Hex {
  return keccak256(stringToHex(canonicalJson));
}

export async function getTokenIdsMintedTo(to: Address): Promise<bigint[]> {
  if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
  if (DEPLOY_BLOCK === BigInt(0)) throw new Error("Missing NEXT_PUBLIC_DEPLOY_BLOCK");

  // get logs for Minted where "to" is indexed, so filtering is efficient
  const logs = await publicClient.getLogs({
    address: CONTRACT_ADDRESS,
    event: {
      type: "event",
      name: "Minted",
      inputs: [
        { indexed: true, name: "tokenId", type: "uint256" },
        { indexed: true, name: "to", type: "address" },
        { indexed: true, name: "issuer", type: "address" },
        { indexed: false, name: "tokenURI", type: "string" },
        { indexed: false, name: "metadataHash", type: "bytes32" },
      ],
    },
    args: { to },
    fromBlock: DEPLOY_BLOCK,
    toBlock: "latest",
  });

  const ids: bigint[] = [];
  for (const log of logs) {
    // viem can decode automatically when using `event:` above, but keep safe:
    const tokenId = (log.args?.tokenId ?? null) as bigint | null;
    if (tokenId !== null) ids.push(tokenId);
  }

  // unique + sort desc (newest first)
  const uniq = Array.from(new Set(ids.map((x) => x.toString()))).map((s) => BigInt(s));
  uniq.sort((a, b) => (a > b ? -1 : 1));
  return uniq;
}

export async function getCertificateItem(tokenId: bigint): Promise<CertificateListItem> {
  if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");

  const [issuer, metadataHash, uri, issuedAt, revoked] = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: registryAbi,
    functionName: "getCertificate",
    args: [tokenId],
  });

  const metadata = await fetch(uri);
  if (!metadata.ok) throw new Error(`Failed to fetch metadata from ${uri}`);
  const metadataJson = await metadata.json();

  const canonicalJson = stringify(metadataJson) as string;
  const computed = hashCanonicalJson(canonicalJson);

  const status: CertificateListItem["status"] =
    revoked ? "REVOKED" : computed === metadataHash ? "VALID" : "INVALID";

  return {
    tokenId: tokenId.toString(),
    issuer,
    tokenURI: uri,
    issuedAt: Number(issuedAt),
    revoked,
    onchainMetadataHash: metadataHash,
    computedMetadataHash: computed,
    status,
    metadata: metadataJson,
  };
}

/**
 * Load list with a simple concurrency limit to avoid blasting RPC/IPFS.
 */
export async function getMyCertificates(to: Address, limit = 50): Promise<CertificateListItem[]> {
  const tokenIds = await getTokenIdsMintedTo(to);
  const sliced = tokenIds.slice(0, limit);

  const concurrency = 5;
  const results: CertificateListItem[] = [];
  let i = 0;

  async function worker() {
    while (i < sliced.length) {
      const idx = i++;
      const id = sliced[idx];
      try {
        const item = await getCertificateItem(id);
        results.push(item);
      } catch (e) {
        // skip failed item but keep list
        // (optionally push an error item)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, sliced.length) }, worker));

  // sort by tokenId desc again (because concurrency results out of order)
  results.sort((a, b) => BigInt(b.tokenId) > BigInt(a.tokenId) ? 1 : -1);
  return results;
}
