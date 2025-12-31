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
    login: (token: string, user: User) => void;
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
        const storedToken = localStorage.getItem("adminToken");
        const storedUser = localStorage.getItem("adminUser");

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data");
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("adminToken", newToken);
        localStorage.setItem("adminUser", JSON.stringify(newUser));
        router.push("/");
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        router.push("/login");
    };

    const apiCall = async (url: string, options: RequestInit = {}) => {
        const headers: any = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        const currentToken = localStorage.getItem("adminToken");
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
                login,
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
