import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { LogoMark } from "@/components/LogoMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b-[0.5px] border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[80rem] items-center justify-between gap-3 px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark className="size-[22px] shrink-0" />
          <span className="whitespace-nowrap text-[15px] font-medium tracking-[-0.022em] text-foreground">
            Bid Ladder
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <ThemeToggle />
          {loading ? null : user ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/dashboard">My listings</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link to="/submit">
                  <Plus className="size-4" />
                  Submit
                </Link>
              </Button>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link to="/submit">Submit</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
