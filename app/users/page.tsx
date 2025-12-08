"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            console.log("Current API URL:", process.env.NEXT_PUBLIC_API_URL);
            try {
                const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleToggleStatus = async (id: number, isActive: boolean) => {
        try {
            const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ isActive }),
            });
            if (response.ok) {
                setUsers((prev: any) =>
                    prev.map((user: any) =>
                        user.id === id ? { ...user, isActive } : user
                    )
                );
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading users...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? (
                                    users.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.id}</TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant={user.isActive ? "destructive" : "default"}
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(user.id, !user.isActive)}
                                                >
                                                    {user.isActive ? "Deactivate" : "Activate"}
                                                </Button>
                                            </TableCell>
                                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No users found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
