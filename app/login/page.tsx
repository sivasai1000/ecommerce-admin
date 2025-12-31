"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LockKeyhole, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        mobile: "" // Added mobile just in case, though usually email is primary for admin
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                if (data.user.role === 'admin' || data.user.role === 'Admin') {
                    toast.success("Welcome back, Admin!");
                    // Use the context login method to update state and redirect
                    login(data.token, data.user);
                } else {
                    toast.error("Access Denied: You are not an admin.");
                }
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="absolute inset-0 bg-grid-slate-200/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none" />

            <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-slate-100/10 transition-all duration-300 hover:shadow-primary/5">
                <CardHeader className="space-y-1 text-center pb-8 pt-10">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-primary/20">
                        <LockKeyhole className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                        Admin Portal
                    </CardTitle>
                    <CardDescription className="text-base text-slate-500 dark:text-slate-400">
                        Enter your credentials to access the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email Address
                            </Label>
                            <div className="relative">
                                <div className="absolute left-3 top-2.5 text-slate-500">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="pl-10 h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-2.5 text-slate-500">
                                    <LockKeyhole className="h-5 w-5" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="pl-10 h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-mono tracking-widest"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="pb-8 justify-center">
                    <p className="text-xs text-center text-slate-400 dark:text-slate-500 max-w-[18rem]">
                        Protected by secure admin guard. Unauthorized access attempts will be logged.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
