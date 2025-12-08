"use client";

import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <ProductForm />
            </div>
        </div>
    );
}
