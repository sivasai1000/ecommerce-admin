"use client";

import { useEffect, useState } from "react";
import { TrashTable } from "@/components/trash-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function ProductsTrashPage() {
    const { apiCall } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (url: string) => {
        if (!url) return null;
        try {
            // Check if it looks like a JSON array (product images are stored as JSON string)
            if (url.trim().startsWith('[') || url.trim().startsWith('{')) {
                const parsed = JSON.parse(url);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                return null;
            }
        } catch (e) {
            // If parse error, assume it's a plain string if it's not JSON format
            console.error("Error parsing image URL", e);
        }
        return url;
    };

    const fetchTrash = async () => {
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/products/trash`);
            if (res && res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching trash products:', error);
            toast.error("Failed to load trash");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id: number) => {
        if (!confirm("Are you sure you want to restore this product?")) return;

        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/products/restore/${id}`, {
                method: "PUT",
            });

            if (res && res.ok) {
                toast.success("Product restored successfully");
                fetchTrash();
            } else {
                toast.error("Failed to restore product");
            }
        } catch (error) {
            console.error("Error restoring product:", error);
            toast.error("Error restoring product");
        }
    };

    const columns = [
        { header: "ID", accessorKey: "id" },
        {
            header: "Image",
            accessorKey: "imageUrl",
            cell: (item: any) => {
                const img = getImageUrl(item.imageUrl);
                return img ? (
                    <img src={img} alt={item.name} className="h-10 w-10 object-cover rounded" />
                ) : "No Image";
            }
        },
        { header: "Name", accessorKey: "name" },
        { header: "Price", accessorKey: "price", cell: (item: any) => `₹${item.price}` },
        { header: "Category", accessorKey: "category" },
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
                    <Link href="/products">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products Trash</h1>
                    <p className="text-muted-foreground">Manage deleted products</p>
                </div>
            </div>

            {loading ? (
                <p>Loading trash...</p>
            ) : (
                <TrashTable
                    resourceName="products"
                    data={products}
                    columns={columns}
                    onRestore={handleRestore}
                />
            )}
        </div>
    );
}
