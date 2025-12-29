"use client";

import { useState, useRef, useEffect } from "react";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Upload, Search, ArrowRight, Loader2 } from "lucide-react";
import jsQR from "jsqr";
import toast from "react-hot-toast";
import { checkUserRole } from "@/lib/roles";
import { verifyCertificate, VerifyResult } from "@/lib/verify";

interface HomepageProps {
  onLogin: (name: string, walletAddress?: string) => void;
  onVerificationResult?: (result: VerifyResult) => void;
}

export function Homepage({ onLogin, onVerificationResult }: HomepageProps) {
  const [activeTab, setActiveTab] = useState<'verify' | 'student'>('verify');
  const [certificateId, setCertificateId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  // Privy hooks
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();

  // Handle Privy login
  const handlePrivyLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Failed to login. Please try again.');
    }
  };

  // Auto-redirect when user is authenticated
  useEffect(() => {
    if (ready && authenticated && user && wallets && wallets.length > 0 && !checkingRole) {
      const checkRoleAndRedirect = async () => {
        setCheckingRole(true);
        try {
          // Extract user information
          const userName = user.google?.name || 
                          user.email?.address || 
                          user.discord?.username ||
                          user.phone?.number ||
                          `User ${user.id.slice(0, 8)}`;
          
          // Get wallet address from user's wallet or linked accounts
          const walletAddress = user.wallet?.address || 
                               (user.linkedAccounts?.find((acc) => 
                                 acc.type === 'wallet' && 'address' in acc
                               ) as { address?: string } | undefined)?.address;
          
          // Check user role
          const activeWallet = wallets[0];
          if (!activeWallet) {
            throw new Error("No wallet found");
          }
          const role = await checkUserRole(activeWallet as { getEthereumProvider: () => Promise<unknown> });
          
          // Show success toast
          toast.success('Successfully logged in!', {
            duration: 3000,
            icon: '✅',
          });
          
          // Redirect based on role
          if (role.isIssuer || role.isAdmin) {
            // Admin/Issuer: redirect to admin dashboard
            toast.success('Redirecting to admin dashboard...', {
              duration: 2000,
            });
            router.push('/admin');
          } else {
            // Student: redirect to student dashboard
            onLogin(userName, walletAddress);
          }
        } catch (error) {
          console.error('Error checking role:', error);
          // On error, default to student dashboard
          const userName = user.google?.name || 
                          user.email?.address || 
                          user.discord?.username ||
                          user.phone?.number ||
                          `User ${user.id.slice(0, 8)}`;
          const walletAddress = user.wallet?.address || 
                               (user.linkedAccounts?.find((acc) => 
                                 acc.type === 'wallet' && 'address' in acc
                               ) as { address?: string } | undefined)?.address;
          onLogin(userName, walletAddress);
        } finally {
          setCheckingRole(false);
        }
      };
      
      checkRoleAndRedirect();
    }
  }, [ready, authenticated, user, wallets, onLogin, router, checkingRole]);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast.error("Please enter a Certificate ID (Token ID)");
      return;
    }

    // Validate that it's a valid number (token ID)
    const tokenId = certificateId.trim();
    if (!/^\d+$/.test(tokenId)) {
      toast.error("Certificate ID must be a number (Token ID)");
      return;
    }

    setVerifying(true);
    toast.loading("Verifying certificate on blockchain...", { id: "verify" });
    console.log("🔍 [Verify] Starting verification for tokenId:", tokenId);

    try {
      const result = await verifyCertificate(BigInt(tokenId));
      console.log("📥 [Verify] Result:", result);

      // Show appropriate toast based on result
      switch (result.status) {
        case "VALID":
          toast.success("✅ Certificate is VALID!", { id: "verify", duration: 3000 });
          break;
        case "REVOKED":
          toast.error("⚠️ Certificate has been REVOKED", { id: "verify", duration: 3000 });
          break;
        case "INVALID":
          toast.error("❌ Certificate is INVALID (hash mismatch)", { id: "verify", duration: 3000 });
          break;
        case "NOT_FOUND":
          toast.error("🔍 Certificate not found", { id: "verify", duration: 3000 });
          break;
        case "ERROR":
          toast.error(`❌ Error: ${result.error}`, { id: "verify", duration: 3000 });
          break;
      }

      // Navigate to result page
      if (onVerificationResult) {
        onVerificationResult(result);
      }
    } catch (error) {
      console.error("❌ [Verify] Error:", error);
      toast.error("Failed to verify certificate", { id: "verify" });
    } finally {
      setVerifying(false);
    }
  };



  const handleUploadQRCode = () => {
    // Trigger the hidden file input click
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an image file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }

      // For other images, try to decode QR code
      // Create a FileReader to read the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        if (!imageDataUrl) {
          toast.error('Failed to read the image file.');
          return;
        }

        // Create an image element to load the file
        const img = new Image();
        img.onload = () => {
          try {
            // Create a canvas to extract image data
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              toast.error('Failed to create canvas context.');
              return;
            }

            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0);

            // Get image data from canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Decode QR code using jsQR
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

            if (qrCode) {
              // QR code found - extract the data (should be a token ID or URL with token ID)
              const qrData = qrCode.data;
              console.log('QR Code detected:', qrData);

              // Extract token ID from QR data
              // Could be just a number, or a URL like "https://example.com/verify?tokenId=123"
              let tokenId: string | null = null;
              
              // Try to extract tokenId from URL
              if (qrData.includes('tokenId=')) {
                const match = qrData.match(/tokenId=(\d+)/);
                if (match) tokenId = match[1];
              } else if (/^\d+$/.test(qrData.trim())) {
                // Just a number
                tokenId = qrData.trim();
              }

              if (tokenId) {
                toast.success('QR Code detected! Verifying...', { duration: 2000 });
                setCertificateId(tokenId);
                
                // Verify the certificate
                setTimeout(async () => {
                  setVerifying(true);
                  toast.loading("Verifying certificate on blockchain...", { id: "verify-qr" });
                  
                  try {
                    const result = await verifyCertificate(BigInt(tokenId));
                    console.log("📥 [Verify QR] Result:", result);
                    
                    switch (result.status) {
                      case "VALID":
                        toast.success("✅ Certificate is VALID!", { id: "verify-qr" });
                        break;
                      case "REVOKED":
                        toast.error("⚠️ Certificate has been REVOKED", { id: "verify-qr" });
                        break;
                      default:
                        toast.error(`Certificate status: ${result.status}`, { id: "verify-qr" });
                    }
                    
                    if (onVerificationResult) {
                      onVerificationResult(result);
                    }
                  } catch (error) {
                    console.error("❌ [Verify QR] Error:", error);
                    toast.error("Failed to verify certificate", { id: "verify-qr" });
                  } finally {
                    setVerifying(false);
                  }
                }, 500);
              } else {
                toast.error('Invalid QR code format. Expected a Token ID.');
              }
            } else {
              // No QR code found in the image
              toast.error('No QR code detected in the selected image. Please make sure the image contains a valid QR code and try again.');
            }
          } catch (error) {
            console.error('Error decoding QR code:', error);
            toast.error('An error occurred while processing the QR code. Please try again with a different image.');
          }
        };

        img.onerror = () => {
          toast.error('Failed to load the image. Please try a different file.');
        };

        // Load the image
        img.src = imageDataUrl;
      };

      reader.onerror = () => {
        toast.error('Failed to read the file. Please try again.');
      };

      reader.readAsDataURL(file);
      
      // Reset the input so the same file can be selected again if needed
      event.target.value = '';
    }
  };

  return (
    <main className="flex-1 bg-gray-50 py-16 px-6" suppressHydrationWarning>
      <div className="container mx-auto max-w-4xl" suppressHydrationWarning>
        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Large Shield Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{ backgroundColor: '#0d6efd' }}>
            <Shield className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Digital Certificate Verification
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Blockchain-backed certificate verification system ensuring authenticity and transparency.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'verify'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Search className="w-5 h-5" />
            Verify Certificate
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'student'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
            Management Portal
          </button>
        </div>

        {/* Verification Card */}
        {activeTab === 'verify' && (
          <Card className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Verify a Certificate
            </h2>

            {/* Upload QR Code Option */}
            <div className="mb-8">
              <button 
                type="button"
                className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
                onClick={handleUploadQRCode}
              >
                <Upload className="w-12 h-12" style={{ color: '#0d6efd' }} />
                <span className="font-semibold text-lg" style={{ color: '#0d6efd' }}>
                  Upload QR Code
                </span>
                <span className="text-sm text-gray-600">
                  Select an image file containing a QR code
                </span>
              </button>
            </div>

            {/* Hidden File Input for Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">
                OR ENTER CERTIFICATE DETAILS
              </span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Certificate ID Input */}
            <div className="space-y-4">
              <div>
                <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID (Token ID)
                </label>
                <Input
                  id="certificateId"
                  type="text"
                  placeholder="Enter Token ID (e.g., 1, 2, 3...)"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !verifying && handleVerify()}
                  className="h-12"
                  disabled={verifying}
                />
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerify}
                className="w-full h-12 text-base font-semibold rounded-lg gap-2"
                style={{ backgroundColor: '#0d6efd' }}
                disabled={verifying}
              >
                {verifying ? (
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
          </Card>
        )}

        {/* Student Login Card with Privy */}
        {activeTab === 'student' && (
          <Card className="bg-white rounded-2xl shadow-lg p-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Student Portal Access
            </h2>

            {!ready ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : checkingRole ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Checking permissions...</p>
              </div>
            ) : authenticated ? (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">You&apos;re logged in!</h3>
                <p className="text-sm text-gray-600">
                  {user?.google?.name || user?.email?.address || user?.discord?.username || 'User'}
                </p>
                {user?.wallet?.address && (
                  <p className="text-xs text-gray-500 font-mono">
                    {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                  </p>
                )}
                <Button
                  onClick={logout}
                  variant="outline"
                  className="mt-4"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Privy Login Button */}
                <Button
                  onClick={handlePrivyLogin}
                  className="w-full h-12 text-base font-semibold rounded-lg"
                  style={{ backgroundColor: '#0d6efd' }}
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Login with Privy
                </Button>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                  <h4 className="font-semibold mb-2">Login Options:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>✉️ Email (passwordless)</li>
                    <li>📱 SMS</li>
                    <li>🔵 Google account</li>
                    <li>💬 Discord account</li>
                    <li>🦊 External wallet (MetaMask, etc.)</li>
                  </ul>
                  <p className="mt-3 text-xs text-gray-500">
                    A secure embedded wallet will be created for you automatically.
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}
