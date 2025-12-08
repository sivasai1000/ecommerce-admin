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
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-900 border-gray-800 text-white p-0">
                <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                <div className="p-6">
                    <div className="mb-8">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                    </div>
                    <AdminNav onLinkClick={() => setOpen(false)} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
