"use client";

import React, { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import type { Address, Hex } from "viem";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Wallet, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { mintCertificate } from "@/lib/mint";

// Certificate types for dropdown
const certificateTypes = [
  { value: "Bachelor", label: "Bachelor" },
  { value: "Master", label: "Master" },
  { value: "Doctor", label: "Doctor" },
  { value: "Engineer", label: "Engineer" },
];

// Types for minting state
interface PreparedData {
  ok: boolean;
  recipient: string;
  tokenURI: string;
  metadataHash: string;
  metadataCid: string;
  canonicalJson?: string;
}

interface MintedData {
  txHash: string;
  tokenId: string | null;
  tokenURI: string;
  metadataHash: string;
  metadataCid: string;
}

export default function AddCertificatePage() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];

  const [formData, setFormData] = useState({
    recipientWallet: "",
    certificateType: "Bachelor",
    certificateName: "Blockchain Basics",
    specialization: "Computer Science",
    issuedBy: "HCMUT",
    issuedDate: "2025-12-28",
    studentName: "Nguyen Van A",
    studentId: "2012345",
  });

  // Minting state
  const [prepared, setPrepared] = useState<PreparedData | null>(null);
  const [minted, setMinted] = useState<MintedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Prepare certificate metadata for IPFS
  async function handlePrepare() {
    setLoading(true);
    setMintError(null);
    setPrepared(null);
    setMinted(null);

    // Show loading toast
    toast.loading("Preparing certificate metadata...", { id: "prepare" });
    console.log("🚀 [Prepare] Starting preparation with form data:", formData);

    try {
      // Validate required fields for minting
      if (!formData.recipientWallet) throw new Error("Recipient wallet is required");
      if (!formData.certificateType) throw new Error("Type is required");
      if (!formData.certificateName) throw new Error("Certificate Name is required");
      if (!formData.specialization) throw new Error("Specialization is required");
      if (!formData.issuedBy) throw new Error("Issued By is required");
      if (!formData.issuedDate) throw new Error("Issued Date is required");
      if (!formData.studentName) throw new Error("Student Name is required");
      if (!formData.studentId) throw new Error("Student ID is required");

      const requestBody = {
        type: formData.certificateType,
        name: formData.certificateName,
        specialization: formData.specialization,
        recipient: formData.recipientWallet,
        issuedBy: formData.issuedBy,
        issuedDate: formData.issuedDate,
        student: { 
          id: formData.studentId, 
          name: formData.studentName 
        },
      };

      console.log("📤 [Prepare] Sending request to /api/certificates/prepare:", requestBody);

      const res = await fetch("/api/certificates/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      console.log("📥 [Prepare] Response from API:", data);

      if (!res.ok || !data.ok) {
        console.error("❌ [Prepare] Failed:", data);
        throw new Error(data?.message || "Prepare failed");
      }
      
      setPrepared(data as PreparedData);
      toast.success(
        `✅ Metadata prepared successfully!\n\nCID: ${data.metadataCid}\nToken URI: ${data.tokenURI}`,
        { id: "prepare", duration: 5000 }
      );
      console.log("✅ [Prepare] Success! Prepared data:", data);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setMintError(errorMessage);
      toast.error(`❌ Prepare failed: ${errorMessage}`, { id: "prepare" });
      console.error("❌ [Prepare] Error:", e);
    } finally {
      setLoading(false);
    }
  }

  // Mint certificate on blockchain
  async function handleMint() {
    setLoading(true);
    setMintError(null);
    setMinted(null);

    console.log("🚀 [Mint] Starting mint process...");
    console.log("🔐 [Mint] Authenticated:", authenticated);
    console.log("👛 [Mint] Active wallet:", activeWallet);
    console.log("📋 [Mint] Prepared data:", prepared);

    try {
      if (!authenticated) throw new Error("Please login/connect wallet");
      if (!activeWallet) throw new Error("No wallet found. Connect a wallet in Privy.");
      if (!prepared) throw new Error("Please prepare first.");

      toast.loading("Minting certificate on blockchain... Please sign the transaction in your wallet.", { id: "minting" });

      const mintParams = {
        wallet: activeWallet as { getEthereumProvider: () => Promise<unknown> },
        recipient: prepared.recipient as Address,
        tokenURI: prepared.tokenURI as string,
        metadataHash: prepared.metadataHash as Hex,
      };
      console.log("📤 [Mint] Calling mintCertificate with params:", {
        recipient: mintParams.recipient,
        tokenURI: mintParams.tokenURI,
        metadataHash: mintParams.metadataHash,
      });

      const { txHash, tokenId } = await mintCertificate(mintParams);

      console.log("✅ [Mint] Transaction successful!");
      console.log("📜 [Mint] Transaction Hash:", txHash);
      console.log("🎫 [Mint] Token ID:", tokenId);

      const mintedData = {
        txHash,
        tokenId,
        tokenURI: prepared.tokenURI,
        metadataHash: prepared.metadataHash,
        metadataCid: prepared.metadataCid,
      };
      setMinted(mintedData);

      toast.success(
        `🎉 Certificate minted successfully!\n\nToken ID: ${tokenId}\nTx Hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
        { id: "minting", duration: 8000 }
      );
      console.log("✅ [Mint] Final minted data:", mintedData);
      
      // Reset form after successful mint
      setTimeout(() => {
        setFormData({
          recipientWallet: "",
          certificateType: "Bachelor",
          certificateName: "",
          specialization: "",
          issuedBy: "",
          issuedDate: "",
          studentName: "",
          studentId: "",
        });
        setPrepared(null);
        setMinted(null);
        console.log("🔄 [Mint] Form reset after successful mint");
      }, 5000);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setMintError(errorMessage);
      toast.error(`❌ Mint failed: ${errorMessage}`, { id: "minting" });
      console.error("❌ [Mint] Error:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger prepare and mint flow
    await handlePrepare();
  };

  const handleCancel = () => {
    setFormData({
      recipientWallet: "",
      certificateType: "Bachelor",
      certificateName: "",
      specialization: "",
      issuedBy: "",
      issuedDate: "",
      studentName: "",
      studentId: "",
    });
    setPrepared(null);
    setMinted(null);
    setMintError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Create Certificate</h1>
        <p className="text-muted-foreground">
          Create and mint a new certificate on the blockchain
        </p>
      </div>

      {/* Form */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Certificate Information
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Recipient Wallet */}
              <div className="w-full md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Recipient Wallet <span className="text-destructive">*</span>
                </label>
                <Input
                  name="recipientWallet"
                  value={formData.recipientWallet}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Blockchain wallet address of the certificate recipient
                </p>
              </div>

              {/* Certificate Type */}
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Type <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.certificateType}
                  onValueChange={(value: string) =>
                    handleSelectChange("certificateType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificateTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Certificate Name */}
              <Input
                label="Certificate Name"
                name="certificateName"
                value={formData.certificateName}
                onChange={handleInputChange}
                placeholder="e.g., Blockchain Basics"
                required
              />

              {/* Specialization */}
              <Input
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
                required
              />

              {/* Issued By */}
              <Input
                label="Issued By"
                name="issuedBy"
                value={formData.issuedBy}
                onChange={handleInputChange}
                placeholder="e.g., HCMUT"
                required
              />

              {/* Issued Date */}
              <Input
                label="Issued Date"
                name="issuedDate"
                type="date"
                value={formData.issuedDate}
                onChange={handleInputChange}
                required
              />

              {/* Student Name */}
              <Input
                label="Student Name"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="e.g., Nguyen Van A"
                required
              />

              {/* Student ID */}
              <Input
                label="Student ID"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                placeholder="e.g., 2012345"
                required
              />
            </div>

            {/* Blockchain Minting Section */}
            {authenticated && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Mint Certificate on Blockchain
                </h4>
                <div className="flex gap-4 mb-4">
                  <Button
                    type="button"
                    onClick={handlePrepare}
                    disabled={loading}
                    variant="outline"
                    className="gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    1) Prepare (IPFS + Hash)
                  </Button>
                  <Button
                    type="button"
                    onClick={handleMint}
                    disabled={loading || !prepared}
                    className="gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="h-4 w-4" />
                    )}
                    2) Mint (Wallet signs)
                  </Button>
                </div>
                {mintError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {mintError}
                  </div>
                )}
                {prepared && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                    ✓ Prepared: {prepared.metadataCid}
                  </div>
                )}
                {minted && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                    <div className="text-green-700 font-semibold">✓ Minted successfully!</div>
                    <div className="mt-1 text-green-600">Token ID: {minted.tokenId}</div>
                    <div className="text-green-600">Tx Hash: {minted.txHash}</div>
                  </div>
                )}
              </div>
            )}

            {!authenticated && (
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  To mint certificate on blockchain, please login/connect wallet.
                </p>
                <Button
                  type="button"
                  onClick={login}
                  variant="outline"
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Login / Connect Wallet
                </Button>
              </div>
            )}

            {/* Cancel Button */}
            <div className="mt-8 flex gap-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancel}
                className="gap-2 bg-white text-destructive border border-destructive hover:bg-destructive hover:text-white"
                disabled={loading}
              >
                <X className="h-4 w-4" />
                Cancel / Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
