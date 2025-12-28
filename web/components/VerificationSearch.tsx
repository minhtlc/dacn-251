"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface VerificationSearchProps {
  onVerify: (data: { name: string; serial: string; date: string }, status: 'valid' | 'revoked') => void;
}

export function VerificationSearch({ onVerify }: VerificationSearchProps) {
  const [serial, setSerial] = useState("");

  const handleVerifyWithSerial = (certSerial: string) => {
    if (certSerial.trim()) {
      // Simulate verification - in real app this would call an API
      const isValid = Math.random() > 0.3; // 70% chance of valid
      const mockData = {
        name: "John Doe",
        serial: certSerial,
        date: "June 15, 2024"
      };
      onVerify(mockData, isValid ? 'valid' : 'revoked');
    }
  };

  // Check for certificate ID in URL params (from QR code upload)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const certificateId = params.get('certificate');
      const status = params.get('status'); // 'valid' or 'revoked' for test files
      
      if (certificateId) {
        setSerial(certificateId);
        
        // If status is provided (from test files), skip verification and go directly to result
        if (status === 'valid' || status === 'revoked') {
          const mockData = {
            name: "John Doe",
            serial: certificateId,
            date: "June 15, 2024"
          };
          // Navigate directly to the appropriate page
          setTimeout(() => {
            onVerify(mockData, status);
          }, 300);
        } else {
          // Auto-verify after a short delay for regular QR codes
          setTimeout(() => {
            handleVerifyWithSerial(certificateId);
          }, 300);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = () => {
    handleVerifyWithSerial(serial);
  };

  return (
    <main className="flex-1 py-16 px-6">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#0D1B2A' }}>
            Verify Certificate
          </h1>
          <p className="text-muted-foreground">
            Enter the certificate serial number to verify its authenticity
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Verification</CardTitle>
            <CardDescription>
              Please enter the serial number found on your certificate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="serial" className="text-sm font-medium">
                Certificate Serial Number
              </label>
              <Input
                id="serial"
                placeholder="e.g., CERT-2024-12345"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>
            <Button onClick={handleVerify} className="w-full" size="lg">
              <Search className="mr-2 h-4 w-4" />
              Verify Certificate
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2" style={{ color: '#0D1B2A' }}>
            Where to find your serial number?
          </h3>
          <p className="text-sm text-muted-foreground">
            The certificate serial number is typically located at the bottom of your certificate document or in the verification section. It usually starts with &quot;CERT-&quot; followed by a year and unique identifier.
          </p>
        </div>
      </div>
    </main>
  );
}

