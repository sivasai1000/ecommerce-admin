"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Tags,
    FileText,
    Megaphone,
    HelpCircle,
    BookOpen,
    MessageSquare,
    MessageCircle,
    Settings,
    LogOut,
    Truck,
    Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavProps {
    onLinkClick?: () => void;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        title: "Overview",
        items: [
            { name: "Dashboard", href: "/", icon: LayoutDashboard },
        ]
    },
    {
        title: "Management",
        items: [
            { name: "Products", href: "/products", icon: Package },
            { name: "Orders", href: "/orders", icon: ShoppingCart },
            { name: "Categories", href: "/categories", icon: Layers }, // Added Icon
            { name: "Users", href: "/users", icon: Users },
            { name: "Coupons", href: "/coupons", icon: Tags },
        ]
    },
    {
        title: "Content",
        items: [
            { name: "Blogs", href: "/blogs", icon: FileText },
            { name: "Reviews", href: "/reviews", icon: MessageSquare },
            { name: "Marketing", href: "/marketing", icon: Megaphone },
            { name: "FAQs", href: "/faqs", icon: HelpCircle },
        ]
    },
    {
        title: "Settings",
        items: [
            { name: "Shipping", href: "/shipping", icon: Truck },
            { name: "Privacy Policy", href: "/privacy", icon: BookOpen },
            { name: "Terms of Service", href: "/terms", icon: FileText },
        ]
    }
];

export default function AdminNav({ onLinkClick }: AdminNavProps) {
    const pathname = usePathname();

    return (
        <nav className="flex-1 space-y-6 px-3 py-4">
            {navGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-2">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {group.title}
                    </h3>
                    <div className="space-y-1">
                        {group.items.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onLinkClick}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}
