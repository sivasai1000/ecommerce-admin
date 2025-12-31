"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import AdminNav from "./AdminNav";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
    const [open, setOpen] = useState(false);
    const { logout, user } = useAuth();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-[#0F172A] border-r border-gray-800 text-white p-0">
                <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800/50">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-white">A</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Admin Panel
                            </span>
                        </div>
                    </div>

                    {/* Nav */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <AdminNav onLinkClick={() => setOpen(false)} />
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                <span className="text-xs font-medium text-slate-300">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrator'}</p>
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
                </div>
            </SheetContent>
        </Sheet>
    );
}
