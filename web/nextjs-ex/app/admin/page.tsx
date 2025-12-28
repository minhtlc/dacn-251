"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  FileText,
  Clock,
  XCircle,
  Plus,
  Upload,
  List,
  CheckCircle,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

// Mock data for stats
const stats = [
  {
    title: "Active Batches",
    value: "12",
    icon: FolderKanban,
    color: "blue",
  },
  {
    title: "Certificates Entered",
    value: "1,847",
    icon: FileText,
    color: "green",
  },
  {
    title: "Pending Approvals",
    value: "234",
    icon: Clock,
    color: "amber",
  },
  {
    title: "Rejected Certificates",
    value: "18",
    icon: XCircle,
    color: "red",
  },
];

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    action: "Import Excel",
    batch: "2024-Q4",
    count: 125,
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "success",
  },
  {
    id: 2,
    action: "Cập nhật văn bằng",
    batch: "2024-Q3",
    count: 1,
    time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    status: "success",
  },
  {
    id: 3,
    action: "Import Excel",
    batch: "2024-Q4",
    count: 89,
    time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    status: "success",
  },
  {
    id: 4,
    action: "Thêm văn bằng mới",
    batch: "2024-Q4",
    count: 1,
    time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: "success",
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; icon: string; text: string }> = {
    blue: {
      bg: "bg-stats-blue-light",
      icon: "text-stats-blue",
      text: "text-stats-blue",
    },
    green: {
      bg: "bg-stats-green-light",
      icon: "text-stats-green",
      text: "text-stats-green",
    },
    amber: {
      bg: "bg-stats-amber-light",
      icon: "text-stats-amber",
      text: "text-stats-amber",
    },
    red: {
      bg: "bg-stats-red-light",
      icon: "text-stats-red",
      text: "text-stats-red",
    },
  };
  return colors[color] || colors.blue;
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống nhập liệu văn bằng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <Card
              key={stat.title}
              className={`animate-fade-in-delay-${index + 1}`}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${colors.bg}`}>
                  <stat.icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Thao tác nhanh</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/admin/certificates/add">
              <Button
                className="h-auto w-full flex-col gap-2 py-6 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-6 w-6" />
                <span>Thêm văn bằng mới</span>
              </Button>
            </Link>
            <Link href="/admin/certificates/import">
              <Button
                className="h-auto w-full flex-col gap-2 py-6 bg-warning hover:bg-warning/90"
              >
                <Upload className="h-6 w-6" />
                <span>Import từ Excel</span>
              </Button>
            </Link>
            <Link href="/admin/batches">
              <Button
                className="h-auto w-full flex-col gap-2 py-6 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
              >
                <List className="h-6 w-6" />
                <span>Xem danh sách đợt cấp</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      Đợt {activity.batch} • {activity.count} văn bằng
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatRelativeTime(activity.time)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

