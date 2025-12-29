"use client";

import { useState, useEffect, useMemo } from "react";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import type { Address } from "viem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CertificateDetails } from "@/components/CertificateDetails";
import { Sidebar } from "@/components/Sidebar";
import { StudentProfile } from "@/components/StudentProfile";
import { StudentSettings } from "@/components/StudentSettings";
import { getMyCertificates, CertificateListItem } from "@/lib/certificatesByLogs";
import toast from "react-hot-toast";
import { 
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Award
} from "lucide-react";

type FilterType = "ALL" | "VALID" | "REVOKED" | "INVALID";

interface StudentDashboardProps {
  userName: string;
  onLogout: () => void;
}

export function StudentDashboard({ userName, onLogout }: StudentDashboardProps) {
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateListItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterType>("ALL");
  
  // Certificate loading state
  const [certificates, setCertificates] = useState<CertificateListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Privy hooks
  const { logout: privyLogout, user } = usePrivy();
  const { wallets } = useWallets();
  
  // Get wallet address
  const walletAddress = (user?.wallet?.address as Address | undefined) ?? 
    (wallets?.[0]?.address as Address | undefined);

  // Load certificates from blockchain
  async function loadCertificates() {
    if (!walletAddress) {
      setError("No wallet address found. Please reconnect your wallet.");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("🔄 [StudentDashboard] Loading certificates for:", walletAddress);
    toast.loading("Loading your certificates from blockchain...", { id: "load-certs" });

    try {
      const list = await getMyCertificates(walletAddress, 50);
      setCertificates(list);
      setHasLoaded(true);
      
      console.log("✅ [StudentDashboard] Loaded certificates:", list);
      toast.success(`Found ${list.length} certificate(s)`, { id: "load-certs" });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
      console.error("❌ [StudentDashboard] Error loading certificates:", e);
      toast.error(`Failed to load certificates: ${errorMessage}`, { id: "load-certs" });
    } finally {
      setLoading(false);
    }
  }

  // Auto-load certificates on mount
  useEffect(() => {
    if (walletAddress && !hasLoaded) {
      loadCertificates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, hasLoaded]);

  // Filter certificates based on search and status
  const filteredCertificates = useMemo(() => {
    let filtered = certificates;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((cert) => cert.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((cert) => 
        cert.metadata?.name?.toLowerCase().includes(query) ||
        cert.metadata?.issuedBy?.toLowerCase().includes(query) ||
        cert.metadata?.specialization?.toLowerCase().includes(query) ||
        cert.tokenId.includes(query)
      );
    }

    return filtered;
  }, [certificates, filterStatus, searchQuery]);

  // Handle logout - calls both Privy logout and parent logout handler
  const handleLogout = async () => {
    try {
      await privyLogout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

  const userEmail = `${userName.toLowerCase().replace(/\s+/g, '.')}`;

  // Get status badge color
  const getStatusBadge = (status: CertificateListItem["status"]) => {
    switch (status) {
      case "VALID":
        return (
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ml-2">
            <CheckCircle className="h-3 w-3" />
            <span>VALID</span>
          </div>
        );
      case "REVOKED":
        return (
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ml-2">
            <XCircle className="h-3 w-3" />
            <span>REVOKED</span>
          </div>
        );
      case "INVALID":
        return (
          <div className="flex items-center gap-1.5 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ml-2">
            <AlertTriangle className="h-3 w-3" />
            <span>INVALID</span>
          </div>
        );
    }
  };

  // If a certificate is selected, show details view
  if (selectedCertificate) {
    return (
      <CertificateDetails
        certificate={selectedCertificate}
        userName={userName}
        onBack={() => setSelectedCertificate(null)}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        activeNavItem={activeNavItem}
        isMobileMenuOpen={isMobileMenuOpen}
        onNavItemChange={setActiveNavItem}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-16 sm:p-6 lg:p-10 lg:pt-10 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {activeNavItem === 'dashboard' && (
            <>
              {/* Page Header */}
              <header className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                  Your Certificates
                </h1>
                <p className="text-gray-500 text-sm sm:text-base">
                  Welcome back, {userName}! Here are all your verified credentials on the blockchain.
                </p>
                {walletAddress && (
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                )}
              </header>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search Bar */}
                <div className="grow">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search certificates by name, issuer, or token ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 pl-12 border-gray-300"
                    />
                  </div>
                </div>

                {/* Filter and Refresh Buttons */}
                <div className="flex gap-2 items-center flex-wrap">
                  {/* Status Filter Buttons */}
                  {(["ALL", "VALID", "REVOKED", "INVALID"] as FilterType[]).map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="h-10"
                    >
                      {status}
                    </Button>
                  ))}
                  
                  {/* Refresh Button */}
                  <Button
                    variant="outline"
                    className="h-10 px-4 gap-2"
                    onClick={loadCertificates}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <p className="text-sm">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadCertificates}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {loading && certificates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-500">Loading your certificates from blockchain...</p>
                </div>
              )}

              {/* Certificate Cards Grid */}
              {!loading && filteredCertificates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCertificates.map((cert) => (
                    <Card
                      key={cert.tokenId}
                      className="overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-gray-200"
                    >
                      {/* Certificate Header with gradient */}
                      <div className="w-full h-32 bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Award className="h-16 w-16 text-white/80" />
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight flex-1">
                            {cert.metadata?.name || `Certificate #${cert.tokenId}`}
                          </h3>
                          {getStatusBadge(cert.status)}
                        </div>

                        <p className="text-sm text-gray-500 mb-1">
                          {cert.metadata?.issuedBy || "Unknown Issuer"}
                        </p>
                        <p className="text-sm text-gray-400">
                          Issued: {cert.metadata?.issuedDate || new Date(cert.issuedAt * 1000).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Token ID: #{cert.tokenId}
                        </p>

                        {cert.metadata?.specialization && (
                          <p className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded inline-block w-fit">
                            {cert.metadata.specialization}
                          </p>
                        )}

                        {/* View Details Button */}
                        <div className="mt-auto pt-4">
                          <Button
                            variant="ghost"
                            className="w-full h-10 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold"
                            onClick={() => setSelectedCertificate(cert)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && hasLoaded && certificates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Award className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Certificates Found
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    You don&apos;t have any certificates minted to your wallet address yet. 
                    Certificates will appear here once they are issued to you on the blockchain.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={loadCertificates}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              )}

              {/* No results for filter/search */}
              {!loading && hasLoaded && certificates.length > 0 && filteredCertificates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No matching certificates
                  </h3>
                  <p className="text-gray-500">
                    No certificates match your current filter or search criteria.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setFilterStatus("ALL");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}

          {activeNavItem === 'profile' && (
            <StudentProfile
              userName={userName}
              userEmail={userEmail}
              totalCertificates={certificates.length}
              validCertificates={certificates.filter(c => c.status === 'VALID').length}
              onLogout={handleLogout}
            />
          )}

          {activeNavItem === 'settings' && (
            <StudentSettings />
          )}
        </div>
      </main>
    </div>
  );
}
