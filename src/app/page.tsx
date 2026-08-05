import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import TopicList from "@/components/TopicList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const userName =
    user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const userInitials = (userName[0] || "U").toUpperCase();
  const userAvatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <span className="font-bold text-lg tracking-tight">
            Causal Loop Maker
          </span>
          <div className="flex items-center gap-3">
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
