"use client";

import { Button } from "@repo/ui";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isLight = mounted && resolvedTheme === "light";

	return (
		<Button
			size="icon"
			variant="ghost"
			onClick={() => setTheme(isLight ? "dark" : "light")}
			aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
			title={isLight ? "Dark mode" : "Light mode"}
		>
			{isLight ? <Sun className="size-4" /> : <Moon className="size-4" />}
		</Button>
	);
}
