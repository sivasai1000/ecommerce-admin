"use client";

import { useEffect, useState } from "react";
import { TrashTable } from "@/components/trash-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CouponsTrashPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/trash`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCoupons(data);
            }
        } catch (error) {
            console.error('Error fetching trash coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id: number) => {
        if (!confirm("Are you sure you want to restore this coupon?")) return;

        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/restore/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                fetchTrash();
            } else {
                alert("Failed to restore coupon");
            }
        } catch (error) {
            console.error("Error restoring coupon:", error);
        }
    };

    const columns = [
        { header: "ID", accessorKey: "id" },
        { header: "Code", accessorKey: "code" },
        { header: "Discount %", accessorKey: "discountPercentage", cell: (item: any) => `${item.discountPercentage}%` },
        {
            header: "Expiry Date",
            accessorKey: "expiryDate",
            cell: (item: any) => new Date(item.expiryDate).toLocaleDateString()
        },
        {
            header: "Deleted At",
            accessorKey: "deletedAt",
            cell: (item: any) => new Date(item.deletedAt).toLocaleString()
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/coupons">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Coupons Trash</h1>
                    <p className="text-muted-foreground">Manage deleted coupons</p>
                </div>
            </div>

            {loading ? (
                <p>Loading trash...</p>
            ) : (
                <TrashTable
                    resourceName="coupons"
                    data={coupons}
                    columns={columns}
                    onRestore={handleRestore}
                />
            )}
        </div>
    );
}
