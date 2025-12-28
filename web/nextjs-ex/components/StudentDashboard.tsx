"use client";

import { useState } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CertificateDetails } from "@/components/CertificateDetails";
import { Sidebar } from "@/components/Sidebar";
import { StudentProfile } from "@/components/StudentProfile";
import { StudentSettings } from "@/components/StudentSettings";
import { 
  Search,
  ArrowUpDown,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Certificate {
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
}

interface StudentDashboardProps {
  userName: string;
  onLogout: () => void;
  onViewCertificate?: (certificate: Certificate) => void;
}

export function StudentDashboard({ userName, onLogout, onViewCertificate }: StudentDashboardProps) {
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  
  // Privy logout function
  const { logout: privyLogout } = usePrivy();
  
  // Handle logout - calls both Privy logout and parent logout handler
  const handleLogout = async () => {
    try {
      // Logout from Privy
      await privyLogout();
      // Call parent logout handler to update app state
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still call parent logout even if Privy logout fails
      onLogout();
    }
  };
  
  // Mock data for certificates
  const certificates: Certificate[] = [
    {
      id: 1,
      title: "B.Sc. in Computer Science",
      institution: "State University",
      issuedDate: "June 2023",
      status: "valid",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=200&fit=crop",
      recipient: userName,
      certificateId: "C-BSC-2023-06-1234"
    },
    {
      id: 2,
      title: "Certified Blockchain Professional",
      institution: "Tech Institute",
      issuedDate: "May 2022",
      status: "revoked",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop",
      recipient: userName,
      certificateId: "C-CBP-2022-05-5678"
    },
    {
      id: 3,
      title: "Advanced UI/UX Design",
      institution: "Design Academy",
      issuedDate: "January 2024",
      status: "valid",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=200&fit=crop",
      recipient: userName,
      certificateId: "C-AUX-2024-01-9012"
    }
  ];

  const userEmail = `${userName.toLowerCase().replace(/\s+/g, '.')}`;

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
                  Welcome back, {userName}! Here are all your verified credentials.
                </p>
              </header>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search Bar */}
                <div className="grow">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search certificates by title or issuer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 pl-12 border-gray-300"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 items-center flex-wrap">
                  <Button
                    variant="outline"
                    className="h-12 px-4 gap-2"
                    onClick={() => alert('Sort functionality would be implemented here')}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Sort by Date</span>
                    <span className="sm:hidden">Sort</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 px-4 gap-2"
                    onClick={() => alert('Filter functionality would be implemented here')}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </div>
              </div>

              {/* Certificate Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <Card
                    key={cert.id}
                    className="overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-gray-200"
                  >
                    {/* Certificate Image */}
                    <div
                      className="w-full aspect-2/1 bg-cover bg-center"
                      style={{ backgroundImage: `url(${cert.image})` }}
                    />

                    {/* Card Content */}
                    <div className="p-5 flex flex-col grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight flex-1">
                          {cert.title}
                        </h3>
                        
                        {/* Status Badge */}
                        {cert.status === 'valid' ? (
                          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ml-2">
                            <CheckCircle className="h-3 w-3" />
                            <span>VALID</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ml-2">
                            <XCircle className="h-3 w-3" />
                            <span>REVOKED</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mb-1">{cert.institution}</p>
                      <p className="text-sm text-gray-400">Issued: {cert.issuedDate}</p>

                      {/* View Details Button */}
                      <div className="mt-auto pt-4">
                        <Button
                          variant="ghost"
                          className="w-full h-10 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold"
                          onClick={() => {
                            if (onViewCertificate) {
                              onViewCertificate(cert);
                            } else {
                              setSelectedCertificate(cert);
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {activeNavItem === 'profile' && (
            <StudentProfile
              userName={userName}
              userEmail={userEmail}
              totalCertificates={certificates.length}
              validCertificates={certificates.filter(c => c.status === 'valid').length}
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

