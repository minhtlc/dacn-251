import { type Address, type Hex } from "viem";
import { getPrivyClients } from "./privy";
import { registryAbi } from "@/abis/Registry";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

export interface UserRole {
  isAdmin: boolean;
  isIssuer: boolean;
  walletAddress: Address | null;
}

/**
 * Check if a user has admin or issuer role
 * @param wallet - Privy wallet object
 * @returns UserRole object with role information
 */
export async function checkUserRole(wallet: {
  getEthereumProvider: () => Promise<any>;
}): Promise<UserRole> {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
  }

  try {
    const { publicClient, account } = await getPrivyClients(wallet);

    // Read role bytes32
    const issuerRole = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: registryAbi,
      functionName: "ISSUER_ROLE",
    })) as Hex;

    const adminRole = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: registryAbi,
      functionName: "DEFAULT_ADMIN_ROLE",
    })) as Hex;

    // Check if user has issuer role
    const isIssuer = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: registryAbi,
      functionName: "hasRole",
      args: [issuerRole, account],
    });

    // Check if user has admin role
    const isAdmin = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: registryAbi,
      functionName: "hasRole",
      args: [adminRole, account],
    });

    return {
      isAdmin: isAdmin as boolean,
      isIssuer: (isIssuer as boolean) || (isAdmin as boolean), // Admin can also mint
      walletAddress: account,
    };
  } catch (error) {
    console.error("Error checking user role:", error);
    // If there's an error, assume user is not admin
    return {
      isAdmin: false,
      isIssuer: false,
      walletAddress: null,
    };
  }
}

