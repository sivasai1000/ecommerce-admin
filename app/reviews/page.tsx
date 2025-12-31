"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Trash2, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface Review {
    id: number;
    productId: number;
    userId: number;
    userName: string;
    productName: string;
    productImage: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function ReviewsPage() {
    const { apiCall } = useAuth(); // Removed token destructuring, use apiCall instead
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            // Using apiCall already handles Authorization header
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin`);
            if (res && res.ok) {
                setReviews(await res.json());
            }
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status })
            });

            if (res && res.ok) {
                toast.success(`Review ${status}`);
                fetchReviews();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating review");
        }
    };

    const deleteReview = async (id: number) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin/${id}`, {
                method: "DELETE",
            });

            if (res && res.ok) {
                toast.success("Review deleted");
                fetchReviews();
            } else {
                toast.error("Failed to delete review");
            }
        } catch (error) {
            toast.error("Error deleting review");
        }
    };

    const filteredReviews = filter === "all" ? reviews : reviews.filter(r => r.status === filter);

    if (loading) return <div className="flex bg-slate-50 dark:bg-slate-900 justify-center p-8 h-[50vh] items-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
                    <p className="text-slate-500 dark:text-slate-400">Moderate customer feedback and ratings</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Link href="/reviews/trash">
                        <Button variant="outline" className="text-red-500 hover:text-red-600 border-red-200">
                            Trash
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle>Moderate Reviews</CardTitle>
                    <CardDescription>Approve or reject customer reviews.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Product</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="min-w-[300px]">Comment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReviews.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <MessageSquare className="h-8 w-8 text-slate-300 mb-2" />
                                                <p>No reviews found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReviews.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                                        {review.productImage ? (
                                                            <img src={review.productImage} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Img</div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-sm line-clamp-2" title={review.productName}>
                                                        {review.productName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{review.userName}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded w-fit">
                                                    <Star className="w-3 h-3 fill-current mr-1" />
                                                    <span className="font-semibold text-xs">{review.rating}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                                <div className="line-clamp-2" title={review.comment}>
                                                    {review.comment}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    review.status === 'approved' ? 'default' :
                                                        review.status === 'rejected' ? 'destructive' : 'secondary'
                                                } className="capitalize">
                                                    {review.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {review.status === 'pending' && (
                                                        <>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateStatus(review.id, 'approved')}>
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateStatus(review.id, 'rejected')}>
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {review.status === 'rejected' && (
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateStatus(review.id, 'approved')}>
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteReview(review.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
