"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`);
            if (response.ok) {
                const data = await response.json();
                setBlogs(data);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchBlogs(); // Refresh list
            } else {
                alert("Failed to delete blog");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            alert("Error deleting blog");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Blogs Management</h1>
                <Link href="/blogs/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Blog
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Blogs</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading blogs...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blogs.length > 0 ? (
                                    blogs.map((blog: any) => (
                                        <TableRow key={blog.id}>
                                            <TableCell className="font-medium">{blog.title}</TableCell>
                                            <TableCell>{blog.category}</TableCell>
                                            <TableCell>{blog.author}</TableCell>
                                            <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Link href={`/blogs/${blog.id}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(blog.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No blogs found</TableCell>
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
