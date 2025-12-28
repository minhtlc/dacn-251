"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
} from "lucide-react";

// Mock data for batches
const mockBatches = [
  {
    id: 1,
    name: "Đợt 2024-Q4",
    description: "Đợt cấp văn bằng quý 4 năm 2024",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    totalCertificates: 523,
    pending: 45,
    approved: 456,
    rejected: 12,
    status: "active",
  },
  {
    id: 2,
    name: "Đợt 2024-Q3",
    description: "Đợt cấp văn bằng quý 3 năm 2024",
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    totalCertificates: 687,
    pending: 0,
    approved: 675,
    rejected: 12,
    status: "completed",
  },
  {
    id: 3,
    name: "Đợt 2024-Q2",
    description: "Đợt cấp văn bằng quý 2 năm 2024",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    totalCertificates: 412,
    pending: 0,
    approved: 408,
    rejected: 4,
    status: "completed",
  },
  {
    id: 4,
    name: "Đợt 2024-Q1",
    description: "Đợt cấp văn bằng quý 1 năm 2024",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    totalCertificates: 225,
    pending: 0,
    approved: 225,
    rejected: 0,
    status: "completed",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="success">Đang hoạt động</Badge>;
    case "completed":
      return <Badge variant="secondary">Đã hoàn thành</Badge>;
    case "draft":
      return <Badge variant="warning">Bản nháp</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function BatchesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBatches = mockBatches.filter((batch) =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý đợt cấp văn bằng
          </h1>
          <p className="text-muted-foreground">
            Xem và quản lý các đợt cấp văn bằng trong hệ thống
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo đợt cấp mới
        </Button>
      </div>

      {/* Search */}
      <Card className="animate-fade-in">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm đợt cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Batches Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredBatches.map((batch, index) => (
          <Card
            key={batch.id}
            className={`animate-fade-in-delay-${Math.min(index + 1, 3)}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {batch.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {batch.description}
                  </p>
                </div>
                {getStatusBadge(batch.status)}
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {batch.startDate} - {batch.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{batch.totalCertificates} văn bằng</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg bg-warning/10 p-3 text-center">
                  <p className="text-lg font-bold text-warning">{batch.pending}</p>
                  <p className="text-xs text-muted-foreground">Chờ duyệt</p>
                </div>
                <div className="rounded-lg bg-success/10 p-3 text-center">
                  <p className="text-lg font-bold text-success">{batch.approved}</p>
                  <p className="text-xs text-muted-foreground">Đã duyệt</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 text-center">
                  <p className="text-lg font-bold text-destructive">
                    {batch.rejected}
                  </p>
                  <p className="text-xs text-muted-foreground">Từ chối</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Eye className="h-4 w-4" />
                  Xem chi tiết
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị {filteredBatches.length} đợt cấp
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
    </div>
  );
}

