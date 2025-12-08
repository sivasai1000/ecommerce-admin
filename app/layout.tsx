import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AdminAuthGuard>
            <div className="flex min-h-screen flex-col md:flex-row">
              <div className="md:hidden p-4 border-b flex items-center bg-white dark:bg-gray-900">
                <MobileNav />
                <span className="font-bold ml-4">Admin Panel</span>
              </div>
              <Sidebar />
              <main className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 p-6 overflow-y-auto">
                {children}
              </main>
            </div>
          </AdminAuthGuard>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
