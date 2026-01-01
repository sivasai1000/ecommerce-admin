"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
    const [contactInfo, setContactInfo] = useState({
        address: "123 Fashion Ave, New York, NY 10001",
        phone: "+1 (555) 123-4567",
        email: "support@FUNSTORE.com"
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contactRes, catRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, { cache: 'no-store' }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`, { next: { revalidate: 3600 } })
                ]);

                if (contactRes.ok) {
                    const data = await contactRes.json();
                    if (data && data.content) {
                        let parsed = data.content;
                        if (typeof parsed === 'string') {
                            try { parsed = JSON.parse(parsed); } catch (e) { }
                        }

                        setContactInfo({
                            address: parsed.address || "123 Fashion Ave, New York, NY 10001",
                            phone: parsed.phone || "+1 (555) 123-4567",
                            email: parsed.email || "support@FUNSTORE.com"
                        });
                    }
                }

                if (catRes.ok) {
                    const params = await catRes.json();
                    setCategories(params || []);
                }
            } catch (err) {
                console.error("Failed to fetch footer data", err);
            }
        };

        fetchData();
    }, []);

    return (
        <footer className="bg-stone-100 dark:bg-stone-950 text-stone-600 dark:text-stone-400 py-16 border-t border-stone-200 dark:border-stone-800">
            <div className="w-full max-w-[1400px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">
                            FUNSTORE.
                        </h3>
                        <p className="text-sm leading-relaxed">
                            Curated fashion and lifestyle essentials for the modern aesthetic. Quality, design, and sustainability at our core.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-stone-900 dark:text-stone-50 uppercase tracking-wider text-sm">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">New Arrivals</Link></li>
                            {categories.slice(0, 2).map((cat: any) => (
                                <li key={cat.name}>
                                    <Link href={`/products?category=${encodeURIComponent(cat.name)}`} className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                            <li><Link href="/deals" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">Sale</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-stone-900 dark:text-stone-50 uppercase tracking-wider text-sm">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/contact" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">FAQs</Link></li>
                            <li><Link href="/shipping" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">Shipping Info</Link></li>
                            <li><Link href="/privacy" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">Terms and Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-stone-900 dark:text-stone-50 uppercase tracking-wider text-sm">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 shrink-0" />
                                <span className="whitespace-pre-wrap">{contactInfo.address}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 shrink-0" />
                                <span>{contactInfo.phone}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 shrink-0" />
                                <span>{contactInfo.email}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-stone-200 dark:border-stone-800 pt-8 text-center text-xs uppercase tracking-widest text-stone-500">
                    <p>&copy; {new Date().getFullYear()} FUNSTORE. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
