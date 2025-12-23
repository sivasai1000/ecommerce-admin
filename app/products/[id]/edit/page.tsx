"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/ProductForm";
import { useParams } from "next/navigation";

export default function EditProductPage() {
    const params = useParams();
    const id = params?.id;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <ProductForm initialData={product} isEditing productId={id as string} />
            </div>
        </div>
    );
}
