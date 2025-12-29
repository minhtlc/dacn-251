"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyCertificate, VerifyResult } from "@/lib/verify";
import { VerificationValid } from "@/components/VerificationValid";
import { VerificationRevoked } from "@/components/VerificationRevoked";
import { VerificationInvalid } from "@/components/VerificationInvalid";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Search, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

function VerifyContent() {
  const searchParams = useSearchParams();
  const urlTokenId = searchParams.get("tokenId");

  const [tokenIdInput, setTokenIdInput] = useState(urlTokenId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Auto-verify if tokenId is in URL
  useEffect(() => {
    if (urlTokenId && /^\d+$/.test(urlTokenId)) {
      handleVerify(urlTokenId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTokenId]);

  async function handleVerify(tokenId?: string) {
    const id = tokenId || tokenIdInput.trim();
    
    if (!id) {
      toast.error("Please enter a Token ID");
      return;
    }

    if (!/^\d+$/.test(id)) {
      toast.error("Token ID must be a number");
      return;
    }

    setLoading(true);
    setResult(null);
    setShowResult(false);
    toast.loading("Verifying certificate on blockchain...", { id: "verify" });

    try {
      const verifyResult = await verifyCertificate(BigInt(id));
      setResult(verifyResult);
      setShowResult(true);

      switch (verifyResult.status) {
        case "VALID":
          toast.success("✅ Certificate is VALID!", { id: "verify" });
          break;
        case "REVOKED":
          toast.error("⚠️ Certificate has been REVOKED", { id: "verify" });
          break;
        case "INVALID":
          toast.error("❌ Certificate is INVALID", { id: "verify" });
          break;
        case "NOT_FOUND":
          toast.error("🔍 Certificate not found", { id: "verify" });
          break;
        case "ERROR":
          toast.error(`Error: ${verifyResult.error}`, { id: "verify" });
          break;
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message, { id: "verify" });
    } finally {
      setLoading(false);
    }
  }

  const handleBack = () => {
    setShowResult(false);
    setResult(null);
    setTokenIdInput("");
    // Update URL to remove tokenId parameter
    window.history.pushState({}, '', '/verify');
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      window.location.href = '/';
    }
  };

  // Show verification result components
  if (showResult && result) {
    if (result.status === "VALID") {
      return <VerificationValid result={result} onBack={handleBack} />;
    }
    if (result.status === "REVOKED") {
      return <VerificationRevoked result={result} onBack={handleBack} />;
    }
    // INVALID, NOT_FOUND, ERROR
    return <VerificationInvalid result={result} onBack={handleBack} />;
  }

  // Show search form
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header 
        onNavigate={handleNavigate} 
        currentPage="verify" 
        isLoggedIn={false}
        userName=""
        onLogout={() => {}}
      />

      <main className="flex-1 bg-gray-50 py-16 px-6">
        <div className="container mx-auto max-w-xl">
          {/* Back Link */}
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Home</span>
          </a>

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#0d6efd' }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Verify Certificate
            </h1>
            <p className="text-gray-600">
              Enter a Token ID to verify a certificate on the blockchain
            </p>
          </div>

          {/* Verification Form */}
          <Card className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
                  Token ID
                </label>
                <Input
                  id="tokenId"
                  type="text"
                  placeholder="Enter Token ID (e.g., 1, 2, 3...)"
                  value={tokenIdInput}
                  onChange={(e) => setTokenIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleVerify()}
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={() => handleVerify()}
                className="w-full h-12 text-base font-semibold rounded-lg gap-2"
                style={{ backgroundColor: '#0d6efd' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Token ID</strong> is a unique number assigned to each certificate when it&apos;s minted on the blockchain.
                You can find it on the certificate or in the minting confirmation.
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Loading fallback for Suspense
function VerifyLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense
export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}
