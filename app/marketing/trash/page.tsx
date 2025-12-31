"use client";

import { useEffect, useState } from "react";
import { TrashTable } from "@/components/trash-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BannersTrashPage() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/banners/trash`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBanners(data);
            }
        } catch (error) {
            console.error('Error fetching trash banners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id: number) => {
        if (!confirm("Are you sure you want to restore this banner?")) return;

        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/banners/restore/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                fetchTrash();
            } else {
                alert("Failed to restore banner");
            }
        } catch (error) {
            console.error("Error restoring banner:", error);
        }
    };

    const columns = [
        { header: "ID", accessorKey: "id" },
        {
            header: "Image",
            accessorKey: "imageUrl",
            cell: (item: any) => item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="h-10 w-20 object-cover rounded" />
            ) : "No Image"
        },
        { header: "Title", accessorKey: "title" },
        { header: "Subtitle", accessorKey: "subtitle" },
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
                    <Link href="/marketing">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Banners Trash</h1>
                    <p className="text-muted-foreground">Manage deleted banners</p>
                </div>
            </div>

            {loading ? (
                <p>Loading trash...</p>
            ) : (
                <TrashTable
                    resourceName="banners"
                    data={banners}
                    columns={columns}
                    onRestore={handleRestore}
                />
            )}
        </div>
    );
}
