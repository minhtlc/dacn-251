import type { Address, Hex } from "viem";
import { keccak256, stringToHex } from "viem";
import stringify from "json-stable-stringify";
import { CertificateMetadata } from "./metadata";
import { publicClient } from "./privy";
import { registryAbi } from "@/abis/Registry";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;
const DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0");

export type IssuerCertificateItem = {
  tokenId: string;
  to: Address;            // recipient from event Minted
  issuer: Address;
  tokenURI: string;
  issuedAt: number;
  revoked: boolean;
  onchainMetadataHash: Hex;
  computedMetadataHash: Hex;
  status: "ACTIVE" | "REVOKED" | "INVALID";
  metadata?: CertificateMetadata;
};

function hashCanonicalJson(canonicalJson: string): Hex {
  return keccak256(stringToHex(canonicalJson));
}

// 1) tokenIds issued by issuer (Minted where issuer == me)
export async function getTokenIdsIssuedBy(issuer: Address): Promise<{ tokenIds: bigint[]; toByTokenId: Map<string, Address> }> {
  if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
  if (DEPLOY_BLOCK === BigInt(0)) throw new Error("Missing NEXT_PUBLIC_DEPLOY_BLOCK");

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
    args: { issuer },
    fromBlock: DEPLOY_BLOCK,
    toBlock: "latest",
  });

  const ids: bigint[] = [];
  const toMap = new Map<string, Address>();

  for (const log of logs) {
    const tokenId = log.args?.tokenId as bigint | undefined;
    const to = log.args?.to as Address | undefined;
    if (tokenId !== undefined) {
      ids.push(tokenId);
      if (to) toMap.set(tokenId.toString(), to);
    }
  }

  const uniq = Array.from(new Set(ids.map((x) => x.toString()))).map((s) => BigInt(s));
  uniq.sort((a, b) => (a > b ? -1 : 1));
  return { tokenIds: uniq, toByTokenId: toMap };
}

// 2) load details for a tokenId
export async function getIssuerCertificateItem(tokenId: bigint, toHint?: Address): Promise<IssuerCertificateItem> {
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

  const status: IssuerCertificateItem["status"] =
    revoked ? "REVOKED" : computed === metadataHash ? "ACTIVE" : "INVALID";

  return {
    tokenId: tokenId.toString(),
    to: toHint ?? (metadataJson?.recipient as Address) ?? ("0x0000000000000000000000000000000000000000" as Address),
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

export async function getCertificatesIssuedByMe(issuer: Address, limit = 50): Promise<IssuerCertificateItem[]> {
  const { tokenIds, toByTokenId } = await getTokenIdsIssuedBy(issuer);
  const sliced = tokenIds.slice(0, limit);

  const concurrency = 5;
  const results: IssuerCertificateItem[] = [];
  let i = 0;

  async function worker() {
    while (i < sliced.length) {
      const idx = i++;
      const id = sliced[idx];
      try {
        const toHint = toByTokenId.get(id.toString());
        const item = await getIssuerCertificateItem(id, toHint);
        results.push(item);
      } catch {
        // ignore
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, sliced.length) }, worker));
  results.sort((a, b) => (BigInt(b.tokenId) > BigInt(a.tokenId) ? 1 : -1));
  return results;
}
