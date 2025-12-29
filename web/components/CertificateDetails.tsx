"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CertificateListItem } from "@/lib/certificatesByLogs";
import { 
  CheckCircle, 
  Download, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink,
  ArrowLeft,
  QrCode,
  XCircle,
  User,
  AlertTriangle,
  Award
} from "lucide-react";
import toast from "react-hot-toast";

interface CertificateDetailsProps {
  certificate: CertificateListItem;
  userName: string;
  onBack: () => void;
}

export function CertificateDetails({ certificate, userName, onBack }: CertificateDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get contract address from environment
  const smartContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  
  // Certificate metadata
  const metadata = certificate.metadata;
  const title = metadata?.name || `Certificate #${certificate.tokenId}`;
  const institution = metadata?.issuedBy || "Unknown Issuer";
  const issuedDate = metadata?.issuedDate || new Date(certificate.issuedAt * 1000).toLocaleDateString();
  const recipient = metadata?.student?.name || userName;
  const specialization = metadata?.specialization || "";
  const certificateType = metadata?.type || "";

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!', { duration: 2000 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadPDF = () => {
    toast.success('Downloading PDF...', { duration: 2000 });
    // TODO: Implement PDF download functionality
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/verify?tokenId=${certificate.tokenId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!', { duration: 2000 });
  };

  const handleRequestSupport = () => {
    toast.success('Support request submitted!', { duration: 2000 });
    // TODO: Implement support request functionality
  };

  const isRevoked = certificate.status === 'REVOKED';
  const isInvalid = certificate.status === 'INVALID';
  const isValid = certificate.status === 'VALID';

  const handleViewOnBlockchain = (type: 'contract' | 'token') => {
    // Using Sepolia Etherscan for testnet
    const baseUrl = 'https://sepolia.etherscan.io';
    const url = type === 'contract' 
      ? `${baseUrl}/address/${smartContractAddress}`
      : `${baseUrl}/token/${smartContractAddress}?a=${certificate.tokenId}`;
    window.open(url, '_blank');
  };

  const getStatusBadge = () => {
    if (isValid) {
      return (
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Verified</span>
        </div>
      );
    } else if (isRevoked) {
      return (
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-2">
          <XCircle className="h-5 w-5" />
          <span className="font-semibold">REVOKED</span>
        </div>
      );
    } else if (isInvalid) {
      return (
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 rounded-full px-4 py-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">INVALID</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Main Certificate Card */}
        <Card className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Certificate Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Certificate Title */}
              <div>
                <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-2">
                  <Award className="h-4 w-4" />
                  {certificateType && <span>{certificateType}</span>}
                  {specialization && <span>• {specialization}</span>}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                <p className="text-lg text-gray-600">
                  Issued by {institution}
                </p>
              </div>

              {/* Status Badge */}
              {getStatusBadge()}

              {/* Certificate Information */}
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recipient</p>
                  <p className="text-base font-semibold text-gray-900">{recipient}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Token ID</p>
                  <p className="text-sm font-semibold text-gray-900 font-mono">
                    #{certificate.tokenId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(issuedDate)}
                  </p>
                </div>
                {metadata?.student?.id && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Student ID</p>
                    <p className="text-base font-semibold text-gray-900">
                      {metadata.student.id}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isRevoked || isInvalid ? (
                  <>
                    <Button
                      onClick={handleRequestSupport}
                      className="flex items-center gap-2 h-12 px-6"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      <User className="h-5 w-5" />
                      Request Support
                    </Button>
                    <Button
                      onClick={handleShareLink}
                      variant="outline"
                      className="flex items-center gap-2 h-12 px-6 border-2 border-gray-300"
                    >
                      <LinkIcon className="h-5 w-5" />
                      Share Link
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 h-12 px-6"
                      style={{ backgroundColor: '#0d6efd' }}
                    >
                      <Download className="h-5 w-5" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={handleShareLink}
                      variant="outline"
                      className="flex items-center gap-2 h-12 px-6 border-2"
                      style={{ borderColor: '#0d6efd', color: '#0d6efd' }}
                    >
                      <LinkIcon className="h-5 w-5" />
                      Share Link
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - QR Code or Status Image */}
            <div className="flex flex-col items-center">
              {isRevoked || isInvalid ? (
                <div className="bg-gray-100 rounded-xl p-6 w-full max-w-xs">
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm relative">
                    <div className="aspect-square bg-gray-200 rounded flex items-center justify-center mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200"></div>
                      <div className="relative z-10 w-32 h-32 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-20 h-1 bg-white rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-center text-gray-600">
                    {isRevoked ? "Certificate has been revoked" : "Certificate integrity check failed"}
                  </p>
                </div>
              ) : (
                <div className="bg-teal-50 rounded-xl p-6 w-full max-w-xs">
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-2">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-center text-gray-600">
                    Scan to verify or share
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Blockchain Proof Section */}
        <Card className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            View Proof on Blockchain
          </h2>
          
          <div className="space-y-4">
            {/* Smart Contract Address */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Smart Contract Address</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {smartContractAddress ? `${smartContractAddress.slice(0, 6)}...${smartContractAddress.slice(-4)}` : "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {smartContractAddress && (
                  <>
                    <button
                      onClick={() => handleCopy(smartContractAddress, 'contract')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      <Copy className={`h-5 w-5 ${copiedField === 'contract' ? 'text-green-600' : 'text-gray-600'}`} />
                    </button>
                    <button
                      onClick={() => handleViewOnBlockchain('contract')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="h-5 w-5 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Token URI */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Token URI (IPFS)</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {certificate.tokenURI.length > 50 
                    ? `${certificate.tokenURI.slice(0, 30)}...${certificate.tokenURI.slice(-15)}`
                    : certificate.tokenURI}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(certificate.tokenURI, 'tokenURI')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy URI"
                >
                  <Copy className={`h-5 w-5 ${copiedField === 'tokenURI' ? 'text-green-600' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={() => window.open(certificate.tokenURI, '_blank')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="View metadata"
                >
                  <ExternalLink className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Metadata Hash */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">On-chain Metadata Hash</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {certificate.onchainMetadataHash.slice(0, 10)}...{certificate.onchainMetadataHash.slice(-8)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(certificate.onchainMetadataHash, 'hash')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy hash"
                >
                  <Copy className={`h-5 w-5 ${copiedField === 'hash' ? 'text-green-600' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>

            {/* Issuer Address */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Issuer Address</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {certificate.issuer.slice(0, 6)}...{certificate.issuer.slice(-4)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(certificate.issuer, 'issuer')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy address"
                >
                  <Copy className={`h-5 w-5 ${copiedField === 'issuer' ? 'text-green-600' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${certificate.issuer}`, '_blank')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Revocation Warning (only for revoked certificates) */}
        {isRevoked && (
          <Card className="bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <XCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Certificate Revoked
                </h3>
                <p className="text-sm text-amber-800">
                  This certificate has been formally revoked by the issuing institution and is no longer valid for verification purposes. If you believe this is an error, please contact support immediately.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Invalid Warning (only for invalid certificates) */}
        {isInvalid && (
          <Card className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Certificate Invalid
                </h3>
                <p className="text-sm text-red-800">
                  The metadata hash of this certificate does not match the on-chain record. This could indicate tampering or corruption. Please contact support for assistance.
                </p>
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <p className="text-xs font-mono text-red-700">
                    On-chain: {certificate.onchainMetadataHash.slice(0, 20)}...
                  </p>
                  <p className="text-xs font-mono text-red-700">
                    Computed: {certificate.computedMetadataHash.slice(0, 20)}...
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Raw Metadata (collapsible) */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            View Raw Certificate Data
          </summary>
          <Card className="mt-2 bg-gray-900 rounded-xl p-4">
            <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(certificate, null, 2)}
            </pre>
          </Card>
        </details>
      </div>
    </div>
  );
}
