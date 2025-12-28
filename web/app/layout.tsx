import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import PrivyProviders from "@/providers/PrivyProviders";
import "@/lib/suppressPrivyWarnings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CertifyChain - Blockchain Certificate Verification",
  description: "Secure blockchain-backed certificate verification system ensuring authenticity and transparency of digital credentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <PrivyProviders>
          {children}
          <Toaster position="top-right" />
        </PrivyProviders>
      </body>
    </html>
  );
}
