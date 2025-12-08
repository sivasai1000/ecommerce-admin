"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function NewBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("category", category);
        formData.append("author", "Admin");

        if (selectedFile) {
            formData.append("image", selectedFile);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to create blog");
            }

            router.push("/blogs");
            router.refresh();
        } catch (error: any) {
            console.error("Error creating blog:", error);
            alert(error.message || "Failed to create blog");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">Create New Blog</h1>

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
                            defaultValue={category && categories.includes(category) ? category : undefined}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
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
                        <Label className="text-sm font-medium text-muted-foreground">Upload Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                            required
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
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Blog"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
