"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import AdminNav from "./AdminNav";

export default function MobileNav() {
    const [open, setOpen] = useState(false);

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
                </div>
            </SheetContent>
        </Sheet>
    );
}
