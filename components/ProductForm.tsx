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
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    category: string;
    subcategory: string;
    imageUrl: string;
    images: string[];
    stock: string;
    mrp: string;
    discount: string;
}

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
    productId?: string;
}

interface CategoryData {
    name: string;
    subcategories: string[];
}

export default function ProductForm({ initialData, isEditing, productId }: ProductFormProps) {
    // ... (Keep existing hooks and state: router, loading, formData, useEffects, handlers)
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
            images: [],
            stock: "0",
            mrp: "",
            discount: "0",
        }
    );

    // ... (Keep useEffects for initialData and categories)
    useEffect(() => {
        let initialSlots: (string | null)[] = [null, null, null, null];

        if (initialData?.images && initialData.images.length > 0) {
            initialData.images.forEach((url: string, idx: number) => {
                if (idx < 4) initialSlots[idx] = url;
            });
        } else if (initialData?.imageUrl) {
            try {
                if (initialData.imageUrl.startsWith('[') || initialData.imageUrl.startsWith('{')) {
                    const parsed = JSON.parse(initialData.imageUrl);
                    if (Array.isArray(parsed)) {
                        parsed.forEach((url: string, idx: number) => {
                            if (idx < 4) initialSlots[idx] = url;
                        });
                    } else if (parsed) {
                        initialSlots[0] = parsed as string;
                    }
                } else {
                    initialSlots[0] = initialData.imageUrl;
                }
            } catch (e) {
                initialSlots[0] = initialData.imageUrl;
            }
        }
        setImageSlots(initialSlots);
    }, [initialData]);

    const [imageSlots, setImageSlots] = useState<(string | File | null)[]>([null, null, null, null]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [isNewSubcategory, setIsNewSubcategory] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    let validCategories: CategoryData[] = [];
                    if (Array.isArray(data)) {
                        const isStringArray = data.length > 0 && typeof data[0] === 'string';
                        if (isStringArray) {
                            validCategories = data
                                .filter((c: any) => typeof c === 'string' && c.trim() !== '')
                                .map((c: string) => ({ name: c, subcategories: [] }));
                        } else {
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
            if (name === 'mrp' || name === 'discount') {
                const mrp = parseFloat(name === 'mrp' ? value : prev.mrp) || 0;
                const discount = parseFloat(name === 'discount' ? value : (prev.discount || "0")) || 0;
                if (mrp > 0) {
                    const calculatedPrice = mrp * (1 - discount / 100);
                    updated.price = calculatedPrice.toFixed(2);
                } else {
                    updated.price = "";
                }
            }
            return updated;
        });
    };

    const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newSlots = [...imageSlots];
            newSlots[index] = file;
            setImageSlots(newSlots);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newSlots = [...imageSlots];
        newSlots[index] = null;
        setImageSlots(newSlots);
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

            imageSlots.forEach((slot, index) => {
                if (slot instanceof File) {
                    submitFormData.append(`image${index + 1}`, slot);
                } else if (typeof slot === 'string') {
                    // Send existing URL as string so backend knows to keep it
                    submitFormData.append(`image${index + 1}`, slot);
                }
            });

            const token = localStorage.getItem("adminToken");
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
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        {isEditing ? "Edit Product" : "Create Product"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isEditing ? "Update product details and inventory." : "Add a new product to your catalog."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Discard
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : isEditing ? "Save Changes" : "Publish Product"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Classic White T-Shirt"
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
                                    placeholder="Product description..."
                                    rows={6}
                                    className="resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="mrp">MRP ($)</Label>
                                <Input
                                    id="mrp"
                                    name="mrp"
                                    type="number"
                                    step="0.01"
                                    value={formData.mrp}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
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
                                    placeholder="0"
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
                                    placeholder="Calculated automatically"
                                    readOnly
                                    className="bg-gray-50 font-medium"
                                />
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Auto-calculated</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Organization & Media */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                        value={formData.category || undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {/* Ensure current category is shown even if not in the list */}
                                                {formData.category && !categories.some(c => c.name === formData.category) && !isNewCategory && (
                                                    <SelectItem value={formData.category}>
                                                        {formData.category}
                                                    </SelectItem>
                                                )}

                                                {categories.map((cat, index) => (
                                                    <SelectItem key={`${cat.name}-${index}`} value={cat.name}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="new" className="text-blue-600 font-medium">+ New Category</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <Input
                                            value={formData.category}
                                            onChange={handleChange}
                                            name="category"
                                            placeholder="New Category Name"
                                            autoFocus
                                        />
                                        <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => setIsNewCategory(false)}>
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
                                        value={formData.subcategory || undefined}
                                        disabled={!formData.category}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Subcategory" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Ensure current subcategory is shown even if not in the list */}
                                            {formData.subcategory && !availableSubcategories.includes(formData.subcategory) && !isNewSubcategory && (
                                                <SelectItem value={formData.subcategory}>
                                                    {formData.subcategory}
                                                </SelectItem>
                                            )}

                                            {availableSubcategories.map((sub, index) => (
                                                <SelectItem key={`${sub}-${index}`} value={sub}>
                                                    {sub}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="new" className="text-blue-600 font-medium">+ New Subcategory</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <Input
                                            value={formData.subcategory}
                                            onChange={handleChange}
                                            name="subcategory"
                                            placeholder="New Subcategory Name"
                                        />
                                        <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => setIsNewSubcategory(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Product Media</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {imageSlots.map((slot, index) => (
                                    <div key={index} className="relative aspect-square border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 transition-colors bg-gray-50 dark:bg-gray-900 group">
                                        {slot ? (
                                            <>
                                                <img
                                                    src={slot instanceof File ? URL.createObjectURL(slot) : slot}
                                                    alt={`Product ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-gray-600">
                                                <Upload className="w-6 h-6 mb-2 opacity-50" />
                                                <span className="text-[10px] font-medium uppercase tracking-wider">Add</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileSelect(index, e)}
                                                />
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                Upload up to 4 images. <br /> Supported formats: .jpg, .png
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
