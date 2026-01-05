"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Upload, LogOut, FileText, LayoutDashboard, HelpCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutAction } from "@/app/actions/auth";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguageStore } from "@/lib/store";
import { dashboardTranslations } from "@/components/translations";

export function AppNavbar({ userName = "User" }: { userName?: string }) {
    const pathname = usePathname();
    const { language, setLanguage } = useLanguageStore();
    const t = dashboardTranslations[language] || dashboardTranslations["en-US"];

    const navItems = [
        {
            name: t.nav_home,
            href: "/dashboard",
            icon: Home,
        },
        {
            name: t.nav_instructions,
            href: "/instructions",
            icon: HelpCircle,
        },
    ];

    return (
        <nav className="sticky top-4 z-50 w-full px-4 mb-8">
            <div className="container mx-auto max-w-7xl rounded-full border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                        <Upload className="w-5 h-5" />
                    </div>
                    <span>FormAssistant</span>
                </Link>

                {/* Navigation Tabs */}
                <div className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                                    isActive
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-4">
                    <LanguageSelector value={language} onChange={setLanguage} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/10">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                                        alt={userName}
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {userName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{userName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">User Account</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <form action={logoutAction} className="w-full">
                                    <button type="submit" className="w-full flex items-center text-red-600">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Log out
                                    </button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
