"use client";

import { useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { isAddress, type Address, type Hex } from "viem";
import { getPrivyClients } from "@/lib/privy";
import { registryAbi } from "@/abis/Registry";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

export default function IssuerRoleAdminPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];

  const [target, setTarget] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [tx, setTx] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const targetAddress = useMemo(() => (isAddress(target) ? (target as Address) : null), [target]);

  async function checkRoles() {
    setLoading(true);
    setError(null);
    setStatus(null);
    setTx(null);

    try {
      if (!authenticated) throw new Error("Please login/connect wallet");
      if (!activeWallet) throw new Error("No wallet found");
      if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
      if (!targetAddress) throw new Error("Invalid target address");

      const { publicClient, account } = await getPrivyClients(activeWallet as any);

      // read role bytes32
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

      const isTargetIssuer = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "hasRole",
        args: [issuerRole, targetAddress],
      });

      const isMeAdmin = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "hasRole",
        args: [adminRole, account],
      });

      console.log('checkRoles', {
        connected: account,
        target: targetAddress,
        isMeAdmin,
        isTargetIssuer,
        issuerRole,
        adminRole,
      });

      setStatus({
        connected: account,
        target: targetAddress,
        isMeAdmin,
        isTargetIssuer,
        issuerRole,
        adminRole,
      });
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function grantIssuer() {
    setLoading(true);
    setError(null);
    setTx(null);

    try {
      if (!authenticated) throw new Error("Please login/connect wallet");
      if (!activeWallet) throw new Error("No wallet found");
      if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
      if (!targetAddress) throw new Error("Invalid target address");

      const { walletClient, publicClient, account } = await getPrivyClients(activeWallet as any);

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "addIssuer",
        args: [targetAddress],
        account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      setTx({ action: "grant", hash, status: receipt.status });
      await checkRoles();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function revokeIssuer() {
    setLoading(true);
    setError(null);
    setTx(null);

    try {
      if (!authenticated) throw new Error("Please login/connect wallet");
      if (!activeWallet) throw new Error("No wallet found");
      if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
      if (!targetAddress) throw new Error("Invalid target address");

      const { walletClient, publicClient, account } = await getPrivyClients(activeWallet as any);

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "removeIssuer",
        args: [targetAddress],
        account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      setTx({ action: "revoke", hash, status: receipt.status });
      await checkRoles();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Admin: Manage ISSUER_ROLE</h1>

      {!ready ? (
        <p>Loading Privy…</p>
      ) : !authenticated ? (
        <button onClick={login}>Login / Connect Wallet</button>
      ) : (
        <p>Connected: {user?.wallet?.address}</p>
      )}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label>
          Target address to grant/revoke
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="0x..."
            style={{ width: "100%" }}
          />
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <button disabled={loading || !targetAddress} onClick={checkRoles}>
            Check roles
          </button>
          <button disabled={loading || !targetAddress} onClick={grantIssuer}>
            Grant ISSUER_ROLE
          </button>
          <button disabled={loading || !targetAddress} onClick={revokeIssuer}>
            Revoke ISSUER_ROLE
          </button>
        </div>
      </div>

      {error && (
        <pre style={{ marginTop: 16, color: "crimson", whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      {status && (
        <pre style={{ marginTop: 16, background: "#111", color: "#0f0", padding: 12, whiteSpace: "pre-wrap" }}>
{JSON.stringify(status, null, 2)}
        </pre>
      )}

      {tx && (
        <pre style={{ marginTop: 16, background: "#111", color: "#0ff", padding: 12, whiteSpace: "pre-wrap" }}>
{JSON.stringify(tx, null, 2)}
        </pre>
      )}
    </div>
  );
}
