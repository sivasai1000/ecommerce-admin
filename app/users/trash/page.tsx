"use client";

import { useEffect, useState } from "react";
import { TrashTable } from "@/components/trash-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function UsersTrashPage() {
    const { apiCall } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = async () => {
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/users/trash`);
            if (res && res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching trash users:', error);
            toast.error("Failed to load trash");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id: number) => {
        if (!confirm("Are you sure you want to restore this user?")) return;

        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/users/restore/${id}`, {
                method: "PUT",
            });

            if (res && res.ok) {
                toast.success("User restored successfully");
                fetchTrash();
            } else {
                toast.error("Failed to restore user");
            }
        } catch (error) {
            console.error("Error restoring user:", error);
            toast.error("Error restoring user");
        }
    };

    const columns = [
        { header: "ID", accessorKey: "id" },
        { header: "Name", accessorKey: "name" },
        { header: "Email", accessorKey: "email" },
        { header: "Role", accessorKey: "role" },
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
                    <Link href="/users">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users Trash</h1>
                    <p className="text-muted-foreground">Manage deleted users</p>
                </div>
            </div>

            {loading ? (
                <p>Loading trash...</p>
            ) : (
                <TrashTable
                    resourceName="users"
                    data={users}
                    columns={columns}
                    onRestore={handleRestore}
                />
            )}
        </div>
    );
}
