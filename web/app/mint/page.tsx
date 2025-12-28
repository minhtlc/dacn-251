"use client";

import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import type { Address, Hex } from "viem";
import { mintCertificate } from "@/lib/mint";

export default function CreateCertificatePage() {
  const { ready, authenticated, login, user } = usePrivy();
  const { wallets } = useWallets();

  const activeWallet = wallets?.[0]; // for demo: first wallet

  const [name, setName] = useState("Blockchain Basics");
  const [type, setType] = useState("Bachelor");
  const [specialization, setSpecialization] = useState("Computer Science");
  const [recipient, setRecipient] = useState("");
  const [issuedBy, setIssuedBy] = useState("HCMUT");
  const [issuedDate, setIssuedDate] = useState("2025-12-28");
  const [studentName, setStudentName] = useState("Nguyen Van A");
  const [studentId, setStudentId] = useState("2012345");

  const [prepared, setPrepared] = useState<any>(null);
  const [minted, setMinted] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function prepare() {
    setLoading(true);
    setError(null);
    setPrepared(null);
    setMinted(null);

    try {
      const res = await fetch("/api/certificates/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type,
            name,
            specialization,
            recipient,
            issuedBy,
            issuedDate,
            student: { id: studentId, name: studentName },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.message || "Prepare failed");
      setPrepared(data);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function mint() {
    setLoading(true);
    setError(null);
    setMinted(null);

    try {
      if (!authenticated) throw new Error("Please login/connect wallet");
      if (!activeWallet) throw new Error("No wallet found. Connect a wallet in Privy.");
      if (!prepared) throw new Error("Prepare first.");

      const { txHash, tokenId } = await mintCertificate({
        wallet: activeWallet as any,
        recipient: prepared.recipient as Address,
        tokenURI: prepared.tokenURI as string,
        metadataHash: prepared.metadataHash as Hex,
      });

      setMinted({
        txHash,
        tokenId,
        tokenURI: prepared.tokenURI,
        metadataHash: prepared.metadataHash,
        metadataCid: prepared.metadataCid,
      });
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Create Certificate (Privy + viem)</h1>

      {!ready ? (
        <p>Loading Privy...</p>
      ) : !authenticated ? (
        <button onClick={login}>Login / Connect Wallet</button>
      ) : (
        <p>Connected: {user?.wallet?.address}</p>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          Recipient wallet
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Type
          <input value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Certificate Name
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Specialization
          <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Issued By
          <input value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Issued Date
          <input value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Student Name
          <input value={studentName} onChange={(e) => setStudentName(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Student ID
          <input value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ width: "100%" }} />
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <button disabled={loading} onClick={prepare}>1) Prepare (IPFS + Hash)</button>
          <button disabled={loading || !prepared} onClick={mint}>2) Mint (Wallet signs)</button>
        </div>
      </div>

      {error && <pre style={{ marginTop: 16, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}
      {prepared && <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{JSON.stringify(prepared, null, 2)}</pre>}
      {minted && <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{JSON.stringify(minted, null, 2)}</pre>}
    </div>
  );
}
