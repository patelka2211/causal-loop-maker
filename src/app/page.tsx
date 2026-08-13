import Link from "next/link";
import { TagIcon } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import SignOutButton from "@/components/SignOutButton";
import TopicList from "@/components/TopicList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFactorsWithUsage } from "@/utils/supabase/actions/links";
import { getUser } from "@/utils/supabase/server";

export default async function Page() {
  const { supabase, user } = await getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 font-sans">
        <div className="max-w-sm w-full p-8 space-y-6 bg-card rounded-xl border border-border text-center shadow-xs">
          <div className="space-y-3 flex flex-col items-center">
            <img
              src="/ouro.svg"
              alt="Ouro"
              className="h-9 w-auto dark:invert"
            />
            <p className="text-xs text-muted-foreground">
              Sign in to access and manage your causal loop diagrams.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <GoogleSignInButton />
          </div>
        </div>
      </div>
    );
  }

  const [{ data: topics }, factors] = await Promise.all([
    supabase
      .from("topics")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    getFactorsWithUsage(),
  ]);

  const unusedCount = factors.filter((f) => f.isUnused).length;

  const userName =
    user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const userInitials = (userName[0] || "U").toUpperCase();
  const userAvatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Ouro"
          >
            <img
              src="/ouro.svg"
              alt="Ouro"
              className="h-6 w-auto dark:invert shrink-0"
            />
          </Link>
          <div className="flex items-center gap-3">
            {unusedCount > 0 && (
              <Link
                href="/factors"
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background hover:bg-accent text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-xs"
                title="Open Factor Browser"
              >
                <TagIcon className="size-4 text-muted-foreground shrink-0" />
                <span className="hidden sm:inline text-muted-foreground font-medium">
                  Factors:
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                  {unusedCount} unused
                </span>
              </Link>
            )}

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs">
              <Avatar className="size-6">
                {userAvatarUrl && (
                  <AvatarImage src={userAvatarUrl} alt={userName} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-foreground">{userName}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TopicList initialTopics={topics || []} />
      </main>
    </div>
  );
}
