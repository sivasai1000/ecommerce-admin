"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function BlogsPage() {
    const { apiCall } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        try {
            // Using apiCall ensures consistency, though blogs public endpoint might allow open access, 
            // using apiCall is safe if backend supports both.
            const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`);
            if (response && response.ok) {
                const data = await response.json();
                setBlogs(data);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error("Failed to load blogs");
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
            const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`, {
                method: "DELETE",
            });

            if (response && response.ok) {
                fetchBlogs(); // Refresh list
                toast.success("Blog deleted successfully");
            } else {
                toast.error("Failed to delete blog");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            toast.error("Error deleting blog");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your blog posts and content</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Link href="/blogs/new" className="flex-1 sm:flex-none">
                        <Button className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Blog
                        </Button>
                    </Link>
                    <Link href="/blogs/trash">
                        <Button variant="outline" className="text-red-500 hover:text-red-600 border-red-200">
                            Trash
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle>All Posts</CardTitle>
                    <CardDescription>A list of all published blog posts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : blogs.length > 0 ? (
                                    blogs.map((blog: any) => (
                                        <TableRow key={blog.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                                        <FileText className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <span className="truncate max-w-[200px] sm:max-w-md" title={blog.title}>
                                                        {blog.title}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal capitalize">
                                                    {blog.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500">{blog.author}</TableCell>
                                            <TableCell className="text-slate-500 whitespace-nowrap">
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/blogs/${blog.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-50"
                                                        onClick={() => handleDelete(blog.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No blog posts found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
