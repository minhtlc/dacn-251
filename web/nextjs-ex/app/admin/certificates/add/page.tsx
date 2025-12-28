"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Send, X } from "lucide-react";
import toast from "react-hot-toast";

// Mock data for dropdowns
const certificateTypes = [
  { value: "bachelor", label: "Cử nhân" },
  { value: "master", label: "Thạc sĩ" },
  { value: "doctor", label: "Tiến sĩ" },
  { value: "engineer", label: "Kỹ sư" },
];

const batches = [
  { value: "2024-q4", label: "Đợt 2024-Q4" },
  { value: "2024-q3", label: "Đợt 2024-Q3" },
  { value: "2024-q2", label: "Đợt 2024-Q2" },
  { value: "2024-q1", label: "Đợt 2024-Q1" },
];

export default function AddCertificatePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    major: "",
    certificateType: "",
    institution: "",
    batch: "",
    certificateNumber: "",
    registryNumber: "",
    issueDate: "",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDraft = () => {
    toast.success("Đã lưu nháp thành công!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã gửi duyệt văn bằng thành công!");
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      dateOfBirth: "",
      major: "",
      certificateType: "",
      institution: "",
      batch: "",
      certificateNumber: "",
      registryNumber: "",
      issueDate: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Thêm mới một văn bằng</h1>
        <p className="text-muted-foreground">
          Nhập thông tin văn bằng mới vào hệ thống
        </p>
      </div>

      {/* Form */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Thông tin văn bằng
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Full Name */}
              <Input
                label="Họ và tên người được cấp"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
                required
              />

              {/* Date of Birth */}
              <Input
                label="Ngày sinh"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />

              {/* Major */}
              <Input
                label="Ngành/Chuyên ngành"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                placeholder="Ví dụ: Công nghệ thông tin"
                required
              />

              {/* Certificate Type */}
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Loại văn bằng <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.certificateType}
                  onValueChange={(value: string) =>
                    handleSelectChange("certificateType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại văn bằng" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificateTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Institution */}
              <Input
                label="Cơ sở đào tạo"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                placeholder="Tên trường/cơ sở đào tạo"
              />

              {/* Batch */}
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Đợt cấp <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.batch}
                  onValueChange={(value: string) => handleSelectChange("batch", value)}
                >
                  <SelectTrigger>
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

              {/* Certificate Number */}
              <Input
                label="Số hiệu văn bằng"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleInputChange}
                placeholder="Ví dụ: 123456/VB"
                required
              />

              {/* Registry Number */}
              <Input
                label="Số vào sổ cấp bằng"
                name="registryNumber"
                value={formData.registryNumber}
                onChange={handleInputChange}
                placeholder="Ví dụ: A123456"
                required
              />

              {/* Issue Date */}
              <Input
                label="Ngày cấp"
                name="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Notes */}
            <div className="mt-6">
              <Textarea
                label="Ghi chú"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ghi chú bổ sung (nếu có)"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Lưu nháp
              </Button>
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" />
                Gửi duyệt
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancel}
                className="gap-2 bg-white text-destructive border border-destructive hover:bg-destructive hover:text-white"
              >
                <X className="h-4 w-4" />
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

