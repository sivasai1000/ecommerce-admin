"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function TermsPage() {
    const { token } = useAuth();

    const [formData, setFormData] = useState({ title: "", content: "" });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (token) fetchPage();
    }, [token]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFormData({ title: data.title, content: data.content });
            } else {
                toast.error("Terms page data not found");
            }
        } catch (error) {
            toast.error("Failed to load Terms page");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terms`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Terms and Conditions updated successfully");
            } else {
                toast.error("Failed to update Terms page");
            }
        } catch (error) {
            toast.error("Error saving Terms page");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Terms and Conditions</CardTitle>
                    <CardDescription>Update the title and content for the Terms and Conditions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Page Title</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Content (Markdown / Text)</Label>
                            <Textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="min-h-[400px] font-mono text-sm leading-relaxed"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Basic text formatting is supported. New lines created with Enter key.
                            </p>
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
