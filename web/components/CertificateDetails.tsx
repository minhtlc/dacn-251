"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

interface CertificateDetailsProps {
  certificate: {
    id: number;
    title: string;
    institution: string;
    issuedDate: string;
    status: string;
    image?: string;
    recipient?: string;
    certificateId?: string;
    smartContractAddress?: string;
    transactionHash?: string;
  };
  userName: string;
  onBack: () => void;
}

export function CertificateDetails({ certificate, userName, onBack }: CertificateDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Generate certificate ID if not provided (using useMemo to avoid impure function in render)
  const certificateId = useMemo(() => {
    if (certificate.certificateId) return certificate.certificateId;
    const year = new Date(certificate.issuedDate).getFullYear();
    // Use a deterministic ID based on certificate ID and year
    const randomPart = String(certificate.id).padStart(4, '0');
    return `C-${certificate.id}-${year}-${randomPart}`;
  }, [certificate.certificateId, certificate.id, certificate.issuedDate]);
  
  // Generate blockchain addresses if not provided (mock data)
  const smartContractAddress = certificate.smartContractAddress || '0xAbC1234567890Def1234567890AbC1234567890cdef';
  const transactionHash = certificate.transactionHash || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef5678';
  
  // Get recipient name
  const recipient = certificate.recipient || userName;

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
    const shareUrl = `${window.location.origin}/verify?certificate=${certificateId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!', { duration: 2000 });
    // TODO: Implement share functionality (Web Share API if available)
  };

  const handleRequestSupport = () => {
    toast.success('Support request submitted!', { duration: 2000 });
    // TODO: Implement support request functionality
  };

  const isRevoked = certificate.status === 'revoked';

  const handleViewOnBlockchain = (type: 'contract' | 'transaction') => {
    const url = type === 'contract' 
      ? `https://polygonscan.com/address/${smartContractAddress}`
      : `https://polygonscan.com/tx/${transactionHash}`;
    window.open(url, '_blank');
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
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {certificate.title}
                </h1>
                <p className="text-lg text-gray-600">
                  Issued by {certificate.institution}
                </p>
              </div>

              {/* Status Badge */}
              {certificate.status === 'valid' ? (
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Verified</span>
                </div>
              ) : certificate.status === 'revoked' ? (
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 rounded-full px-4 py-2">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">REVOKED</span>
                </div>
              ) : null}

              {/* Recipient Information */}
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recipient</p>
                  <p className="text-base font-semibold text-gray-900">{recipient}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Certificate ID</p>
                  <p className="text-sm font-semibold text-gray-900 font-mono">
                    {certificateId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(certificate.issuedDate)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isRevoked ? (
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
                      onClick={handleDownloadPDF}
                      variant="outline"
                      className="flex items-center gap-2 h-12 px-6 border-2 border-gray-300"
                    >
                      <Download className="h-5 w-5" />
                      Download PDF
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

            {/* Right Column - QR Code or Revocation Image */}
            <div className="flex flex-col items-center">
              {isRevoked ? (
                <div className="bg-gray-100 rounded-xl p-6 w-full max-w-xs">
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm relative">
                    {/* Revoked Certificate Image Placeholder */}
                    <div className="aspect-square bg-gray-200 rounded flex items-center justify-center mb-2 relative overflow-hidden">
                      {/* Certificate background */}
                      <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200"></div>
                      {/* Red circle with diagonal line (no symbol) */}
                      <div className="relative z-10 w-32 h-32 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-20 h-1 bg-white rotate-45"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-2"></div>
                    </div>
                  </div>
                  <p className="text-sm text-center text-gray-600">
                    Scan to view revocation details
                  </p>
                </div>
              ) : (
                <div className="bg-teal-50 rounded-xl p-6 w-full max-w-xs">
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    {/* QR Code Placeholder - In production, use a QR code library */}
                    <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-2">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2"></div>
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
        <Card className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            View Proof on Blockchain
          </h2>
          
          <div className="space-y-4">
            {/* Smart Contract Address */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Smart Contract Address</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {smartContractAddress.slice(0, 6)}...{smartContractAddress.slice(-4)}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                  title="View on PolygonScan"
                >
                  <ExternalLink className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Transaction Hash</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(transactionHash, 'transaction')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy hash"
                >
                  <Copy className={`h-5 w-5 ${copiedField === 'transaction' ? 'text-green-600' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={() => handleViewOnBlockchain('transaction')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="View on PolygonScan"
                >
                  <ExternalLink className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Revocation Warning (only for revoked certificates) */}
        {isRevoked && (
          <Card className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg p-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Certificate Revoked
                </h3>
                <p className="text-sm text-red-800">
                  This certificate has been formally revoked by the issuing institution and is no longer valid for verification purposes. If you believe this is an error, please contact support immediately.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

