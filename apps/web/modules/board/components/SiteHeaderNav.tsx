"use client";

import { authClient } from "@repo/auth/client";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui";
import { CalendarDays, FolderOpen, Info, MoreVertical, Plus, Scale } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { LogoMark } from "./LogoMark";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeaderNav({
	signedIn,
	isAdmin,
}: {
	signedIn: boolean;
	isAdmin: boolean;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const onDaily = pathname === "/daily" || pathname.startsWith("/daily/");
	const onCategories = pathname === "/categories";
	const onAbout = pathname === "/about";
	const onRules = pathname === "/how-ranking-works";

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/login");
		router.refresh();
	}

	return (
		<header className="sticky top-0 z-40 border-b-[0.5px] border-border bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex h-14 w-full max-w-[80rem] items-center justify-between gap-3 px-4 sm:px-8">
				<Link href="/" className="flex items-center gap-2">
					<LogoMark className="size-[22px] shrink-0" />
					<span className="whitespace-nowrap text-[15px] font-medium tracking-[-0.022em] text-foreground">
						Bid Ladder
					</span>
				</Link>

				<nav className="flex items-center gap-1">
					<Button
						asChild
						size="sm"
						variant={onDaily ? "outline" : "ghost"}
						className="hidden sm:inline-flex"
					>
						<Link href="/daily">Daily</Link>
					</Button>
					<Button
						asChild
						size="sm"
						variant={onCategories ? "outline" : "ghost"}
						className="hidden sm:inline-flex"
					>
						<Link href="/categories">Categories</Link>
					</Button>
					<Button
						asChild
						size="sm"
						variant={onAbout ? "outline" : "ghost"}
						className="hidden sm:inline-flex"
					>
						<Link href="/about">About</Link>
					</Button>
					<Button
						asChild
						size="sm"
						variant={onRules ? "outline" : "ghost"}
						className="hidden sm:inline-flex"
					>
						<Link href="/how-ranking-works">Rules</Link>
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								aria-label="More, including Daily, categories and about"
								className="sm:hidden"
							>
								<MoreVertical className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href="/daily">
									<CalendarDays className="size-4" />
									Daily
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/categories">
									<FolderOpen className="size-4" />
									Categories
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/about">
									<Info className="size-4" />
									About
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/how-ranking-works">
									<Scale className="size-4" />
									Rules
								</Link>
							</DropdownMenuItem>
							{signedIn ? (
								<DropdownMenuItem asChild>
									<Link href="/dashboard">My listings</Link>
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem asChild>
									<Link href="/login">Sign in</Link>
								</DropdownMenuItem>
							)}
							{signedIn ? (
								<DropdownMenuItem asChild>
									<Link href="/settings/general">Account</Link>
								</DropdownMenuItem>
							) : null}
							{isAdmin ? (
								<DropdownMenuItem asChild>
									<Link href="/admin/review">Review queue</Link>
								</DropdownMenuItem>
							) : null}
						</DropdownMenuContent>
					</DropdownMenu>
					<ThemeToggle />
					{signedIn ? (
						<>
							<Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
								<Link href="/dashboard">My listings</Link>
							</Button>
							{isAdmin ? (
								<Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
									<Link href="/admin/review">Review</Link>
								</Button>
							) : null}
							<Button asChild size="sm" variant="primary">
								<Link href="/submit">
									<Plus className="size-4" />
									Submit
								</Link>
							</Button>
							<Button size="sm" variant="outline" onClick={() => void handleSignOut()}>
								Sign out
							</Button>
						</>
					) : (
						<>
							<Button asChild size="sm" variant="outline">
								<Link href="/login">Log in</Link>
							</Button>
							<Button asChild size="sm" variant="primary">
								<Link href="/submit">Submit</Link>
							</Button>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
