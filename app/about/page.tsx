"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";

export default function AboutPage() {
    const { token } = useAuth();

    const [formData, setFormData] = useState({ title: "", description: "" });
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (token) fetchPage();
    }, [token]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFormData({ title: data.title || "", description: data.description || "" });
                if (data.imageUrl) setPreviewUrl(data.imageUrl);
            }
        } catch (error) {
            toast.error("Failed to load About page");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            if (image) data.append("image", image);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/about`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: data
            });

            if (res.ok) {
                toast.success("About Us updated successfully");
            } else {
                toast.error("Failed to update About page");
            }
        } catch (error) {
            toast.error("Error saving About page");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold tracking-tight">About Us</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit About Us Content</CardTitle>
                    <CardDescription>Update the story, description, and featured image.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Featured Image</Label>
                            <div className="flex items-center gap-4">
                                {previewUrl && (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Recommended size: 1200x800px</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Our Story"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[300px] font-mono text-sm leading-relaxed"
                                placeholder="Tell your brand's story..."
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
