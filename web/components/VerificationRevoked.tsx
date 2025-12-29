"use client";

import { useState } from "react";
import { VerifyResult } from "@/lib/verify";
import { 
  XCircle, 
  AlertTriangle, 
  Download, 
  Printer, 
  Mail, 
  Eye,
  ExternalLink,
  Building2,
  ChevronRight,
  CheckCircle,
  Copy
} from "lucide-react";
import toast from "react-hot-toast";

interface VerificationRevokedProps {
  result: VerifyResult;
  onBack: () => void;
}

export function VerificationRevoked({ result, onBack }: VerificationRevokedProps) {
  const [activeTab, setActiveTab] = useState<'certificate' | 'details'>('certificate');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const metadata = result.metadata;
  const recipientName = metadata?.student?.name || "Unknown";
  const certificateName = metadata?.name || `Certificate #${result.tokenId}`;
  const issuedBy = metadata?.issuedBy || "Unknown Issuer";
  const issuedDate = metadata?.issuedDate || new Date(result.issuedAt * 1000).toLocaleDateString();
  const specialization = metadata?.specialization || "";

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Certificate Revocation Notice - ${certificateName}`);
    const body = encodeURIComponent(`Certificate Details:\n\nName: ${recipientName}\nCertificate: ${certificateName}\nIssued By: ${issuedBy}\nToken ID: ${result.tokenId}\nStatus: REVOKED`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDownload = () => {
    toast.success('Download functionality coming soon!', { duration: 2000 });
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!', { duration: 2000 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRequestSupport = () => {
    window.open('mailto:support@certifychain.com?subject=Certificate Revocation Support Request', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Red Status Banner */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Status Box */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="inline-flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center shrink-0">
                <XCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-700">Certificate REVOKED</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">Issued by {issuedBy}</span>
              </div>
              <ChevronRight className={`h-5 w-5 text-amber-600 transition-transform ${isDetailsExpanded ? 'rotate-90' : ''}`} />
            </button>

            {isDetailsExpanded && (
              <div className="flex items-start gap-4 px-6 py-3 bg-white border-l-2 border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3">Details</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-gray-700">Certificate has been revoked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Certificate hash matches on-chain record</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">
              <Printer className="h-4 w-4" />
              <span className="text-sm font-medium">Print</span>
            </button>
            <button onClick={handleEmail} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">Email</span>
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Verify Another</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('certificate')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'certificate' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500'
              }`}
            >
              CERTIFICATE
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'details' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500'
              }`}
            >
              BLOCKCHAIN DETAILS
            </button>
          </div>
        </div>
      </div>

      {/* Revocation Notice */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-700 mb-1">Certificate Revocation Notice</h3>
            <p className="text-sm text-gray-700">
              This certificate was revoked by the issuing institution and is no longer valid for verification purposes.
            </p>
            <button
              onClick={handleRequestSupport}
              className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Request Support
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {activeTab === 'certificate' && (
            <div 
              className="rounded-lg shadow-lg overflow-hidden relative"
              style={{ 
                background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)',
                minHeight: '700px'
              }}
            >
              <div className="p-8 relative">
                {/* Institution Header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-2">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-blue-900 mb-1 tracking-wider">
                    {issuedBy.toUpperCase()}
                  </h2>
                  {specialization && (
                    <p className="text-gray-600 text-sm tracking-widest">{specialization}</p>
                  )}
                </div>

                {/* Certificate Text */}
                <div className="text-center space-y-4 mb-12">
                  <p className="text-gray-500 italic font-serif text-lg">This is to certify that</p>
                  <h3 className="text-4xl font-serif font-bold text-blue-900">{recipientName}</h3>
                  <p className="text-gray-500 italic font-serif text-lg">
                    having fulfilled the requirements of the institution was conferred the
                  </p>
                  <h4 className="text-3xl font-serif font-bold text-blue-600">{certificateName}</h4>
                  <p className="text-gray-500 italic font-serif text-lg">
                    with all the rights, honors, and privileges appertaining thereunto.
                  </p>
                </div>

                {/* REVOKED Stamp */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className="border-8 border-amber-600 px-16 py-6 transform -rotate-12"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                  >
                    <span className="text-amber-600 font-bold tracking-widest" style={{ fontSize: '5rem' }}>
                      REVOKED
                    </span>
                  </div>
                </div>

                {/* Date and Info */}
                <div className="flex justify-between items-end mt-16">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Token ID</p>
                    <p className="font-mono font-semibold">#{result.tokenId}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-2">
                      <XCircle className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">{issuedDate}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-amber-600">REVOKED</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Blockchain Verification Details</h2>
              
              {/* Token ID */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Token ID</p>
                  <p className="font-mono font-semibold">#{result.tokenId}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <XCircle className="h-5 w-5 text-amber-600" />
                <span className="text-amber-700 font-medium">Certificate has been revoked on-chain</span>
              </div>

              {/* Issuer Address */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Issuer Address</p>
                  <p className="font-mono text-sm">{result.issuer.slice(0, 10)}...{result.issuer.slice(-8)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(result.issuer, 'issuer')} className="p-2 hover:bg-gray-200 rounded">
                    <Copy className={`h-4 w-4 ${copiedField === 'issuer' ? 'text-green-600' : 'text-gray-600'}`} />
                  </button>
                  <button onClick={() => window.open(`https://sepolia.etherscan.io/address/${result.issuer}`, '_blank')} className="p-2 hover:bg-gray-200 rounded">
                    <ExternalLink className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Token URI */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Token URI (IPFS)</p>
                  <p className="font-mono text-sm truncate">{result.tokenURI}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(result.tokenURI, 'uri')} className="p-2 hover:bg-gray-200 rounded">
                    <Copy className={`h-4 w-4 ${copiedField === 'uri' ? 'text-green-600' : 'text-gray-600'}`} />
                  </button>
                  <button onClick={() => window.open(result.tokenURI, '_blank')} className="p-2 hover:bg-gray-200 rounded">
                    <ExternalLink className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Metadata Hash */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">On-chain Metadata Hash</p>
                  <p className="font-mono text-sm">{result.onchainMetadataHash.slice(0, 20)}...{result.onchainMetadataHash.slice(-10)}</p>
                </div>
                <button onClick={() => handleCopy(result.onchainMetadataHash, 'hash')} className="p-2 hover:bg-gray-200 rounded">
                  <Copy className={`h-4 w-4 ${copiedField === 'hash' ? 'text-green-600' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
