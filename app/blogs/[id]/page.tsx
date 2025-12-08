"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function EditBlogPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [author, setAuthor] = useState("");
    const [imageUrl, setImageUrl] = useState(""); // Existing URL

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    // Category Logic
    const [categories, setCategories] = useState<string[]>([]);
    const [isNewCategory, setIsNewCategory] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error("Failed to fetch blog categories", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${params?.id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch blog");
                }
                const data = await response.json();
                setTitle(data.title);
                setContent(data.content);
                setCategory(data.category);
                setAuthor(data.author);
                setImageUrl(data.imageUrl || "");
                setPreviewUrl(data.imageUrl || "");
            } catch (error) {
                console.error("Error fetching blog:", error);
                alert("Failed to load blog details");
            } finally {
                setLoading(false);
            }
        };

        if (params?.id) {
            fetchBlog();
        }
    }, [params?.id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("category", category);
        formData.append("author", author);

        if (selectedFile) {
            formData.append("image", selectedFile);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${params?.id}`, {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to update blog");
            }

            router.push("/blogs");
            router.refresh();
        } catch (error) {
            console.error("Error updating blog:", error);
            alert("Failed to update blog");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">Edit Blog</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    {!isNewCategory ? (
                        <Select
                            onValueChange={(value) => {
                                if (value === "new") {
                                    setIsNewCategory(true);
                                    setCategory("");
                                } else {
                                    setCategory(value);
                                }
                            }}
                            value={categories.includes(category) ? category : undefined} // Controlled value
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={category || "Select a category"} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                                <SelectItem value="new">+ Add New Category</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="Enter new category name"
                                required
                                autoFocus
                            />
                            <Button type="button" variant="ghost" onClick={() => setIsNewCategory(false)}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Blog Image</Label>
                    <div className="flex flex-col gap-4">
                        <Label className="text-sm font-medium text-muted-foreground">Change Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                        />
                        {previewUrl && (
                            <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-gray-50">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        required
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
