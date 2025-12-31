"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Truck } from "lucide-react";
import { toast } from "sonner";

export default function ShippingPage() {
    const { apiCall } = useAuth();
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPage();
    }, []);

    const fetchPage = async () => {
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping`);
            if (res && res.ok) {
                const data = await res.json();
                setFormData({ title: data.title || "", content: data.content || "" });
            } else {
                // If 404, standard logic
                console.log("Shipping page data not found or init");
            }
        } catch (error) {
            toast.error("Failed to load shipping page");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping`, {
                method: "PUT",
                body: JSON.stringify(formData)
            });

            if (res && res.ok) {
                toast.success("Shipping page updated successfully");
            } else {
                toast.error("Failed to update shipping page");
            }
        } catch (error) {
            toast.error("Error saving shipping page");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex bg-slate-50 dark:bg-slate-900 justify-center p-8 h-[50vh] items-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold tracking-tight">Shipping & Returns</h1>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-slate-500" />
                        Edit Policy Content
                    </CardTitle>
                    <CardDescription>Update the shipping capability and return policy details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Page Title</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g. Shipping & Returns Policy"
                                className="font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Content (Markdown / Text)</Label>
                            <Textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="min-h-[400px] font-mono text-sm leading-relaxed"
                                required
                                placeholder="## Shipping Policy..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Markdown formatting supported. Use ## for headers, **bold**, etc.
                            </p>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto min-w-[150px]">
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
