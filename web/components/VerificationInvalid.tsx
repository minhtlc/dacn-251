"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VerifyResult } from "@/lib/verify";
import { 
  AlertTriangle, 
  XCircle, 
  Eye,
  ExternalLink,
  Search,
  Copy,
  HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface VerificationInvalidProps {
  result: VerifyResult;
  onBack: () => void;
}

export function VerificationInvalid({ result, onBack }: VerificationInvalidProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!', { duration: 2000 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusInfo = () => {
    switch (result.status) {
      case 'NOT_FOUND':
        return {
          icon: <Search className="h-8 w-8 text-gray-600" />,
          title: 'Certificate Not Found',
          description: 'No certificate exists with this Token ID on the blockchain.',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
        };
      case 'INVALID':
        return {
          icon: <XCircle className="h-8 w-8 text-red-600" />,
          title: 'Certificate Invalid',
          description: 'The certificate metadata has been tampered with or corrupted. The computed hash does not match the on-chain record.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-700',
        };
      case 'ERROR':
      default:
        return {
          icon: <AlertTriangle className="h-8 w-8 text-amber-600" />,
          title: 'Verification Error',
          description: result.error || 'An unexpected error occurred during verification.',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-700',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Status Card */}
        <div className={`${statusInfo.bgColor} border-2 ${statusInfo.borderColor} rounded-2xl p-8 text-center`}>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              {statusInfo.icon}
            </div>
          </div>

          <h1 className={`text-3xl font-bold ${statusInfo.textColor} mb-4`}>
            {statusInfo.title}
          </h1>

          <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
            {statusInfo.description}
          </p>

          {/* Token ID searched */}
          <div className="bg-white rounded-lg p-4 mb-8 inline-block">
            <p className="text-sm text-gray-500 mb-1">Token ID Searched</p>
            <p className="font-mono text-xl font-bold text-gray-900">#{result.tokenId}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onBack}
              className="gap-2"
              style={{ backgroundColor: '#0d6efd' }}
            >
              <Eye className="h-5 w-5" />
              Try Another Certificate
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('mailto:support@certifychain.com?subject=Certificate Verification Issue', '_blank')}
              className="gap-2"
            >
              <HelpCircle className="h-5 w-5" />
              Contact Support
            </Button>
          </div>
        </div>

        {/* Technical Details (for INVALID status) */}
        {result.status === 'INVALID' && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Hash Mismatch Details
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">On-chain Metadata Hash</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-red-700">{result.onchainMetadataHash}</p>
                  <button onClick={() => handleCopy(result.onchainMetadataHash, 'onchain')} className="p-1 hover:bg-red-100 rounded">
                    <Copy className={`h-4 w-4 ${copiedField === 'onchain' ? 'text-green-600' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Computed Metadata Hash</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-red-700">{result.computedMetadataHash}</p>
                  <button onClick={() => handleCopy(result.computedMetadataHash, 'computed')} className="p-1 hover:bg-red-100 rounded">
                    <Copy className={`h-4 w-4 ${copiedField === 'computed' ? 'text-green-600' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>

              {result.tokenURI && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Token URI</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm text-gray-700 truncate flex-1">{result.tokenURI}</p>
                    <div className="flex gap-2 ml-2">
                      <button onClick={() => handleCopy(result.tokenURI, 'uri')} className="p-1 hover:bg-gray-200 rounded">
                        <Copy className={`h-4 w-4 ${copiedField === 'uri' ? 'text-green-600' : 'text-gray-600'}`} />
                      </button>
                      <button onClick={() => window.open(result.tokenURI, '_blank')} className="p-1 hover:bg-gray-200 rounded">
                        <ExternalLink className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              This indicates that the metadata stored at the Token URI does not match what was originally recorded on the blockchain. 
              This could be due to tampering or data corruption.
            </p>
          </div>
        )}

        {/* Error Details */}
        {result.status === 'ERROR' && result.error && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Error Details</h2>
            <pre className="bg-gray-900 text-red-400 p-4 rounded-lg text-sm overflow-x-auto">
              {result.error}
            </pre>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Make sure you entered the correct Token ID (a number like 1, 2, 3, etc.)</li>
            <li>• Token IDs are assigned when certificates are minted on the blockchain</li>
            <li>• If you believe this is an error, please contact the issuing institution</li>
            <li>• For technical support, email support@certifychain.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

