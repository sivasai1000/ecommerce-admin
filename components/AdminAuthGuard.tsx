"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        const userStr = localStorage.getItem("adminUser");

        // Allow access to login page without check
        if (pathname === "/login") {
            setAuthorized(true);
            return;
        }

        if (!token || !userStr) {
            router.push("/login");
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (user.role === "admin" || user.role === "Admin") {
                setAuthorized(true);
            } else {
                alert("Access Denied: Admin role required");
                localStorage.removeItem("adminToken"); // Clear invalid session
                localStorage.removeItem("adminUser");
                router.push("/login");
            }
        } catch (e) {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            router.push("/login");
        }
    }, [pathname, router]);

    // Show nothing or a loader while checking
    if (!authorized && pathname !== "/login") {
        return <div className="flex h-screen items-center justify-center p-4">Loading Admin Panel...</div>;
    }

    return <>{children}</>;
}
