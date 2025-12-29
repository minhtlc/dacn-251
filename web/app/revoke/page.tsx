"use client";

import { useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import type { Address } from "viem";
import { IssuerCertificateItem, getCertificatesIssuedByMe } from "@/lib/issuerCertificatesByLogs";
import { revokeCertificate } from "@/lib/revoke";

type Filter = "ALL" | "ACTIVE" | "REVOKED" | "INVALID";

export default function IssuerCertificatesPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];

  const issuer = (user?.wallet?.address as Address | undefined) ?? undefined;

  const [items, setItems] = useState<IssuerCertificateItem[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txMsg, setTxMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((x) => x.status === filter);
  }, [items, filter]);

  async function load() {
    setLoading(true);
    setError(null);
    setTxMsg(null);
    try {
      if (!authenticated) throw new Error("Please login/connect wallet");
      if (!issuer) throw new Error("No wallet address");
      const list = await getCertificatesIssuedByMe(issuer, 50);
      setItems(list);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function revokeOne(tokenId: string) {
    setLoading(true);
    setError(null);
    setTxMsg(null);
    try {
      if (!authenticated) throw new Error("Please login/connect wallet");
      if (!activeWallet) throw new Error("No active wallet");
      const { txHash } = await revokeCertificate({
        wallet: activeWallet as any,
        tokenId: BigInt(tokenId),
      });
      setTxMsg(`Revoked tokenId #${tokenId} (tx: ${txHash})`);

      // refresh only this item
      setItems((prev) =>
        prev.map((x) => (x.tokenId === tokenId ? { ...x, revoked: true, status: "REVOKED" } : x))
      );
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Issuer: Manage Certificates</h1>

      {!ready ? (
        <p>Loading Privy…</p>
      ) : !authenticated ? (
        <button onClick={login}>Login / Connect Wallet</button>
      ) : (
        <p>Connected issuer: {user?.wallet?.address}</p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
        <button onClick={load} disabled={loading || !authenticated}>
          {loading ? "Loading..." : "Load issued certificates"}
        </button>

        <span style={{ marginLeft: 12 }}>Filter:</span>
        {(["ALL", "ACTIVE", "REVOKED", "INVALID"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid #ccc",
              background: filter === f ? "#111" : "transparent",
              color: filter === f ? "white" : "black",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {txMsg && <div style={{ marginTop: 12, color: "#0ea5e9" }}>{txMsg}</div>}
      {error && <pre style={{ marginTop: 12, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {filtered.map((c) => (
          <div key={c.tokenId} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  #{c.tokenId} — {c.metadata?.name ?? "Certificate"}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  To: {c.to} | Date: {c.metadata?.issuedDate ?? "-"} | IssuedBy: {c.metadata?.issuedBy ?? "-"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>tokenURI: {c.tokenURI}</div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  style={{
                    height: 24,
                    padding: "2px 10px",
                    borderRadius: 999,
                    background:
                      c.status === "ACTIVE"
                        ? "#16a34a"
                        : c.status === "REVOKED"
                        ? "#f59e0b"
                        : "#dc2626",
                    color: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    fontWeight: 700,
                  }}
                >
                  {c.status}
                </span>

                <button
                  disabled={loading || c.status === "REVOKED"}
                  onClick={() => revokeOne(c.tokenId)}
                  style={{ padding: "6px 10px" }}
                >
                  Revoke
                </button>
              </div>
            </div>

            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: "pointer" }}>Details</summary>
              <pre style={{ marginTop: 8, background: "#111", color: "#0f0", padding: 10, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(c, null, 2)}
              </pre>
            </details>
          </div>
        ))}

        {!loading && authenticated && items.length === 0 && (
          <p style={{ opacity: 0.8 }}>No certificates found (Minted events by your address).</p>
        )}
      </div>
    </div>
  );
}
