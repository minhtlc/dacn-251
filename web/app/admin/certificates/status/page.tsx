"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

// Mock data for certificates
const mockCertificates = [
  {
    id: 1,
    fullName: "Nguyễn Văn An",
    certificateNumber: "VB-2024-001",
    major: "Công nghệ thông tin",
    batch: "2024-Q4",
    status: "pending",
    createdAt: "2024-12-20",
  },
  {
    id: 2,
    fullName: "Trần Thị Bình",
    certificateNumber: "VB-2024-002",
    major: "Quản trị kinh doanh",
    batch: "2024-Q4",
    status: "approved",
    createdAt: "2024-12-19",
  },
  {
    id: 3,
    fullName: "Lê Hoàng Cường",
    certificateNumber: "VB-2024-003",
    major: "Kỹ thuật điện tử",
    batch: "2024-Q3",
    status: "rejected",
    createdAt: "2024-12-18",
  },
  {
    id: 4,
    fullName: "Phạm Minh Đức",
    certificateNumber: "VB-2024-004",
    major: "Công nghệ thông tin",
    batch: "2024-Q4",
    status: "draft",
    createdAt: "2024-12-17",
  },
  {
    id: 5,
    fullName: "Hoàng Thị Em",
    certificateNumber: "VB-2024-005",
    major: "Kinh tế",
    batch: "2024-Q3",
    status: "approved",
    createdAt: "2024-12-16",
  },
];

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "draft", label: "Bản nháp" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const batchOptions = [
  { value: "all", label: "Tất cả đợt cấp" },
  { value: "2024-q4", label: "2024-Q4" },
  { value: "2024-q3", label: "2024-Q3" },
  { value: "2024-q2", label: "2024-Q2" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="secondary">Bản nháp</Badge>;
    case "pending":
      return <Badge variant="warning">Chờ duyệt</Badge>;
    case "approved":
      return <Badge variant="success">Đã duyệt</Badge>;
    case "rejected":
      return <Badge variant="destructive">Từ chối</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function CertificateStatusPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCertificates = mockCertificates.filter((cert) => {
    const matchesSearch =
      cert.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesBatch =
      batchFilter === "all" ||
      cert.batch.toLowerCase().replace("-", "-") === batchFilter;
    return matchesSearch && matchesStatus && matchesBatch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Trạng thái văn bằng</h1>
        <p className="text-muted-foreground">
          Xem và quản lý trạng thái các văn bằng đã nhập
        </p>
      </div>

      {/* Filters */}
      <Card className="animate-fade-in">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo họ tên hoặc số hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Đợt cấp" />
              </SelectTrigger>
              <SelectContent>
                {batchOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="animate-fade-in-delay-1">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    STT
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Họ và tên
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Số hiệu văn bằng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Ngành
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Đợt cấp
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((cert, index) => (
                  <tr
                    key={cert.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {cert.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {cert.certificateNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {cert.major}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {cert.batch}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(cert.status)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {cert.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị {filteredCertificates.length} kết quả
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="min-w-[40px]">
                1
              </Button>
              <Button variant="outline" size="icon" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

