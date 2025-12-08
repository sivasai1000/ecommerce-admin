"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Page {
    id: number;
    slug: string;
    title: string;
    updatedAt: string;
}

export default function PagesList() {
    const { token } = useAuth();
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newPage, setNewPage] = useState({ title: "", slug: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (token) fetchPages();
    }, [token]);

    const fetchPages = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setPages(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch pages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePage = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Auto-generate slug if empty (simple version)
            const slugToSend = newPage.slug || newPage.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ...newPage, slug: slugToSend })
            });

            if (res.ok) {
                toast.success("Page created successfully");
                setNewPage({ title: "", slug: "" });
                setIsDialogOpen(false);
                fetchPages();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to create page");
            }
        } catch (error) {
            toast.error("Error creating page");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePage = async (slug: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pages/${slug}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Page deleted");
                fetchPages();
            } else {
                toast.error("Failed to delete page");
            }
        } catch (error) {
            toast.error("Error deleting page");
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Pages</h1>
                    <p className="text-muted-foreground">Manage dynamic pages like Privacy, Terms, etc.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Page
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Page</DialogTitle>
                            <DialogDescription>
                                Add a new dynamic page to your store.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreatePage} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Page Title</Label>
                                <Input
                                    placeholder="e.g. Terms of Service"
                                    value={newPage.title}
                                    onChange={e => setNewPage({ ...newPage, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (Optional)</Label>
                                <Input
                                    placeholder="e.g. terms-of-service"
                                    value={newPage.slug}
                                    onChange={e => setNewPage({ ...newPage, slug: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">url key, e.g. /terms-of-service</p>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Page"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Pages</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.map(page => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">{page.title}</TableCell>
                                    <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                                    <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Link href={`/pages/${page.slug}`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.slug)} className="text-red-500 hover:text-red-700">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {pages.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No pages found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
