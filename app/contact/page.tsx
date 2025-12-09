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

export default function ContactPage() {
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        intro: "",
        email: "",
        phone: "",
        address: "",
        hours: ""
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (token) fetchPage();
    }, [token]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                let parsedContent = { intro: "", email: "", phone: "", address: "", hours: "" };
                try {
                    parsedContent = JSON.parse(data.content);
                } catch (e) {
                    // Fallback if content was not JSON (legacy HTML)
                    console.warn("Content is not JSON, resetting fields");
                }
                setFormData({
                    title: data.title,
                    intro: parsedContent.intro || "",
                    email: parsedContent.email || "",
                    phone: parsedContent.phone || "",
                    address: parsedContent.address || "",
                    hours: parsedContent.hours || ""
                });
            } else {
                toast.error("Contact page data not found");
            }
        } catch (error) {
            toast.error("Failed to load contact page");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Construct JSON content
            const contentJson = JSON.stringify({
                intro: formData.intro,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                hours: formData.hours
            });

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    content: contentJson
                })
            });

            if (res.ok) {
                toast.success("Contact page updated successfully");
            } else {
                toast.error("Failed to update contact page");
            }
        } catch (error) {
            toast.error("Error saving contact page");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Contact Page</CardTitle>
                    <CardDescription>Update the details shown on the Contact Us page.</CardDescription>
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
                            <Label>Intro Text</Label>
                            <Textarea
                                value={formData.intro}
                                onChange={e => setFormData({ ...formData, intro: e.target.value })}
                                placeholder="We'd love to hear from you..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="support@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Textarea
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="123 Street Name, City, Country"
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Support Hours</Label>
                            <Input
                                value={formData.hours}
                                onChange={e => setFormData({ ...formData, hours: e.target.value })}
                                placeholder="Mon-Fri, 9 AM - 6 PM EST"
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
