"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    logout: () => void;
    isLoading: boolean;
    apiCall: (url: string, options?: RequestInit) => Promise<Response | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Load from localStorage on mount
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        setIsLoading(false);
    }, []);

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const apiCall = async (url: string, options: RequestInit = {}) => {
        const headers: any = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        const currentToken = localStorage.getItem("token");
        if (currentToken) {
            headers["Authorization"] = `Bearer ${currentToken}`;
        }

        try {
            const res = await fetch(url, { ...options, headers });

            if (res.status === 401 || res.status === 403) {
                logout();
                return null;
            }
            return res;
        } catch (error) {
            console.error("API Call failed", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                logout,
                isLoading,
                apiCall
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
