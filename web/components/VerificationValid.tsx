"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VerifyResult } from "@/lib/verify";
import { 
  CheckCircle, 
  Download, 
  Share2, 
  Printer, 
  Mail, 
  Eye,
  Building2,
  ChevronRight,
  ExternalLink,
  Copy
} from "lucide-react";
import toast from "react-hot-toast";

interface VerificationValidProps {
  result: VerifyResult;
  onBack: () => void;
}

export function VerificationValid({ result, onBack }: VerificationValidProps) {
  const [activeTab, setActiveTab] = useState<'certificate' | 'details'>('certificate');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const metadata = result.metadata;
  const recipientName = metadata?.student?.name || "Unknown";
  const certificateName = metadata?.name || `Certificate #${result.tokenId}`;
  const issuedBy = metadata?.issuedBy || "Unknown Issuer";
  const issuedDate = metadata?.issuedDate || new Date(result.issuedAt * 1000).toLocaleDateString();
  const specialization = metadata?.specialization || "";
  const certificateType = metadata?.type || "";

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Certificate Verification - ${certificateName}`);
    const body = encodeURIComponent(`Certificate Details:\n\nName: ${recipientName}\nCertificate: ${certificateName}\nIssued By: ${issuedBy}\nToken ID: ${result.tokenId}\nStatus: VALID`);
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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify?tokenId=${result.tokenId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!', { duration: 2000 });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Green Status Banner */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Status Box */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="inline-flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-green-700">
                  Certificate issued by
                </span>
                <span className="font-semibold text-green-800">
                  {issuedBy.toUpperCase()}
                </span>
              </div>
              <ChevronRight className={`h-5 w-5 text-green-600 transition-transform ${isDetailsExpanded ? 'rotate-90' : ''}`} />
            </button>

            {isDetailsExpanded && (
              <div className="flex items-start gap-4 px-6 py-3 bg-white border-l-2 border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3">Verification Details</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Certificate hash matches on-chain record</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Certificate has not been revoked</span>
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

      {/* Main Content */}
      <div className="bg-gray-50 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {activeTab === 'certificate' && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Certificate Display */}
              <div className="md:col-span-2">
                <div 
                  className="rounded-lg p-8 border-2 border-white shadow-lg"
                  style={{ 
                    background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)',
                    minHeight: '600px'
                  }}
                >
                  {/* Institution Header */}
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-2">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-blue-900 mb-1">
                      {issuedBy.toUpperCase()}
                    </h2>
                    {specialization && (
                      <p className="text-gray-600 text-sm font-sans">
                        {specialization}
                      </p>
                    )}
                  </div>

                  {/* Certificate Text */}
                  <div className="text-center space-y-4 mb-12">
                    <p className="text-gray-500 italic font-serif text-lg">
                      This is to certify that
                    </p>
                    <h3 className="text-4xl font-serif font-bold text-blue-900">
                      {recipientName}
                    </h3>
                    <p className="text-gray-500 italic font-serif text-lg">
                      having fulfilled the requirements of the institution was conferred the
                    </p>
                    <h4 className="text-3xl font-serif font-bold text-blue-600">
                      {certificateName}
                    </h4>
                    {certificateType && (
                      <p className="text-gray-600 text-sm">
                        Type: {certificateType}
                      </p>
                    )}
                    <p className="text-gray-500 italic font-serif text-lg">
                      with all the rights, honors, and privileges appertaining thereunto.
                    </p>
                  </div>

                  {/* Date and Token ID */}
                  <div className="flex justify-between items-end mt-16">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Token ID</p>
                      <p className="font-mono font-semibold">#{result.tokenId}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{issuedDate}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-green-600">VALID</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" className="flex-1 border-2 border-gray-300" onClick={handleDownload}>
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="flex-1 border-2 border-blue-600 text-blue-600" onClick={handleShare}>
                    <Share2 className="h-5 w-5 mr-2" />
                    Share Link
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-teal-50 rounded-xl p-6 w-full max-w-xs">
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-2">
                      <div className="text-center p-4">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">Token #{result.tokenId}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-center text-gray-600">Verified on Blockchain</p>
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

              {/* Hash Match */}
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">Hash verification passed - metadata integrity confirmed</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
