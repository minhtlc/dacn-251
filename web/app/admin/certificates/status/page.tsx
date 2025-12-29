"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Wallet,
  FileText,
} from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import type { Address } from "viem";
import { IssuerCertificateItem, getCertificatesIssuedByMe } from "@/lib/issuerCertificatesByLogs";
import { revokeCertificate } from "@/lib/revoke";
import toast from "react-hot-toast";

type Filter = "ALL" | "ACTIVE" | "REVOKED" | "INVALID";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Hoạt động
        </Badge>
      );
    case "REVOKED":
      return (
        <Badge variant="warning" className="gap-1">
          <XCircle className="h-3 w-3" />
          Đã thu hồi
        </Badge>
      );
    case "INVALID":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Không hợp lệ
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function CertificateStatusPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];

  const issuer = (user?.wallet?.address as Address | undefined) ?? undefined;

  const [items, setItems] = useState<IssuerCertificateItem[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((x) => x.status === filter);
  }, [items, filter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: items.length,
      active: items.filter((x) => x.status === "ACTIVE").length,
      revoked: items.filter((x) => x.status === "REVOKED").length,
      invalid: items.filter((x) => x.status === "INVALID").length,
    };
  }, [items]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Đã sao chép!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  async function loadCertificates() {
    setLoading(true);
    toast.loading("Đang tải danh sách văn bằng...", { id: "load-certs" });

    try {
      if (!authenticated) throw new Error("Vui lòng đăng nhập");
      if (!issuer) throw new Error("Không tìm thấy địa chỉ ví");

      const list = await getCertificatesIssuedByMe(issuer, 50);
      setItems(list);
      toast.success(`Đã tải ${list.length} văn bằng`, { id: "load-certs" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message, { id: "load-certs" });
      console.error("loadCertificates error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(tokenId: string) {
    setRevoking(tokenId);
    toast.loading("Đang thu hồi văn bằng...", { id: `revoke-${tokenId}` });

    try {
      if (!authenticated) throw new Error("Vui lòng đăng nhập");
      if (!activeWallet) throw new Error("Không tìm thấy ví");

      const { txHash } = await revokeCertificate({
        wallet: activeWallet as { getEthereumProvider: () => Promise<unknown> },
        tokenId: BigInt(tokenId),
      });

      toast.success(`Đã thu hồi văn bằng #${tokenId}`, { id: `revoke-${tokenId}` });
      console.log("Revoke tx:", txHash);

      // Update local state
      setItems((prev) =>
        prev.map((x) =>
          x.tokenId === tokenId ? { ...x, revoked: true, status: "REVOKED" as const } : x
        )
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message, { id: `revoke-${tokenId}` });
      console.error("handleRevoke error:", e);
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Quản lý văn bằng đã phát hành</h1>
        <p className="text-muted-foreground">
          Xem và quản lý các văn bằng đã phát hành trên blockchain
        </p>
      </div>

      {/* Connection Status */}
      <Card className="animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                {!ready ? (
                  <p className="text-sm text-muted-foreground">Đang tải...</p>
                ) : !authenticated ? (
                  <p className="text-sm text-muted-foreground">Chưa kết nối ví</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Đã kết nối</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {user?.wallet?.address?.slice(0, 10)}...{user?.wallet?.address?.slice(-8)}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!authenticated && ready ? (
                <Button onClick={login} className="gap-2">
                  <Wallet className="h-4 w-4" />
                  Kết nối ví
                </Button>
              ) : (
                <Button onClick={loadCertificates} disabled={loading || !authenticated} className="gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Tải danh sách
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 animate-fade-in-delay-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Tổng số</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <XCircle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{stats.revoked}</p>
                  <p className="text-xs text-muted-foreground">Đã thu hồi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{stats.invalid}</p>
                  <p className="text-xs text-muted-foreground">Không hợp lệ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {items.length > 0 && (
        <Card className="animate-fade-in-delay-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Lọc:</span>
              {(["ALL", "ACTIVE", "REVOKED", "INVALID"] as Filter[]).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="gap-1"
                >
                  {f === "ALL" && "Tất cả"}
                  {f === "ACTIVE" && (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Hoạt động
                    </>
                  )}
                  {f === "REVOKED" && (
                    <>
                      <XCircle className="h-3 w-3" />
                      Thu hồi
                    </>
                  )}
                  {f === "INVALID" && (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      Không hợp lệ
                    </>
                  )}
                  {f !== "ALL" && (
                    <span className="ml-1 text-xs opacity-70">
                      ({f === "ACTIVE" ? stats.active : f === "REVOKED" ? stats.revoked : stats.invalid})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates List */}
      {filtered.length > 0 ? (
        <div className="space-y-4 animate-fade-in-delay-2">
          {filtered.map((cert) => (
            <Card key={cert.tokenId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted font-mono text-lg font-bold">
                      #{cert.tokenId}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {cert.metadata?.name || `Văn bằng #${cert.tokenId}`}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Người nhận: {cert.to.slice(0, 8)}...{cert.to.slice(-6)}</span>
                        <span>•</span>
                        <span>{cert.metadata?.issuedDate || new Date(cert.issuedAt * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(cert.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedItem(expandedItem === cert.tokenId ? null : cert.tokenId)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={cert.status === "REVOKED" || revoking !== null}
                      onClick={() => handleRevoke(cert.tokenId)}
                      className="gap-1"
                    >
                      {revoking === cert.tokenId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldX className="h-4 w-4" />
                      )}
                      Thu hồi
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedItem === cert.tokenId && (
                  <div className="p-4 bg-muted/30 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Student Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">Thông tin sinh viên</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="text-muted-foreground">Tên:</span> {cert.metadata?.student?.name || "N/A"}</p>
                          <p><span className="text-muted-foreground">MSSV:</span> {cert.metadata?.student?.id || "N/A"}</p>
                          <p>
                            <span className="text-muted-foreground">Ví:</span>{" "}
                            <span className="font-mono text-xs">{cert.to.slice(0, 12)}...{cert.to.slice(-8)}</span>
                            <button onClick={() => handleCopy(cert.to, `to-${cert.tokenId}`)} className="ml-1 p-0.5 hover:bg-muted rounded">
                              <Copy className={`h-3 w-3 ${copiedField === `to-${cert.tokenId}` ? 'text-success' : 'text-muted-foreground'}`} />
                            </button>
                          </p>
                        </div>
                      </div>

                      {/* Certificate Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">Thông tin văn bằng</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="text-muted-foreground">Loại:</span> {cert.metadata?.type || "N/A"}</p>
                          <p><span className="text-muted-foreground">Chuyên ngành:</span> {cert.metadata?.specialization || "N/A"}</p>
                          <p><span className="text-muted-foreground">Nơi cấp:</span> {cert.metadata?.issuedBy || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Info */}
                    <div className="pt-3 border-t border-border">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Thông tin blockchain</h4>
                      <div className="text-sm space-y-1">
                        <p className="flex items-center gap-2">
                          <span className="text-muted-foreground">Token URI:</span>
                          <span className="font-mono text-xs truncate max-w-[300px]">{cert.tokenURI}</span>
                          <a href={cert.tokenURI} target="_blank" rel="noopener noreferrer" className="p-0.5 hover:bg-muted rounded">
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Hash on-chain:</span>{" "}
                          <span className="font-mono text-xs">{cert.onchainMetadataHash.slice(0, 16)}...{cert.onchainMetadataHash.slice(-8)}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Hash tính toán:</span>{" "}
                          <span className="font-mono text-xs">{cert.computedMetadataHash.slice(0, 16)}...{cert.computedMetadataHash.slice(-8)}</span>
                          {cert.onchainMetadataHash === cert.computedMetadataHash ? (
                            <CheckCircle className="inline h-3 w-3 text-success ml-1" />
                          ) : (
                            <XCircle className="inline h-3 w-3 text-destructive ml-1" />
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 && !loading && authenticated ? (
        <Card className="animate-fade-in-delay-2">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có văn bằng</h3>
            <p className="text-muted-foreground mb-4">
              Nhấn &quot;Tải danh sách&quot; để xem các văn bằng bạn đã phát hành
            </p>
            <Button onClick={loadCertificates} disabled={loading} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tải danh sách
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Pagination placeholder */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} / {items.length} văn bằng
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
      )}
    </div>
  );
}
