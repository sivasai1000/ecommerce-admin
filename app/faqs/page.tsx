"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Loader2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface FAQ {
    id: number;
    question: string;
    answer: string;
    createdAt: string;
}

export default function FAQsPage() {
    const { token } = useAuth();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // New FAQ Form
    const [newFAQ, setNewFAQ] = useState({
        question: "",
        answer: ""
    });

    useEffect(() => {
        if (token) fetchFAQs();
    }, [token]);

    const fetchFAQs = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs`);
            if (res.ok) {
                setFaqs(await res.json());
            }
        } catch (error) {
            toast.error("Failed to fetch FAQs");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFAQ = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newFAQ)
            });

            if (res.ok) {
                toast.success("FAQ created successfully!");
                setNewFAQ({ question: "", answer: "" });
                setIsDialogOpen(false);
                fetchFAQs();
            } else {
                toast.error("Failed to create FAQ");
            }
        } catch (error) {
            toast.error("Error creating FAQ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFAQ = async (id: number) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("FAQ deleted");
                setFaqs(prev => prev.filter(f => f.id !== id));
            } else {
                toast.error("Failed to delete FAQ");
            }
        } catch (error) {
            toast.error("Error deleting FAQ");
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
                    <p className="text-muted-foreground">Manage frequently asked questions for your store.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add FAQ
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New FAQ</DialogTitle>
                            <DialogDescription>
                                Create a new question and answer pair for the FAQ page.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateFAQ} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Question</Label>
                                <Input
                                    placeholder="e.g. What is your return policy?"
                                    value={newFAQ.question}
                                    onChange={e => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Answer</Label>
                                <Textarea
                                    placeholder="e.g. We accept returns within 30 days..."
                                    value={newFAQ.answer}
                                    onChange={e => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create FAQ"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Existing FAQs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {faqs.map(faq => (
                            <div key={faq.id} className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                                <div className="space-y-1">
                                    <h3 className="font-semibold">{faq.question}</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{faq.answer}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteFAQ(faq.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {faqs.length === 0 && <p className="text-center text-muted-foreground py-8">No FAQs found.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
