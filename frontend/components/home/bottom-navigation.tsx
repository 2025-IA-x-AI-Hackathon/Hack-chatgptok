"use client";

import { Home, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
    const pathname = usePathname();

    const navItems = [
        {
            label: "홈",
            href: "/",
            icon: Home,
        },
        {
            label: "채팅",
            href: "/chat",
            icon: MessageCircle,
        },
        {
            label: "프로필",
            href: "/profile",
            icon: User,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong shadow-2xl">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex items-center justify-around h-20">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-2 flex-1 h-full transition-all duration-300",
                                    isActive
                                        ? "text-primary scale-105"
                                        : "text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95"
                                )}
                            >
                                {/* 활성 상태 인디케이터 */}
                                {isActive && (
                                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-scale-in shadow-lg shadow-primary/50" />
                                )}

                                <div className={cn(
                                    "relative p-3 rounded-2xl transition-all duration-300",
                                    isActive ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/20" : "hover:bg-primary/5"
                                )}>
                                    <Icon
                                        className={cn(
                                            "w-6 h-6 transition-all duration-300",
                                            isActive && "stroke-[2.5] drop-shadow-sm"
                                        )}
                                    />
                                </div>

                                <span
                                    className={cn(
                                        "text-xs transition-all duration-300",
                                        isActive ? "font-bold" : "font-medium"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}