"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowRight } from "lucide-react";

interface Category {
    name: string;
    subcategories: string[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Normalize data just in case
                let validCategories: Category[] = [];
                if (Array.isArray(data)) {
                    if (data.length > 0 && typeof data[0] === 'string') {
                        validCategories = data.map((c: string) => ({ name: c, subcategories: [] }));
                    } else {
                        validCategories = data;
                    }
                }
                setCategories(validCategories);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Categories</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Overview of all active product categories and subcategories.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat, idx) => (
                    <Card key={idx} className="bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold">{cat.name}</CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-4">
                                {cat.subcategories.length} Subcategories
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {cat.subcategories.length > 0 ? (
                                    cat.subcategories.map((sub, sIdx) => (
                                        <Badge key={sIdx} variant="secondary">
                                            {sub}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400 italic">No subcategories</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {categories.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No categories found. Categories are created automatically when you add products.
                    </div>
                )}
            </div>
        </div>
    );
}
