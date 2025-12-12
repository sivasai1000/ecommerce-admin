"use client";

import { useEffect, useState } from "react";
import { TrashTable } from "@/components/trash-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BlogsTrashPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = async () => {
        try {
            const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/trash`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBlogs(data);
            }
        } catch (error) {
            console.error('Error fetching trash blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id: number) => {
        if (!confirm("Are you sure you want to restore this blog?")) return;

        try {
            const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/restore/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                fetchTrash();
            } else {
                alert("Failed to restore blog");
            }
        } catch (error) {
            console.error("Error restoring blog:", error);
        }
    };

    const columns = [
        { header: "ID", accessorKey: "id" },
        {
            header: "Image",
            accessorKey: "imageUrl",
            cell: (item: any) => item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="h-10 w-10 object-cover rounded" />
            ) : "No Image"
        },
        { header: "Title", accessorKey: "title" },
        { header: "Category", accessorKey: "category" },
        { header: "Author", accessorKey: "author" },
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
                    <Link href="/blogs">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blogs Trash</h1>
                    <p className="text-muted-foreground">Manage deleted blogs</p>
                </div>
            </div>

            {loading ? (
                <p>Loading trash...</p>
            ) : (
                <TrashTable
                    resourceName="blogs"
                    data={blogs}
                    columns={columns}
                    onRestore={handleRestore}
                />
            )}
        </div>
    );
}
