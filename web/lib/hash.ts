import { keccak256, stringToHex, type Hex } from "viem";

/**
 * keccak256(utf8Bytes(canonicalJson))
 */
export function keccak256Utf8(input: string): Hex {
  return keccak256(stringToHex(input));
}
