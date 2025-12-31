"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash, Loader2, Plus, HelpCircle } from "lucide-react";
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
    const { apiCall } = useAuth();
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
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs`);
            if (res && res.ok) {
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
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs`, {
                method: "POST",
                body: JSON.stringify(newFAQ)
            });

            if (res && res.ok) {
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
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs/${id}`, {
                method: "DELETE",
            });

            if (res && res.ok) {
                toast.success("FAQ deleted");
                setFaqs(prev => prev.filter(f => f.id !== id));
            } else {
                toast.error("Failed to delete FAQ");
            }
        } catch (error) {
            toast.error("Error deleting FAQ");
        }
    };

    if (loading) return <div className="flex bg-slate-50 dark:bg-slate-900 justify-center p-8 h-[50vh] items-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage frequently asked questions.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add FAQ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add New FAQ</DialogTitle>
                            <DialogDescription>
                                Create a new question and answer pair for your customers.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateFAQ} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Question</Label>
                                <Input
                                    placeholder="e.g. What is your return policy?"
                                    value={newFAQ.question}
                                    onChange={e => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                    required
                                    className="font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Answer</Label>
                                <Textarea
                                    placeholder="e.g. We accept returns within 30 days..."
                                    value={newFAQ.answer}
                                    onChange={e => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                    required
                                    className="min-h-[120px]"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create FAQ"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle>Existing Questions</CardTitle>
                    <CardDescription>Questions currently visible on the FAQ page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {faqs.map(faq => (
                            <div key={faq.id} className="flex flex-col sm:flex-row items-start justify-between p-5 border rounded-xl bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow">
                                <div className="space-y-2 flex-1 mr-4">
                                    <h3 className="font-semibold text-lg flex items-start gap-2">
                                        <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        {faq.question}
                                    </h3>
                                    <div className="pl-7 text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line leading-relaxed">
                                        {faq.answer}
                                    </div>
                                    <p className="pl-7 text-xs text-slate-400 pt-2">Created: {new Date(faq.createdAt).toLocaleDateString()}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteFAQ(faq.id)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0 mt-2 sm:mt-0"
                                >
                                    <Trash className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
                        {faqs.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                                <HelpCircle className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">No FAQs found</p>
                                <p className="text-sm text-slate-500">Add a new question to get started.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
