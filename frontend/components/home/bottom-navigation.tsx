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
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-6 h-6",
                                        isActive && "stroke-[2.5]"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "text-xs font-medium",
                                        isActive && "font-semibold"
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