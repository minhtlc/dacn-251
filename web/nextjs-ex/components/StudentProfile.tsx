"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface StudentProfileProps {
  userName: string;
  userEmail: string;
  totalCertificates: number;
  validCertificates: number;
  onLogout: () => void;
}

export function StudentProfile({
  userName,
  userEmail,
  totalCertificates,
  validCertificates,
  onLogout
}: StudentProfileProps) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">Profile</h1>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
              <p className="text-gray-500">{userEmail}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Member since:</span> January 2024</p>
              <p><span className="text-gray-500">Total Certificates:</span> {totalCertificates}</p>
              <p><span className="text-gray-500">Valid Certificates:</span> {validCertificates}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <Button variant="outline" onClick={onLogout} className="w-full">
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

