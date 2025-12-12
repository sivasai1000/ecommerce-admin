"use client";

import { useEffect, useState } from "react";
import { TrashTable } from "@/components/trash-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UsersTrashPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchTrash = async () => {
        try {
            const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/trash`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching trash users:', error);
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
            const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/restore/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                // Refresh list
                fetchTrash();
                // Optional: Show toast
            } else {
                alert("Failed to restore user");
            }
        } catch (error) {
            console.error("Error restoring user:", error);
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
