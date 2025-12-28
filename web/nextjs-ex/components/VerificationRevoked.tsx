"use client";

import { useState } from "react";
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
  CheckCircle
} from "lucide-react";

interface VerificationRevokedProps {
  data: {
    name: string;
    serial: string;
    date: string;
  };
  onBack: () => void;
}

export function VerificationRevoked({ data, onBack }: VerificationRevokedProps) {
  const [activeTab, setActiveTab] = useState<'certificate' | 'transcript'>('certificate');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const revocationInfo = {
    revokedDate: 'June 15, 2025',
    reason: 'Administrative Error - Reissued with corrected ID.'
  };

  // Mock transcript data
  const transcriptData = {
    documentId: '53B75BBE',
    dateOfIssuance: 'MAY 2025',
    dateOfAdmission: 'AUG 2020',
    dateOfGraduation: 'AUG 2025',
    nricFin: 'SXXXXXXXY',
    studentId: '123456',
    course: 'CertifyChain Demo',
    courses: [
      { code: 'CS 1110', name: 'Introduction to Programming', grade: 'A+', units: 3, semester: 1 },
      { code: 'CS 2110', name: 'Object Oriented Programming in Java', grade: 'A+', units: 4, semester: 2 },
      { code: 'ECON 3030', name: 'Microeconomics', grade: 'A+', units: 4, semester: 3 },
      { code: 'ECON 3040', name: 'Macroeconomics', grade: 'A', units: 4, semester: 4 },
      { code: 'ECON 3120', name: 'Econometrics', grade: 'A-', units: 4, semester: 5 },
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    alert('Email functionality would be implemented here');
  };

  const handleDownload = () => {
    alert('Download functionality would be implemented here');
  };

  const handleRequestSupport = () => {
    window.open('mailto:support@certifychain.com?subject=Certificate Revocation Support Request', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Red Status Banner - Card Style */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Red Status Box with Expandable Details */}
          <div className="flex items-center gap-4">
            {/* Main Status Box */}
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="inline-flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                <XCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-700">
                  Certificate REVOKED
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">
                  Issued by CertifyChain
                </span>
              </div>
              <ChevronRight className={`h-5 w-5 text-red-600 transition-transform ${isDetailsExpanded ? 'rotate-90' : ''}`} />
            </button>

            {/* Expandable Details Panel */}
            {isDetailsExpanded && (
              <div className="flex items-start gap-4 px-6 py-3 bg-white border-l-2 border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3">Details</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-gray-700">Certificate has been revoked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Certificate has not been tampered with</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Printer className="h-4 w-4" />
              <span className="text-sm font-medium">Print</span>
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">Email</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">View another</span>
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
                activeTab === 'certificate'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              CERTIFICATE
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'transcript'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              TRANSCRIPT
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Revocation Notice */}
      <div className="bg-red-50 border-b border-red-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-700 mb-1">
              Certificate Revocation Notice
            </h3>
            <p className="text-sm text-gray-700">
              This certificate was revoked on <strong>{revocationInfo.revokedDate}</strong> by the issuing institution. 
              Reason: <em>{revocationInfo.reason}</em>
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
          
          {/* Certificate Tab Content */}
          {activeTab === 'certificate' && (
            <div 
              className="rounded-lg shadow-lg overflow-hidden relative"
              style={{ 
                background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)',
                minHeight: '700px'
              }}
            >
              {/* Certificate Content */}
              <div className="p-8 relative">
                {/* Institution Header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-2">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-blue-900 mb-1 tracking-wider">
                    CERTIFYCHAIN DEMO
                  </h2>
                  <p className="text-gray-600 text-sm tracking-widest">
                    SCHOOL OF TECHNOLOGY
                  </p>
                </div>

                {/* Certificate Text */}
                <div className="text-center space-y-4 mb-12">
                  <p className="text-gray-500 italic font-serif text-lg">
                    This is to certify that
                  </p>
                  <h3 className="text-4xl font-serif font-bold text-blue-900">
                    {data.name || "Your Name"}
                  </h3>
                  <p className="text-gray-500 italic font-serif text-lg">
                    having fulfilled the requirements of the institution was conferred the
                  </p>
                  <h4 className="text-3xl font-serif font-bold text-blue-600">
                    CertifyChain Demo
                  </h4>
                  <p className="text-gray-500 italic font-serif text-lg">
                    with all the rights, honors, and privileges appertaining thereunto.
                  </p>
                </div>

                {/* REVOKED Stamp Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className="border-8 border-red-600 px-16 py-6 transform -rotate-12"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span 
                      className="text-red-600 font-bold tracking-widest"
                      style={{ fontSize: '5rem' }}
                    >
                      REVOKED
                    </span>
                  </div>
                </div>

                {/* Signatures and Date */}
                <div className="flex justify-between items-end mt-16">
                  <div className="text-center">
                    <div className="h-16 border-b-2 border-gray-400 mb-2 w-32"></div>
                    <p className="text-sm text-gray-600">Registrar</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                      {data.date || "MAY 20, 2025"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-script italic text-gray-500 mb-2" style={{ fontFamily: 'cursive' }}>
                      Demo Signature
                    </p>
                    <div className="border-t border-gray-400 pt-2">
                      <p className="font-semibold text-gray-700">John Demo</p>
                      <p className="text-xs text-gray-500">DEAN OF DEMOS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transcript Tab Content */}
          {activeTab === 'transcript' && (
            <div 
              className="rounded-lg shadow-lg overflow-hidden relative"
              style={{ 
                background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)',
              }}
            >
              {/* Transcript Content */}
              <div className="p-8 relative">
                {/* Transcript Header */}
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  CertifyChain Demo Certificate
                </h2>

                {/* Student Info Grid */}
                <div className="grid md:grid-cols-2 gap-x-16 gap-y-4 mb-8">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="text-blue-600 font-medium w-28">NAME</span>
                      <span className="text-gray-900">: {data.name || "Your Name"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-blue-600 font-medium w-28">COURSE</span>
                      <span className="text-gray-900">: {transcriptData.course}</span>
                    </div>
                    <div className="flex">
                      <span className="text-blue-600 font-medium w-28">NRIC/FIN</span>
                      <span className="text-gray-900">: {transcriptData.nricFin}</span>
                    </div>
                    <div className="flex">
                      <span className="text-blue-600 font-medium w-28">STUDENT ID</span>
                      <span className="text-gray-900">: {transcriptData.studentId}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="text-blue-600 font-medium w-44">DOCUMENT ID</span>
                      <span className="text-gray-900">: {transcriptData.documentId}</span>
                    </div>
                    <div className="flex">
                      <span className="text-blue-600 font-medium w-44">DATE OF ISSUANCE</span>
                      <span className="text-gray-900">: {transcriptData.dateOfIssuance}</span>
                    </div>
                    <div className="flex">
                      <span className="text-blue-600 font-medium w-44">DATE OF ADMISSION</span>
                      <span className="text-gray-900">: {transcriptData.dateOfAdmission}</span>
                    </div>
                    <div className="flex">
                      <span className="text-blue-600 font-medium w-44">DATE OF GRADUATION</span>
                      <span className="text-gray-900">: {transcriptData.dateOfGraduation}</span>
                    </div>
                  </div>
                </div>

                {/* REVOKED Overlay for Transcript */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className="border-8 border-red-600 px-16 py-6 transform -rotate-12"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span 
                      className="text-red-600 font-bold tracking-widest"
                      style={{ fontSize: '4rem' }}
                    >
                      REVOKED
                    </span>
                  </div>
                </div>

                {/* Transcript Table */}
                <div className="mt-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">
                          <div>Transcript</div>
                          <div className="text-sm font-medium text-gray-600">Course Code</div>
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Name</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Grade</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Units</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transcriptData.courses.map((course, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-3 px-2 text-gray-700">{course.code}</td>
                          <td className="py-3 px-2 text-gray-700">{course.name}</td>
                          <td className="py-3 px-2 text-center text-gray-700">{course.grade}</td>
                          <td className="py-3 px-2 text-center text-gray-700">{course.units}</td>
                          <td className="py-3 px-2 text-center text-gray-700">{course.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signature */}
                <div className="flex justify-end mt-16">
                  <div className="text-right">
                    <p className="text-4xl font-script italic text-gray-500 mb-2" style={{ fontFamily: 'cursive' }}>
                      Demo Signature
                    </p>
                    <div className="border-t border-gray-400 pt-2 mt-4">
                      <p className="font-semibold text-gray-700">John Demo</p>
                      <p className="text-sm text-gray-500">Dean of Demos, CertifyChain</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
