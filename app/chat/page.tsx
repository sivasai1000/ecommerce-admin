"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, User, Search, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number | null;
    message: string;
    is_admin_sender: number | boolean;
    created_at: string;
    is_read: number | boolean;
}

export default function ChatPage() {
    const { token, apiCall } = useAuth();
    const [conversations, setConversations] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch list of users who have chatted
    const fetchConversations = async () => {
        if (!token) return;
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations`);
            if (res && res.ok) {
                const data = await res.json();
                setConversations(data.data);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    useEffect(() => {
        fetchConversations();
        // Poll for new conversations
        const interval = setInterval(fetchConversations, 15000);
        return () => clearInterval(interval);
    }, [token]);

    // Fetch messages for selected user
    const fetchMessages = async (userId: number) => {
        if (!token) return;
        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/history/${userId}`);
            if (res && res.ok) {
                const data = await res.json();
                setMessages(data.data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
            // Mark as read logic could go here
            const interval = setInterval(() => fetchMessages(selectedUser.id), 5000); // 5s poll for active chat
            return () => clearInterval(interval);
        }
    }, [selectedUser, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || !token) return;

        const tempMessage = newMessage;
        setNewMessage("");

        try {
            const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/send`, {
                method: "POST",
                body: JSON.stringify({
                    message: tempMessage,
                    receiverId: selectedUser.id,
                }),
            });

            if (res && res.ok) {
                fetchMessages(selectedUser.id);
            } else {
                toast.error("Failed to send message");
                setNewMessage(tempMessage);
            }
        } catch (error) {
            toast.error("Error sending message");
            setNewMessage(tempMessage);
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-4">
            {/* Sidebar: User List */}
            <Card className="w-1/3 min-w-[300px] flex flex-col">
                <CardHeader className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Conversations</CardTitle>
                        <Button variant="ghost" size="icon" onClick={fetchConversations}><RefreshCcw className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No active conversations</div>
                    ) : (
                        conversations.map((u) => (
                            <div
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                className={cn(
                                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted transition-colors border-b last:border-0",
                                    selectedUser?.id === u.id && "bg-muted"
                                )}
                            >
                                <Avatar>
                                    <AvatarImage src={u.avatar} />
                                    <AvatarFallback>{u.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-medium truncate">{u.name}</h4>
                                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Main Chat Area */}
            <Card className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        <CardHeader className="p-4 border-b bg-muted/20">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={selectedUser.avatar} />
                                    <AvatarFallback>{selectedUser.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">{selectedUser.name}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => {
                                // Admin sending = is_admin_sender=true (Right side)
                                // User sending = is_admin_sender=false (Left side)
                                const isMe = Boolean(msg.is_admin_sender);
                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[70%] px-4 py-2 rounded-lg text-sm",
                                                isMe
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-muted text-foreground rounded-bl-none"
                                            )}
                                        >
                                            <p>{msg.message}</p>
                                            <span className="text-[10px] opacity-70 block text-right mt-1">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </CardContent>

                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a reply..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
                        <div className="p-4 bg-muted rounded-full">
                            <User className="h-8 w-8" />
                        </div>
                        <p>Select a user to view conversation</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
