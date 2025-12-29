"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Download,
  BookOpen,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Chuẩn bị file Excel",
    description: "Tải mẫu Excel và điền thông tin văn bằng theo đúng format quy định.",
  },
  {
    step: 2,
    title: "Kiểm tra dữ liệu",
    description: "Đảm bảo tất cả các trường bắt buộc đã được điền đầy đủ và chính xác.",
  },
  {
    step: 3,
    title: "Import file",
    description: "Vào mục 'Thêm mới nhiều văn bằng từ file Excel' và tải file lên.",
  },
  {
    step: 4,
    title: "Xác nhận và gửi duyệt",
    description: "Kiểm tra lại danh sách văn bằng và gửi duyệt để mint lên blockchain.",
  },
];

const requiredFields = [
  { field: "Họ và tên", description: "Tên đầy đủ của người được cấp văn bằng" },
  { field: "Ngày sinh", description: "Định dạng DD/MM/YYYY" },
  { field: "Ngành/Chuyên ngành", description: "Ngành học của sinh viên" },
  { field: "Loại văn bằng", description: "Cử nhân, Thạc sĩ, Tiến sĩ, Kỹ sư" },
  { field: "Cơ sở đào tạo", description: "Tên trường/cơ sở đào tạo" },
  { field: "Số hiệu văn bằng", description: "Mã số văn bằng" },
  { field: "Ngày cấp", description: "Định dạng DD/MM/YYYY" },
  { field: "Địa chỉ ví", description: "Địa chỉ ví blockchain của người nhận (0x...)" },
];

export default function GuidePage() {
  const handleDownloadTemplate = () => {
    // In a real app, this would download an actual Excel template
    alert("Tính năng tải mẫu Excel sẽ được triển khai sau.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Hướng dẫn / Mẫu Excel</h1>
        <p className="text-muted-foreground">
          Hướng dẫn nhập liệu văn bằng và tải mẫu Excel
        </p>
      </div>

      {/* Download Template */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Mẫu Excel nhập liệu</h3>
                <p className="text-sm text-muted-foreground">
                  Tải mẫu Excel để nhập danh sách văn bằng
                </p>
              </div>
            </div>
            <Button onClick={handleDownloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Tải mẫu Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Steps Guide */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Các bước nhập liệu văn bằng
            </h3>
          </div>
          <div className="space-y-4">
            {steps.map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Required Fields */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-foreground">
              Các trường bắt buộc trong file Excel
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">
                    Tên trường
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">
                    Mô tả
                  </th>
                </tr>
              </thead>
              <tbody>
                {requiredFields.map((field, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm font-medium text-foreground">
                      {field.field}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {field.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="animate-fade-in border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">Lưu ý quan trọng</h3>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                <li>• Đảm bảo địa chỉ ví blockchain chính xác trước khi mint.</li>
                <li>• Sau khi mint lên blockchain, thông tin không thể thay đổi.</li>
                <li>• Kiểm tra kỹ thông tin trước khi gửi duyệt.</li>
                <li>• File Excel phải theo đúng định dạng mẫu.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Câu hỏi thường gặp
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">
                Làm sao để lấy địa chỉ ví của sinh viên?
              </h4>
              <p className="text-sm text-muted-foreground">
                Sinh viên cần đăng nhập vào hệ thống qua cổng Student Portal, sau đó địa chỉ ví 
                sẽ được tạo tự động hoặc họ có thể kết nối ví có sẵn.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground">
                Có thể hủy văn bằng sau khi đã mint không?
              </h4>
              <p className="text-sm text-muted-foreground">
                Có, admin có thể revoke (thu hồi) văn bằng. Tuy nhiên, thông tin văn bằng vẫn 
                được lưu trên blockchain nhưng sẽ hiển thị trạng thái "Đã thu hồi".
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground">
                Phí gas cho mỗi lần mint là bao nhiêu?
              </h4>
              <p className="text-sm text-muted-foreground">
                Phí gas phụ thuộc vào mạng blockchain đang sử dụng. Hiện tại hệ thống đang 
                chạy trên Sepolia testnet nên không tốn phí thật.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

