import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MainLayout from "@/components/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "E-commerce Admin Panel",
  robots: {
    index: false,
    follow: false
  }
};

import AdminAuthGuard from "@/components/AdminAuthGuard";
import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <AuthProvider>
          <AdminAuthGuard>
            <MainLayout>
              {children}
            </MainLayout>
          </AdminAuthGuard>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
