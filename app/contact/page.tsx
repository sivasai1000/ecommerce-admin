"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
    const { apiCall } = useAuth();

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
        fetchPage();
    }, []);

    const fetchPage = async () => {
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`);
            if (res && res.ok) {
                const data = await res.json();
                let parsedContent = { intro: "", email: "", phone: "", address: "", hours: "" };
                try {
                    // Handle case where content might be stringified JSON or just plain text legacy
                    parsedContent = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
                } catch (e) {
                    console.warn("Content parsing error or legacy format", e);
                }

                // Ensure defaults
                parsedContent = parsedContent || {};

                setFormData({
                    title: data.title || "",
                    intro: parsedContent.intro || "",
                    email: parsedContent.email || "",
                    phone: parsedContent.phone || "",
                    address: parsedContent.address || "",
                    hours: parsedContent.hours || ""
                });
            } else {
                // If 404, might just be empty, don't error toast heavily
                console.log("Contact page data not found or init");
            }
        } catch (error) {
            console.error(error);
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

            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
                method: "PUT",
                body: JSON.stringify({
                    title: formData.title,
                    content: contentJson
                })
            });

            if (res && res.ok) {
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

    if (loading) return <div className="flex bg-slate-50 dark:bg-slate-900 justify-center p-8 h-[50vh] items-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold tracking-tight">Contact Us Page</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>Edit Content</CardTitle>
                        <CardDescription>Update the details shown on your store's contact page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Page Heading</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Get in Touch"
                                    className="font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Introductory Text</Label>
                                <Textarea
                                    value={formData.intro}
                                    onChange={e => setFormData({ ...formData, intro: e.target.value })}
                                    placeholder="We'd love to hear from you..."
                                    className="min-h-[120px] resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email Address</Label>
                                    <Input
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="support@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Physical Address</Label>
                                <Textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="123 Street Name, City, Country"
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Support Hours</Label>
                                <Input
                                    value={formData.hours}
                                    onChange={e => setFormData({ ...formData, hours: e.target.value })}
                                    placeholder="Mon-Fri, 9 AM - 6 PM EST"
                                />
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

                {/* Preview / Info Card */}
                <div className="space-y-6">
                    <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm">Preview Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-500 space-y-2">
                            <p>Make sure to include country code in phone numbers.</p>
                            <p>Addresses should be formatted as they should appear on a map.</p>
                            <p>Emails provided here will be public to crawl bots potentially.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
