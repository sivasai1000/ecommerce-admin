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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <AuthProvider>
          <AdminAuthGuard>
            <div className="flex min-h-screen flex-col md:flex-row">
              {/* Mobile Header */}
              <div className="md:hidden p-4 border-b border-gray-800 flex items-center bg-[#0F172A] text-white sticky top-0 z-50">
                <MobileNav />
                <div className="ml-4 flex items-center gap-2">
                  <div className="h-6 w-6 bg-blue-600 rounded-md flex items-center justify-center">
                    <span className="font-bold text-xs">A</span>
                  </div>
                  <span className="font-bold">Admin Panel</span>
                </div>
              </div>

              {/* Desktop Sidebar */}
              <Sidebar />

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] md:h-screen p-4 md:p-8">
                <div className="mx-auto max-w-6xl">
                  {children}
                </div>
              </main>
            </div>
          </AdminAuthGuard>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
