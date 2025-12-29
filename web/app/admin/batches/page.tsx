"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  UserMinus,
  Shield,
  ShieldCheck,
  ShieldX,
  Loader2,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { isAddress, type Address, type Hex } from "viem";
import { getPrivyClients } from "@/lib/privy";
import { registryAbi } from "@/abis/Registry";
import toast from "react-hot-toast";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

export default function RoleManagementPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];

  const [targetAddress, setTargetAddress] = useState("");
  const [status, setStatus] = useState<{
    connected: Address;
    target: Address;
    isMeAdmin: boolean;
    isTargetIssuer: boolean;
    issuerRole: Hex;
    adminRole: Hex;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<"grant" | "revoke" | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const isValidAddress = useMemo(
    () => isAddress(targetAddress),
    [targetAddress]
  );

  const handleCopyAddress = () => {
    if (user?.wallet?.address) {
      navigator.clipboard.writeText(user.wallet.address);
      setCopiedAddress(true);
      toast.success("Đã sao chép địa chỉ ví!");
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  async function checkRoles() {
    if (!isValidAddress) {
      toast.error("Địa chỉ ví không hợp lệ");
      return;
    }

    setLoading(true);
    toast.loading("Đang kiểm tra quyền...", { id: "check-roles" });

    try {
      if (!authenticated) throw new Error("Vui lòng đăng nhập");
      if (!activeWallet) throw new Error("Không tìm thấy ví");
      if (!CONTRACT_ADDRESS) throw new Error("Thiếu địa chỉ hợp đồng");

      const { publicClient, account } = await getPrivyClients(activeWallet as { getEthereumProvider: () => Promise<unknown> });

      const issuerRole = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "ISSUER_ROLE",
      })) as Hex;

      const adminRole = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "DEFAULT_ADMIN_ROLE",
      })) as Hex;

      const isTargetIssuer = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "hasRole",
        args: [issuerRole, targetAddress as Address],
      });

      const isMeAdmin = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "hasRole",
        args: [adminRole, account],
      });

      console.log("checkRoles", {
        connected: account,
        target: targetAddress,
        isMeAdmin,
        isTargetIssuer,
      });

      setStatus({
        connected: account,
        target: targetAddress as Address,
        isMeAdmin: isMeAdmin as boolean,
        isTargetIssuer: isTargetIssuer as boolean,
        issuerRole,
        adminRole,
      });

      toast.success("Đã kiểm tra quyền thành công!", { id: "check-roles" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message, { id: "check-roles" });
      console.error("checkRoles error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function grantIssuer() {
    if (!isValidAddress) {
      toast.error("Địa chỉ ví không hợp lệ");
      return;
    }

    setActionLoading("grant");
    toast.loading("Đang cấp quyền phát hành...", { id: "grant-role" });

    try {
      if (!authenticated) throw new Error("Vui lòng đăng nhập");
      if (!activeWallet) throw new Error("Không tìm thấy ví");
      if (!CONTRACT_ADDRESS) throw new Error("Thiếu địa chỉ hợp đồng");

      const { walletClient, publicClient, account } = await getPrivyClients(activeWallet as { getEthereumProvider: () => Promise<unknown> });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "addIssuer",
        args: [targetAddress as Address],
        account,
      });

      toast.loading("Đang chờ xác nhận giao dịch...", { id: "grant-role" });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast.success("🎉 Đã cấp quyền phát hành thành công!", { id: "grant-role" });
      } else {
        toast.error("Giao dịch thất bại", { id: "grant-role" });
      }

      // Refresh roles
      await checkRoles();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message, { id: "grant-role" });
      console.error("grantIssuer error:", e);
    } finally {
      setActionLoading(null);
    }
  }

  async function revokeIssuer() {
    if (!isValidAddress) {
      toast.error("Địa chỉ ví không hợp lệ");
      return;
    }

    setActionLoading("revoke");
    toast.loading("Đang thu hồi quyền phát hành...", { id: "revoke-role" });

    try {
      if (!authenticated) throw new Error("Vui lòng đăng nhập");
      if (!activeWallet) throw new Error("Không tìm thấy ví");
      if (!CONTRACT_ADDRESS) throw new Error("Thiếu địa chỉ hợp đồng");

      const { walletClient, publicClient, account } = await getPrivyClients(activeWallet as { getEthereumProvider: () => Promise<unknown> });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: registryAbi,
        functionName: "removeIssuer",
        args: [targetAddress as Address],
        account,
      });

      toast.loading("Đang chờ xác nhận giao dịch...", { id: "revoke-role" });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast.success("✅ Đã thu hồi quyền phát hành!", { id: "revoke-role" });
      } else {
        toast.error("Giao dịch thất bại", { id: "revoke-role" });
      }

      // Refresh roles
      await checkRoles();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message, { id: "revoke-role" });
      console.error("revokeIssuer error:", e);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">
          Phân cấp quyền cho người phát hành
        </h1>
        <p className="text-muted-foreground">
          Cấp hoặc thu hồi quyền phát hành văn bằng trên blockchain
        </p>
      </div>

      {/* Connection Status Card */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Trạng thái kết nối</h3>
              {!ready ? (
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              ) : !authenticated ? (
                <p className="text-sm text-muted-foreground">Chưa kết nối ví</p>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-muted-foreground">
                    {user?.wallet?.address?.slice(0, 10)}...{user?.wallet?.address?.slice(-8)}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {copiedAddress ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <a
                    href={`https://sepolia.etherscan.io/address/${user?.wallet?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-muted rounded"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              )}
            </div>
            {!authenticated && ready && (
              <Button onClick={login} className="gap-2">
                <Shield className="h-4 w-4" />
                Kết nối ví
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Action Card */}
      <Card className="animate-fade-in-delay-1">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Quản lý quyền Issuer
          </h3>

          {/* Target Address Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Địa chỉ ví cần kiểm tra / cấp quyền
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="0x..."
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  className="pl-10 font-mono"
                  disabled={!authenticated}
                />
              </div>
              {targetAddress && !isValidAddress && (
                <p className="text-sm text-destructive mt-1">
                  Địa chỉ ví không hợp lệ
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={checkRoles}
                disabled={!authenticated || !isValidAddress || loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Kiểm tra quyền
              </Button>
              <Button
                onClick={grantIssuer}
                disabled={!authenticated || !isValidAddress || actionLoading !== null || !status?.isMeAdmin}
                className="gap-2 bg-success hover:bg-success/90"
              >
                {actionLoading === "grant" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Cấp quyền Issuer
              </Button>
              <Button
                variant="destructive"
                onClick={revokeIssuer}
                disabled={!authenticated || !isValidAddress || actionLoading !== null || !status?.isMeAdmin}
                className="gap-2"
              >
                {actionLoading === "revoke" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserMinus className="h-4 w-4" />
                )}
                Thu hồi quyền
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {status && (
        <Card className="animate-fade-in-delay-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Kết quả kiểm tra
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Your Admin Status */}
              <div className={`rounded-lg p-4 border-2 ${status.isMeAdmin ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                <div className="flex items-center gap-3">
                  {status.isMeAdmin ? (
                    <ShieldCheck className="h-8 w-8 text-success" />
                  ) : (
                    <ShieldX className="h-8 w-8 text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">Quyền của bạn</p>
                    <p className="text-sm text-muted-foreground">
                      {status.isMeAdmin ? "Bạn có quyền Admin" : "Bạn không có quyền Admin"}
                    </p>
                  </div>
                </div>
                {!status.isMeAdmin && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-warning">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Bạn cần quyền Admin để cấp/thu hồi quyền Issuer</span>
                  </div>
                )}
              </div>

              {/* Target Issuer Status */}
              <div className={`rounded-lg p-4 border-2 ${status.isTargetIssuer ? 'border-primary/30 bg-primary/5' : 'border-muted bg-muted/5'}`}>
                <div className="flex items-center gap-3">
                  {status.isTargetIssuer ? (
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  ) : (
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">Địa chỉ mục tiêu</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {status.target.slice(0, 10)}...{status.target.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  {status.isTargetIssuer ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Đã có quyền Issuer
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Chưa có quyền Issuer
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Chi tiết kỹ thuật
              </summary>
              <div className="mt-2 p-4 bg-muted/30 rounded-lg font-mono text-xs space-y-1">
                <p><span className="text-muted-foreground">ISSUER_ROLE:</span> {status.issuerRole}</p>
                <p><span className="text-muted-foreground">ADMIN_ROLE:</span> {status.adminRole}</p>
                <p><span className="text-muted-foreground">Contract:</span> {CONTRACT_ADDRESS}</p>
              </div>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="animate-fade-in-delay-3">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Hướng dẫn
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="shrink-0">1</Badge>
              <span>Nhập địa chỉ ví (0x...) của người cần cấp/thu hồi quyền</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="shrink-0">2</Badge>
              <span>Nhấn &quot;Kiểm tra quyền&quot; để xem trạng thái hiện tại</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="shrink-0">3</Badge>
              <span>Nếu bạn có quyền Admin, bạn có thể cấp hoặc thu hồi quyền Issuer</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="shrink-0">4</Badge>
              <span>Mỗi thao tác sẽ cần bạn ký giao dịch blockchain</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
