"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, X, Search, Download, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// Mock search results
const mockSearchResults = [
  {
    certificateNumber: "VB-2024-001",
    fullName: "Nguyễn Văn An",
    found: true,
    status: "approved",
    batch: "2024-Q4",
  },
  {
    certificateNumber: "VB-2024-002",
    fullName: "Trần Thị Bình",
    found: true,
    status: "pending",
    batch: "2024-Q4",
  },
  {
    certificateNumber: "VB-2024-999",
    fullName: "Lê Văn Không Tồn Tại",
    found: false,
    status: null,
    batch: null,
  },
];

export default function SearchExcelPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockSearchResults | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Vui lòng chọn file Excel (.xls hoặc .xlsx)");
      return;
    }
    setSelectedFile(file);
    setSearchResults(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSearch = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file Excel");
      return;
    }

    setIsSearching(true);
    // Simulate search
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setSearchResults(mockSearchResults);
    setIsSearching(false);
    toast.success("Tra cứu hoàn tất!");
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSearchResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const foundCount = searchResults?.filter((r) => r.found).length || 0;
  const notFoundCount = searchResults?.filter((r) => !r.found).length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">
          Tra cứu văn bằng từ file Excel
        </h1>
        <p className="text-muted-foreground">
          Tải lên file Excel chứa danh sách số hiệu văn bằng để tra cứu trạng thái
        </p>
      </div>

      {/* Upload Area */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <h3 className="mb-6 text-lg font-semibold text-foreground">
            Tải lên file tra cứu
          </h3>

          {/* Drop Zone */}
          <div
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleFileInputChange}
            />
            
            {selectedFile ? (
              <div className="flex items-center gap-4">
                <FileSpreadsheet className="h-12 w-12 text-success" />
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="ml-4"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <>
                <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-center text-foreground">
                  Kéo thả file Excel vào đây hoặc
                </p>
                <Button variant="outline" className="pointer-events-none">
                  Chọn file
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  File Excel cần chứa cột &quot;Số hiệu văn bằng&quot;
                </p>
              </>
            )}
          </div>

          {/* Search Button */}
          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleSearch}
              disabled={!selectedFile || isSearching}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? "Đang tra cứu..." : "Tra cứu"}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Tải file mẫu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Kết quả tra cứu
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">
                    {foundCount} tìm thấy
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-destructive">
                    {notFoundCount} không tìm thấy
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      STT
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Số hiệu văn bằng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Họ và tên
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Đợt cấp
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Kết quả
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, index) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {result.certificateNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {result.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {result.batch || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {result.found ? (
                          <Badge variant="success">Tìm thấy</Badge>
                        ) : (
                          <Badge variant="destructive">Không tìm thấy</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {result.status === "approved" && (
                          <Badge variant="success">Đã duyệt</Badge>
                        )}
                        {result.status === "pending" && (
                          <Badge variant="warning">Chờ duyệt</Badge>
                        )}
                        {!result.status && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Xuất kết quả ra Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

