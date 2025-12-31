"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Plus, Tag, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CouponsPage() {
    const { apiCall } = useAuth();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        value: "",
        discountType: "percentage",
        expiryDate: "",
        minOrderValue: "0",
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons`);
            if (res && res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/${id}`, {
                method: "DELETE",
            });
            if (res && res.ok) {
                setCoupons(coupons.filter((c) => c.id !== id));
                toast.success("Coupon deleted");
            } else {
                toast.error("Failed to delete coupon");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting coupon");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/create`, {
                method: "POST",
                body: JSON.stringify(formData),
            });
            if (res && res.ok) {
                setOpen(false);
                fetchCoupons();
                setFormData({ code: "", value: "", discountType: "percentage", expiryDate: "", minOrderValue: "0" });
                toast.success("Coupon created successfully");
            } else {
                toast.error("Failed to create coupon");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error creating coupon");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage discount codes and promotions</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex-1 sm:flex-none">
                                <Plus className="mr-2 h-4 w-4" /> Add Coupon
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Coupon</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Coupon Code</Label>
                                    <div className="relative">
                                        <Tag className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            required
                                            className="pl-8 uppercase"
                                            placeholder="SUMMER25"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={formData.discountType}
                                            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="value">Value</Label>
                                        <Input
                                            id="value"
                                            type="number"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            required
                                            placeholder="10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minOrderValue">Min Order ($)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="minOrderValue"
                                            type="number"
                                            value={formData.minOrderValue}
                                            onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                            placeholder="0"
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="expiry"
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full">Create Coupon</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Link href="/coupons/trash">
                        <Button variant="outline" className="text-red-500 hover:text-red-600 border-red-200">
                            Trash
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle>Active Coupons</CardTitle>
                    <CardDescription>List of currently active discount codes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead className="whitespace-nowrap">Min Order</TableHead>
                                    <TableHead>Expiry</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No active coupons found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    coupons.map((coupon) => (
                                        <TableRow key={coupon.id}>
                                            <TableCell className="font-medium font-mono">
                                                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                                                    {coupon.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize text-slate-600 dark:text-slate-400">
                                                {coupon.discountType}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {coupon.discountType === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                                            </TableCell>
                                            <TableCell>${coupon.minOrderValue || 0}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {coupon.expiryDate ? (
                                                    <span className={new Date(coupon.expiryDate) < new Date() ? "text-red-500 font-medium" : ""}>
                                                        {new Date(coupon.expiryDate).toLocaleDateString()}
                                                    </span>
                                                ) : <span className="text-muted-foreground">Permanent</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
