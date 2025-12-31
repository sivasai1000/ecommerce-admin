"use client";

import { useEffect, useState } from "react";
import { TrashTable } from "@/components/trash-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function ReviewsTrashPage() {
    const { apiCall } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = async () => {
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin/trash`);
            if (res && res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching trash reviews:', error);
            toast.error("Failed to load trash");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id: number) => {
        if (!confirm("Are you sure you want to restore this review?")) return;

        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin/restore/${id}`, {
                method: "PUT",
            });

            if (res && res.ok) {
                toast.success("Review restored successfully");
                fetchTrash();
            } else {
                toast.error("Failed to restore review");
            }
        } catch (error) {
            console.error("Error restoring review:", error);
            toast.error("Error restoring review");
        }
    };

    const columns = [
        { header: "ID", accessorKey: "id" },
        { header: "User", accessorKey: "userName" },
        { header: "Product", accessorKey: "productName" },
        { header: "Rating", accessorKey: "rating", cell: (item: any) => `${item.rating}/5` },
        { header: "Comment", accessorKey: "comment", cell: (item: any) => item.comment?.substring(0, 50) + "..." },
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
                    <Link href="/reviews">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reviews Trash</h1>
                    <p className="text-muted-foreground">Manage deleted reviews</p>
                </div>
            </div>

            {loading ? (
                <p>Loading trash...</p>
            ) : (
                <TrashTable
                    resourceName="reviews"
                    data={reviews}
                    columns={columns}
                    onRestore={handleRestore}
                />
            )}
        </div>
    );
}
