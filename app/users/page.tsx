"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
    const [selectedUserForRole, setSelectedUserForRole] = useState<{ id: number; name: string; currentRole: string } | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            console.log("Current API URL:", process.env.NEXT_PUBLIC_API_URL);
            try {
                const token = localStorage.getItem("adminToken");
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
            const token = localStorage.getItem("adminToken");
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

    const handleUpdateRole = (user: any) => {
        setSelectedUserForRole({ id: user.id, name: user.name, currentRole: user.role });
        setRoleConfirmOpen(true);
    };

    const confirmUpdateRole = async () => {
        if (!selectedUserForRole) return;

        const { id, currentRole } = selectedUserForRole;
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                setUsers((prev: any) =>
                    prev.map((user: any) =>
                        user.id === id ? { ...user, role: newRole } : user
                    )
                );
            } else {
                alert("Failed to update role");
            }
        } catch (error) {
            console.error("Error updating user role:", error);
        } finally {
            setRoleConfirmOpen(false);
            setSelectedUserForRole(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setUsers((prev: any) => prev.filter((user: any) => user.id !== id));
            } else {
                alert("Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Registered Users</CardTitle>
                    <Button variant="outline" asChild className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Link href="/users/trash">
                            View Trash
                        </Link>
                    </Button>
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
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? (
                                    users
                                        .filter((user: any) => {
                                            const currentUserStr = localStorage.getItem("adminUser");
                                            const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
                                            return user.id !== currentUser?.id;
                                        })
                                        .map((user: any) => {
                                            const currentUserStr = localStorage.getItem("adminUser");
                                            const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
                                            const isSuperAdmin = currentUser?.email === 'admin@gmail.com';
                                            const isTargetAdmin = user.role === 'admin' || user.role === 'Admin';
                                            const isTargetSuperAdmin = user.email === 'admin@gmail.com';

                                            return (
                                                <TableRow key={user.id}>
                                                    <TableCell>{user.id}</TableCell>
                                                    <TableCell>{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={isTargetAdmin ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600"}
                                                            disabled={!isSuperAdmin}
                                                            onClick={() => handleUpdateRole(user)}
                                                        >
                                                            {isTargetAdmin ? "Admin" : "User"}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant={user.isActive ? "ghost" : "destructive"}
                                                            size="sm"
                                                            className={user.isActive ? "text-green-600" : "text-red-600"}
                                                            // Only Super Admin can deactivate other Admins. Everyone can deactivate Users.
                                                            disabled={isTargetAdmin && !isSuperAdmin}
                                                            onClick={() => handleToggleStatus(user.id, !user.isActive)}
                                                        >
                                                            {user.isActive ? "Active" : "Inactive"}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            // Disable delete if target is Super Admin (nobody can delete Super Admin).
                                                            // Disable delete if target is Admin AND current user is NOT Super Admin.
                                                            disabled={isTargetSuperAdmin || (isTargetAdmin && !isSuperAdmin)}
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
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

            <AlertDialog open={roleConfirmOpen} onOpenChange={setRoleConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change User Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change the role of <strong>{selectedUserForRole?.name}</strong> to{' '}
                            <strong>{selectedUserForRole?.currentRole === 'admin' ? 'User' : 'Admin'}</strong>?
                            {selectedUserForRole?.currentRole !== 'admin' && (
                                <p className="mt-2 text-yellow-600 dark:text-yellow-400">
                                    Warning: Granting Admin privileges allows this user to manage products and orders.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmUpdateRole}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
