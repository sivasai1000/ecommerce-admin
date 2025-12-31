"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <main className="min-h-screen bg-slate-50 dark:bg-slate-900">{children}</main>;
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-slate-50 dark:bg-slate-900">
            {/* Mobile Header */}
            <div className="md:hidden p-4 border-b border-slate-200 dark:border-slate-800 flex items-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white sticky top-0 z-50 shadow-sm">
                <MobileNav />
                <div className="ml-4 flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/20">
                        <span className="font-bold text-white">A</span>
                    </div>
                    <span className="font-bold text-lg tracking-tight">Admin Panel</span>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-[calc(100vh-73px)] md:h-screen p-4 md:p-8 bg-slate-50 dark:bg-slate-900/50">
                <div className="mx-auto max-w-7xl animate-in fade-in duration-500 slide-in-from-bottom-2">
                    {children}
                </div>
            </main>
        </div>
    );
}
