"use client";

"use client";

import { LayoutDashboard, Package, ShoppingCart, Users, Tags, FileText, Megaphone, HelpCircle, BookOpen, MessageSquare, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Users", href: "/users", icon: Users },
    { name: "Coupons", href: "/coupons", icon: Tags },
    { name: "Blogs", href: "/blogs", icon: FileText },
    { name: "Reviews", href: "/reviews", icon: MessageSquare },
    { name: "Marketing", href: "/marketing", icon: Megaphone },
    { name: "FAQs", href: "/faqs", icon: HelpCircle },
    { name: "Contact", href: "/contact", icon: Megaphone },
    { name: "Privacy", href: "/privacy", icon: BookOpen },
    { name: "Shipping", href: "/shipping", icon: Package },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Terms", href: "/terms", icon: FileText },
];

function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

export default function Sidebar() {
    return (
        <aside className="hidden md:flex w-64 bg-gray-900 text-white min-h-screen p-4 flex-col flex-shrink-0">
            <div className="flex items-center space-x-2 mb-8 px-2">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                </span>
            </div>
            <AdminNav />
        </aside>
    );
}
