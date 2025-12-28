"use client";

import { verifyCertificate } from "@/lib/verify";
import { useState } from "react";

export default function VerifyPage() {
  const [tokenId, setTokenId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function onVerify() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const id = BigInt(tokenId);
      const r = await verifyCertificate(id);
      setResult(r);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Verify Certificate</h1>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <input
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="tokenId"
          style={{ width: 200 }}
        />
        <button onClick={onVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>

      {error && <pre style={{ marginTop: 16, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}

      {result && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            Status:{" "}
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 6,
                background:
                  result.status === "VALID"
                    ? "#16a34a"
                    : result.status === "REVOKED"
                    ? "#f59e0b"
                    : result.status === "INVALID"
                    ? "#dc2626"
                    : "#64748b",
                color: "white",
              }}
            >
              {result.status}
            </span>
          </h2>

          <pre style={{ marginTop: 12, background: "#111", color: "#0f0", padding: 12, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
