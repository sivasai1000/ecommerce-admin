"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    const { token } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (token) fetchReviews();
    }, [token]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
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

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Product Reviews</h1>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Moderate Reviews</CardTitle>
                    <CardDescription>Approve or reject customer reviews.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead className="w-[40%]">Comment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No reviews found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {review.productImage && (
                                                    <img src={review.productImage} className="w-8 h-8 rounded object-cover" />
                                                )}
                                                <span className="font-medium text-sm max-w-[150px] truncate" title={review.productName}>
                                                    {review.productName}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{review.userName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                                                {review.rating}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {review.comment}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                review.status === 'approved' ? 'default' :
                                                    review.status === 'rejected' ? 'destructive' : 'secondary'
                                            }>
                                                {review.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {review.status === 'pending' && (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateStatus(review.id, 'approved')}>
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateStatus(review.id, 'rejected')}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {review.status === 'rejected' && (
                                                    <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateStatus(review.id, 'approved')}>
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-600" onClick={() => deleteReview(review.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
