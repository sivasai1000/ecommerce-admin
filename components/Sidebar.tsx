"use client";

import Link from "next/link";
import AdminNav from "./AdminNav";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
    const { logout, user } = useAuth();

    return (
        <aside className="hidden md:flex w-72 bg-[#0F172A] border-r border-gray-800 text-white min-h-screen flex-col sticky top-0 h-screen">
            {/* Header */}
            <div className="p-6 border-b border-gray-800/50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-white">A</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Admin Panel
                    </span>
                </Link>
            </div>

            {/* Scrollable Nav */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AdminNav />
            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-gray-800/50 bg-[#0F172A]">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <Avatar className="h-9 w-9 border border-gray-700">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrator'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@example.com'}</p>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/20"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Button>
            </div>
        </aside>
    );
}
