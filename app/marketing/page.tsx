"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Loader2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    linkUrl: string;
    isActive: boolean;
}

interface Subscriber {
    id: number;
    email: string;
    subscribedAt: string;
}

export default function MarketingPage() {
    const { apiCall } = useAuth();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Banner Form
    const [newBanner, setNewBanner] = useState<{
        title: string;
        subtitle: string;
        linkUrl: string;
        image: File | null;
    }>({
        title: "",
        subtitle: "",
        linkUrl: "",
        image: null
    });

    // About Us State
    const [aboutData, setAboutData] = useState({
        title: "",
        description: "",
        imageUrl: ""
    });
    const [aboutImage, setAboutImage] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Parallel fetches for efficiency
            // Note: Banners/About might be public, but using apiCall is fine for admin dashboard
            const [bannerRes, subRes, aboutRes] = await Promise.all([
                apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/banners`),
                apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subscribers`),
                apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/about`)
            ]);

            if (bannerRes && bannerRes.ok) setBanners(await bannerRes.json());
            if (subRes && subRes.ok) setSubscribers(await subRes.json());
            if (aboutRes && aboutRes.ok) {
                const about = await aboutRes.json();
                setAboutData({
                    title: about.title || "",
                    description: about.description || "",
                    imageUrl: about.imageUrl || ""
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch marketing data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewBanner({ ...newBanner, image: e.target.files[0] });
        }
    };

    const handleAboutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAboutImage(e.target.files[0]);
            // Preview
            setAboutData(prev => ({ ...prev, imageUrl: URL.createObjectURL(e.target.files![0]) }));
        }
    };

    const handleUpdateAbout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', aboutData.title);
            formData.append('description', aboutData.description);
            if (aboutImage) {
                formData.append('image', aboutImage); // Handle image upload specifically
            }

            // apiCall handles headers, but FormData needs specific handling (omit Content-Type to let browser set boundary)
            // apiCall method needs to handle FormData correctly if it automatically sets Content-Type: application/json
            // We might need to override headers in apiCall options.
            // Let's assume apiCall is smart enough or we pass empty headers to override default json type if generic.
            // Wait, AuthContext apiCall adds Content-Type: application/json by default.
            // We need to override it for FormData.
            // Hack/Fix: Pass headers with Content-Type as undefined to let browser set it?
            // Actually, typical fetch behavior requires removing the header.
            // Let's modify usage: apiCall merges headers. If we pass 'Content-Type': undefined meant to delete? No.
            // If AuthContext forces application/json, uploading files will fail.
            // Strategy: Check if Body is FormData in AuthContext? No, I can't change AuthContext right now easily without context switch.
            // Alternative: Use native fetch inside apiCall wrapper logic? 
            // Or just use native fetch here with manual token for the FILE UPLOAD parts only, to stay safe.
            // But I want to use apiCall for auth handling.
            // I'll stick to native fetch for file uploads with manual token retrieval from localStorage for now, 
            // OR I can use apiCall but I need to make sure I can unset Content-Type.

            // Let's use direct code here for safety on file uploads:
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/about`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}` // Manually set auth
                    // No Content-Type header so browser sets boundary
                },
                body: formData
            });

            if (res.ok) {
                toast.success("About Us updated successfully!");
            } else {
                toast.error("Failed to update About Us");
            }
        } catch (error) {
            toast.error("Error updating About Us");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateBanner = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newBanner.image) {
            toast.error("Please select an image");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', newBanner.title);
            formData.append('subtitle', newBanner.subtitle);
            formData.append('linkUrl', newBanner.linkUrl);
            formData.append('image', newBanner.image);

            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/banners`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                toast.success("Banner created!");
                setNewBanner({ title: "", subtitle: "", linkUrl: "", image: null });
                fetchData();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to create banner");
            }
        } catch (error) {
            toast.error("Error creating banner");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBanner = async (id: number) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/banners/${id}`, {
                method: "DELETE",
            });

            if (res && res.ok) {
                toast.success("Banner deleted");
                setBanners(prev => prev.filter(b => b.id !== id));
            } else {
                toast.error("Failed to delete banner");
            }
        } catch (error) {
            toast.error("Error deleting banner");
        }
    };

    if (loading) return <div className="flex bg-slate-50 dark:bg-slate-900 justify-center p-8 h-[50vh] items-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage content, banners and subscribers.</p>
            </div>

            <Tabs defaultValue="banners" className="space-y-4">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
                    <TabsTrigger value="banners">Hero Banners</TabsTrigger>
                    <TabsTrigger value="about">About Us</TabsTrigger>
                    <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                </TabsList>

                <TabsContent value="banners" className="space-y-4">
                    {/* Create Banner */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-lg font-medium">Add New Banner</CardTitle>
                                <CardDescription>Upload a new slide for the homepage.</CardDescription>
                            </div>
                            <Link href="/marketing/trash">
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 border-red-200">
                                    Trash
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={handleCreateBanner} className="grid gap-4 md:grid-cols-2 items-end">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="e.g. Summer Collection"
                                        value={newBanner.title}
                                        onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtitle</Label>
                                    <Input
                                        placeholder="e.g. Discover the new wave..."
                                        value={newBanner.subtitle}
                                        onChange={e => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Banner Image (Required)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            required
                                            className="h-10 cursor-pointer file:cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Link URL</Label>
                                    <Input
                                        placeholder="/products?category=Men"
                                        value={newBanner.linkUrl}
                                        onChange={e => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                                        className="h-10"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        Upload Banner
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Banner List */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {banners.map(banner => (
                            <Card key={banner.id} className="relative overflow-hidden group border-0 shadow-md ring-1 ring-slate-200 dark:ring-slate-800">
                                <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative">
                                    {banner.imageUrl ? (
                                        <img src={banner.imageUrl} alt={banner.title} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">
                                            <ImageIcon className="h-10 w-10" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBanner(banner.id)} className="shadow-lg">
                                            <Trash className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-4 bg-white dark:bg-slate-900">
                                    <h3 className="font-bold truncate text-lg">{banner.title || "Untitled"}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{banner.subtitle || "No subtitle"}</p>
                                    <p className="text-xs text-primary mt-3 truncate font-mono bg-primary/5 p-1 rounded w-fit px-2 max-w-full">
                                        {banner.linkUrl || "#"}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                        {banners.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400">
                                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                <p>No banners uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="about">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>About Us Content</CardTitle>
                            <CardDescription>Update company story and details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateAbout} className="space-y-6 max-w-3xl">
                                <div className="space-y-2">
                                    <Label>Page Title</Label>
                                    <Input
                                        value={aboutData.title}
                                        onChange={e => setAboutData({ ...aboutData, title: e.target.value })}
                                        placeholder="e.g. About Our Brand"
                                        className="h-10 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <textarea
                                        className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                        value={aboutData.description}
                                        onChange={e => setAboutData({ ...aboutData, description: e.target.value })}
                                        placeholder="Tell your brand story..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Highlight Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAboutImageChange}
                                        className="cursor-pointer"
                                    />
                                    {aboutData.imageUrl && (
                                        <div className="mt-4 relative h-64 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                                            <img
                                                src={aboutData.imageUrl}
                                                alt="About Us"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subscribers">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Newsletter Subscribers</CardTitle>
                            <CardDescription>Total Subscribers: {subscribers.length}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">ID</TableHead>
                                            <TableHead>Email Address</TableHead>
                                            <TableHead className="text-right">Subscribed Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscribers.map(sub => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-mono text-xs">{sub.id}</TableCell>
                                                <TableCell className="font-medium">{sub.email}</TableCell>
                                                <TableCell className="text-right text-slate-500">
                                                    {new Date(sub.subscribedAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {subscribers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                    No subscribers yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
