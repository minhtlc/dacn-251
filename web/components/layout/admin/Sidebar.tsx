"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileInput,
  ClipboardList,
  HelpCircle,
  ChevronDown,
  FileText,
  Shield,
} from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: {
    title: string;
    href: string;
  }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Phân quyền phát hành",
    href: "/admin/batches",
    icon: Shield,
  },
  {
    title: "Nhập văn bằng",
    icon: FileInput,
    children: [
      {
        title: "Thêm mới một văn bằng",
        href: "/admin/certificates/add",
      },
      {
        title: "Thêm mới nhiều văn bằng từ file Excel",
        href: "/admin/certificates/import",
      },
      {
        title: "Tra cứu văn bằng từ file Excel",
        href: "/admin/certificates/search-excel",
      },
    ],
  },
  {
    title: "Trạng thái văn bằng",
    href: "/admin/certificates/status",
    icon: ClipboardList,
  },
  {
    title: "Hướng dẫn / Mẫu Excel",
    href: "/admin/guide",
    icon: HelpCircle,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Nhập văn bằng"]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Data Entry</span>
          <span className="text-xs text-muted-foreground">Certificate Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isParentActive(item)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-hover"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        expandedItems.includes(item.title) && "rotate-180"
                      )}
                    />
                  </button>
                  {expandedItems.includes(item.title) && (
                    <ul className="mt-1 space-y-1 pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive(child.href)
                                ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-hover"
                            )}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                            <span className="line-clamp-1">{child.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.href!)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-hover"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

