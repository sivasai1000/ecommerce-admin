"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Loader2, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

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
    const { token } = useAuth();
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
        if (token) fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const [bannerRes, subRes, aboutRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banners`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subscribers`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`)
            ]);

            if (bannerRes.ok) setBanners(await bannerRes.json());
            if (subRes.ok) setSubscribers(await subRes.json());
            if (aboutRes.ok) {
                const about = await aboutRes.json();
                setAboutData({
                    title: about.title || "",
                    description: about.description || "",
                    imageUrl: about.imageUrl || ""
                });
            }
        } catch (error) {
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
                formData.append('image', aboutImage);
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/about`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                toast.success("About Us updated successfully!");
                // No need to clear form, we want to keep the current values
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/banners/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("Banner deleted");
                setBanners(prev => prev.filter(b => b.id !== id));
            } else {
                toast.error("Failed to delete banner");
            }
        } catch (error) {
            toast.error("Error deleting banner");
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Marketing & Content</h1>
            <p className="text-muted-foreground">Manage homepage banners, about us content, and view newsletter subscribers.</p>

            <Tabs defaultValue="banners" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="banners">Hero Banners</TabsTrigger>
                    <TabsTrigger value="about">About Us</TabsTrigger>
                    <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                </TabsList>

                <TabsContent value="banners" className="space-y-4">
                    {/* Create Banner */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Banner</CardTitle>
                            <CardDescription>Upload a new slide for the homepage hero section.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateBanner} className="grid gap-4 md:grid-cols-2 items-end">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="e.g. Summer Collection"
                                        value={newBanner.title}
                                        onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtitle</Label>
                                    <Input
                                        placeholder="e.g. Discover the new wave..."
                                        value={newBanner.subtitle}
                                        onChange={e => setNewBanner({ ...newBanner, subtitle: e.target.value })}
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
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Link URL</Label>
                                    <Input
                                        placeholder="/products?category=Men"
                                        value={newBanner.linkUrl}
                                        onChange={e => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        Upload Banner
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Banner List */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {banners.map(banner => (
                            <Card key={banner.id} className="relative overflow-hidden group">
                                <div className="aspect-video bg-muted relative">
                                    <img src={banner.imageUrl} alt={banner.title} className="object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBanner(banner.id)}>
                                            <Trash className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold truncate">{banner.title}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                                    <p className="text-xs text-blue-500 mt-2 truncate">{banner.linkUrl}</p>
                                </CardContent>
                            </Card>
                        ))}
                        {banners.length === 0 && <p className="text-muted-foreground col-span-full">No banners found.</p>}
                    </div>
                </TabsContent>

                <TabsContent value="about">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Us Page Content</CardTitle>
                            <CardDescription>Update the content displayed on the customer "About Us" page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateAbout} className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <Label>Page Title</Label>
                                    <Input
                                        value={aboutData.title}
                                        onChange={e => setAboutData({ ...aboutData, title: e.target.value })}
                                        placeholder="e.g. About Our Brand"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description / Story</Label>
                                    <textarea
                                        className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    />
                                    {aboutData.imageUrl && (
                                        <div className="mt-4 relative h-64 w-full rounded-lg overflow-hidden border">
                                            <img
                                                src={aboutData.imageUrl}
                                                alt="About Us"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                </div>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subscribers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Newsletter Subscribers ({subscribers.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Subscribed At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscribers.map(sub => (
                                        <TableRow key={sub.id}>
                                            <TableCell>{sub.id}</TableCell>
                                            <TableCell>{sub.email}</TableCell>
                                            <TableCell>{new Date(sub.subscribedAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    {subscribers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">No subscribers yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
