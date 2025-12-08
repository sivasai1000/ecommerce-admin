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
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    category: string;
    subcategory: string;
    imageUrl: string;
    stock: string;
    mrp: string;
    discount?: string;
}

interface ProductFormProps {
    initialData?: ProductFormData;
    isEditing?: boolean;
    productId?: number;
}

interface CategoryData {
    name: string;
    subcategories: string[];
}

export default function ProductForm({ initialData, isEditing, productId }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>(
        initialData || {
            name: "",
            description: "",
            price: "",
            category: "",
            subcategory: "",
            imageUrl: "",
            stock: "0",
            mrp: "",
            discount: "0",
        }
    );

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [isNewSubcategory, setIsNewSubcategory] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    let validCategories: CategoryData[] = [];
                    if (Array.isArray(data)) {
                        // Check if data is array of strings (Old/Remote Backend) OR array of objects (New Local Backend)
                        const isStringArray = data.length > 0 && typeof data[0] === 'string';

                        if (isStringArray) {
                            validCategories = data
                                .filter((c: any) => typeof c === 'string' && c.trim() !== '')
                                .map((c: string) => ({ name: c, subcategories: [] }));
                        } else {
                            // Assume object format { name, subcategories }
                            validCategories = data.filter((c: any) => c && typeof c.name === 'string' && c.name.trim() !== '');
                        }
                    }
                    setCategories(validCategories);
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate price if MRP or Discount changes
            if (name === 'mrp' || name === 'discount') {
                const mrp = parseFloat(name === 'mrp' ? value : prev.mrp) || 0;
                const discount = parseFloat(name === 'discount' ? value : (prev.discount || "0")) || 0;

                if (mrp > 0) {
                    const calculatedPrice = mrp * (1 - discount / 100);
                    updated.price = calculatedPrice.toFixed(2);
                } else {
                    updated.price = ""; // Reset price if MRP is cleared
                }
            }

            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/products`;

            const method = isEditing ? "PUT" : "POST";

            const submitFormData = new FormData();
            submitFormData.append('name', formData.name);
            submitFormData.append('description', formData.description);
            submitFormData.append('price', formData.price);
            submitFormData.append('mrp', formData.mrp);
            submitFormData.append('stock', formData.stock);
            submitFormData.append('category', formData.category);
            submitFormData.append('subcategory', formData.subcategory);
            submitFormData.append('discount', formData.discount || "0");

            if (selectedFile) {
                submitFormData.append('image', selectedFile);
            }

            const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: submitFormData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to save product");
            }

            router.push("/products");
            router.refresh();
        } catch (error: any) {
            console.error("Error saving product:", error);
            alert(error.message || "Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    const selectedCategoryData = categories.find(c => c.name === formData.category);
    const availableSubcategories = selectedCategoryData ? selectedCategoryData.subcategories : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                />
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="mrp">MRP ($)</Label>
                    <Input
                        id="mrp"
                        name="mrp"
                        type="number"
                        step="0.01"
                        value={formData.mrp}
                        onChange={handleChange}
                        placeholder="Original Price"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Selling Price ($)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                        id="stock"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                        id="discount"
                        name="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    {!isNewCategory ? (
                        <Select
                            onValueChange={(value) => {
                                if (value === "new") {
                                    setIsNewCategory(true);
                                    setFormData((prev) => ({ ...prev, category: "", subcategory: "" }));
                                    setIsNewSubcategory(true);
                                } else {
                                    setIsNewCategory(false);
                                    setFormData((prev) => ({ ...prev, category: value, subcategory: "" }));
                                    setIsNewSubcategory(false);
                                }
                            }}
                            value={formData.category && categories.some(c => c.name === formData.category) ? formData.category : undefined}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat, index) => (
                                    <SelectItem key={`${cat.name}-${index}`} value={cat.name}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                                <SelectItem value="new">+ Add New Category</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
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
                    <Label htmlFor="subcategory">Subcategory</Label>
                    {!isNewSubcategory ? (
                        <Select
                            onValueChange={(value) => {
                                if (value === "new") {
                                    setIsNewSubcategory(true);
                                    setFormData((prev) => ({ ...prev, subcategory: "" }));
                                } else {
                                    setFormData((prev) => ({ ...prev, subcategory: value }));
                                }
                            }}
                            value={formData.subcategory && availableSubcategories.includes(formData.subcategory) ? formData.subcategory : undefined}
                            disabled={!formData.category} // Keep disabled if no category selected
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={availableSubcategories.length > 0 ? "Select a subcategory" : "No existing subcategories"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Available Subcategories</SelectLabel>
                                    {availableSubcategories.length > 0 ? (
                                        availableSubcategories.map((sub, index) => (
                                            <SelectItem key={`${sub}-${index}`} value={sub}>
                                                {sub}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none text-muted-foreground italic">
                                            No recent items found
                                        </div>
                                    )}
                                </SelectGroup>
                                <div className="h-px bg-muted my-1" /> {/* Manual separator or use SelectSeparator */}
                                <SelectGroup>
                                    <SelectItem value="new" className="text-blue-600 dark:text-blue-400 font-medium">
                                        + Add New Subcategory
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                id="subcategory"
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleChange}
                                placeholder="Enter subcategory name"
                                disabled={!formData.category}
                            />
                            <Button type="button" variant="ghost" onClick={() => setIsNewSubcategory(false)}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <Label>Product Image</Label>

                <div className="flex flex-col gap-4">
                    <Label className="text-sm font-medium">Upload Image</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setSelectedFile(file);
                            const previewUrl = URL.createObjectURL(file);
                            setFormData((prev) => ({ ...prev, imageUrl: previewUrl }));
                        }}
                        className="cursor-pointer"
                        required={!isEditing}
                    />

                    {formData.imageUrl && (
                        <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-gray-50">
                            <img
                                src={formData.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form>
    );
}
