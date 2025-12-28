"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast";

const batches = [
  { value: "2024-q4", label: "Đợt 2024-Q4" },
  { value: "2024-q3", label: "Đợt 2024-Q3" },
  { value: "2024-q2", label: "Đợt 2024-Q2" },
  { value: "2024-q1", label: "Đợt 2024-Q1" },
];

export default function ImportCertificatePage() {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
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
    setUploadResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file Excel");
      return;
    }
    if (!selectedBatch) {
      toast.error("Vui lòng chọn đợt cấp");
      return;
    }

    setIsUploading(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setUploadResult({
      success: 125,
      failed: 3,
      errors: [
        "Dòng 45: Số hiệu văn bằng đã tồn tại",
        "Dòng 78: Thiếu thông tin ngày sinh",
        "Dòng 112: Định dạng ngày cấp không hợp lệ",
      ],
    });
    setIsUploading(false);
    toast.success("Import hoàn tất!");
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">
          Thêm mới nhiều văn bằng từ file Excel
        </h1>
        <p className="text-muted-foreground">
          Import danh sách văn bằng từ file Excel vào hệ thống
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area */}
        <Card className="lg:col-span-2 animate-fade-in">
          <CardContent className="p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Tải lên file Excel
            </h3>

            {/* Batch Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Đợt cấp <span className="text-destructive">*</span>
              </label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full md:w-72">
                  <SelectValue placeholder="Chọn đợt cấp" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.value} value={batch.value}>
                      {batch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-center text-foreground">
                    Kéo thả file Excel vào đây hoặc
                  </p>
                  <Button variant="outline" className="pointer-events-none">
                    Chọn file
                  </Button>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Hỗ trợ file .xls và .xlsx (tối đa 10MB)
                  </p>
                </>
              )}
            </div>

            {/* Upload Button */}
            <div className="mt-6 flex gap-4">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedBatch || isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Đang xử lý..." : "Tải lên và xử lý"}
              </Button>
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-medium text-success">
                      {uploadResult.success} văn bằng thành công
                    </span>
                  </div>
                  {uploadResult.failed > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <span className="font-medium text-destructive">
                        {uploadResult.failed} văn bằng lỗi
                      </span>
                    </div>
                  )}
                </div>

                {uploadResult.errors.length > 0 && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <p className="mb-2 font-medium text-destructive">Chi tiết lỗi:</p>
                    <ul className="space-y-1 text-sm text-destructive">
                      {uploadResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="animate-fade-in-delay-1">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Hướng dẫn</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  1
                </span>
                <p>Tải file mẫu Excel và điền thông tin văn bằng theo đúng định dạng</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  2
                </span>
                <p>Chọn đợt cấp văn bằng phù hợp</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  3
                </span>
                <p>Kéo thả hoặc chọn file Excel đã điền thông tin</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  4
                </span>
                <p>Nhấn &quot;Tải lên và xử lý&quot; để import vào hệ thống</p>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Tải file mẫu Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

