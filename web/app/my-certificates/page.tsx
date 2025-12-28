"use client";

import { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { Address } from "viem";
import { CertificateListItem, getMyCertificates } from "@/lib/certificatesByLogs";

type Filter = "ALL" | "VALID" | "REVOKED" | "INVALID";

export default function MyCertificatesPage() {
  const { ready, authenticated, login, user } = usePrivy();

  const [items, setItems] = useState<CertificateListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");

  const address = (user?.wallet?.address as Address | undefined) ?? undefined;

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((x) => x.status === filter);
  }, [items, filter]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      if (!authenticated) throw new Error("Please login/connect wallet");
      if (!address) throw new Error("No wallet address");
      const list = await getMyCertificates(address, 50);
      setItems(list);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Certificates</h1>

      {!ready ? (
        <p>Loading Privy…</p>
      ) : !authenticated ? (
        <button onClick={login}>Login / Connect Wallet</button>
      ) : (
        <p>Connected: {user?.wallet?.address}</p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
        <button onClick={load} disabled={loading || !authenticated}>
          {loading ? "Loading..." : "Load my certificates"}
        </button>

        <span style={{ marginLeft: 12 }}>Filter:</span>
        {(["ALL", "VALID", "REVOKED", "INVALID"] as Filter[]).map((f) => (
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

      {error && <pre style={{ marginTop: 16, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {filtered.map((c) => (
          <div key={c.tokenId} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  #{c.tokenId} — {c.metadata?.name ?? "Certificate"}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  Issued by: {c.metadata?.issuedBy ?? "-"} | Date: {c.metadata?.issuedDate ?? "-"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Issuer: {c.issuer}</div>
              </div>

              <span
                style={{
                  height: 24,
                  padding: "2px 10px",
                  borderRadius: 999,
                  background:
                    c.status === "VALID"
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
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
              tokenURI: {c.tokenURI}
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
          <p style={{ opacity: 0.8 }}>No certificates found (Minted events to your address).</p>
        )}
      </div>
    </div>
  );
}
