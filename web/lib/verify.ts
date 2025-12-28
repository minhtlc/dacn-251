import stringify from "json-stable-stringify";
import { keccak256, stringToHex, type Address, type Hex } from "viem";
import { publicClient } from "./privy";
import { registryReadAbi } from "@/abis/Registry";
import { CertificateMetadata } from "./metadata";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

export type VerifyResult = {
  tokenId: string;
  issuer: Address;
  tokenURI: string;
  issuedAt: number;
  revoked: boolean;
  onchainMetadataHash: Hex;
  computedMetadataHash: Hex;
  status: "VALID" | "REVOKED" | "INVALID" | "NOT_FOUND" | "ERROR";
  metadata?: CertificateMetadata;
  error?: string;
};

function hashCanonicalJson(canonicalJson: string): Hex {
  return keccak256(stringToHex(canonicalJson));
}

export async function verifyCertificate(tokenId: bigint): Promise<VerifyResult> {
  try {
    if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");

    // 1) read on-chain
    const [issuer, metadataHash, uri, issuedAt, revoked] = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: registryReadAbi,
      functionName: "getCertificate",
      args: [tokenId],
    });

    // 2) fetch metadata
    const metadata = await fetch(uri);
    if (!metadata.ok) throw new Error(`Failed to fetch metadata from ${uri}`);
    const metadataJson = await metadata.json();

    // 3) canonicalize & hash
    const canonicalJson = stringify(metadataJson) as string;
    const computed = hashCanonicalJson(canonicalJson);

    // 4) compare
    let status: VerifyResult["status"];
    if (revoked) status = "REVOKED";
    else if (computed === metadataHash) status = "VALID";
    else status = "INVALID";

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
  } catch (e: any) {
    const msg = e?.shortMessage || e?.message || String(e);

    // if token doesn't exist, getCertificate will revert => treat as NOT_FOUND
    const notFound =
      msg.toLowerCase().includes("not found") ||
      msg.toLowerCase().includes("execution reverted") ||
      msg.toLowerCase().includes("revert");

    return {
      tokenId: tokenId.toString(),
      issuer: "0x0000000000000000000000000000000000000000",
      tokenURI: "",
      issuedAt: 0,
      revoked: false,
      onchainMetadataHash: "0x0" as Hex,
      computedMetadataHash: "0x0" as Hex,
      status: notFound ? "NOT_FOUND" : "ERROR",
      error: msg,
    };
  }
}
