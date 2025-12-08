"use client";

import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, FileText, Megaphone, HelpCircle, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminNavProps {
    onLinkClick?: () => void;
}

export default function AdminNav({ onLinkClick }: AdminNavProps) {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/products", label: "Products", icon: Package },
        { href: "/orders", label: "Orders", icon: ShoppingCart },
        { href: "/users", label: "Users", icon: Users },
        { href: "/coupons", label: "Coupons", icon: Tags },
        { href: "/blogs", label: "Blogs", icon: FileText },
        { href: "/reviews", label: "Reviews", icon: MessageSquare },
        { href: "/marketing", label: "Marketing", icon: Megaphone },
        { href: "/faqs", label: "FAQs", icon: HelpCircle },
        { href: "/contact", label: "Contact", icon: Megaphone },
        { href: "/privacy", label: "Privacy", icon: BookOpen },
        { href: "/shipping", label: "Shipping", icon: Package },
        { href: "/terms", label: "Terms", icon: FileText },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <nav className="space-y-2 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-1 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link key={link.href} href={link.href} onClick={onLinkClick}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:text-white hover:bg-gray-800"
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {link.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>
            <div className="pt-4 border-t border-gray-700 mt-auto">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    onClick={handleLogout}
                >
                    {/* Add LogOut import if missing, or reuse generic Icon */}
                    <span className="mr-2">🚪</span>
                    Logout
                </Button>
            </div>
        </nav>
    );
}
