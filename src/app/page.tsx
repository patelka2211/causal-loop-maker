import {
  CloudIcon,
  GitMergeIcon,
  RefreshCwIcon,
  SparklesIcon,
} from "lucide-react";
import { cookies } from "next/headers";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import SignOutButton from "@/components/SignOutButton";
import TopicList from "@/components/TopicList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, fetch their topics
  let topics: Array<{
    id: string;
    name: string;
    description: string | null;
    user_id: string;
    created_at: string;
    updated_at: string;
  }> = [];

  if (user) {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      topics = data;
    }
  }

  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const userInitials = (userName[0] || "U").toUpperCase();
  const userAvatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
              <RefreshCwIcon className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight">
                Causal Loop Maker
              </span>
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex text-[10px]"
              >
                Systems Thinking
              </Badge>
            </div>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border">
                  <Avatar className="size-6">
                    {userAvatarUrl && (
                      <AvatarImage src={userAvatarUrl} alt={userName} />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-foreground leading-none">
                      {userName}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-none mt-0.5 truncate max-w-[140px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <SignOutButton />
              </div>
            ) : (
              <GoogleSignInButton />
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user ? (
          /* LOGGED IN DASHBOARD VIEW */
          <div className="space-y-8">
            {/* User Greeting Banner */}
            <Card className="relative overflow-hidden border-border bg-card">
              <CardHeader className="relative z-10 pb-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <SparklesIcon className="mr-1 size-3" />
                    Welcome back
                  </Badge>
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Hello, {userName}! 👋
                </CardTitle>
                <CardDescription className="text-sm max-w-2xl mt-1 leading-relaxed">
                  Organize your systems thinking models, map causal feedback
                  loops, and analyze systemic dynamics across your active
                  topics.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Topic List Section */}
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Your Causal Topics
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select a topic to construct or edit causal loop diagrams.
                </p>
              </div>

              {/* Client Topic List component */}
              <TopicList initialTopics={topics} />
            </section>
          </div>
        ) : (
          /* LOGGED OUT LANDING HERO VIEW */
          <div className="py-8 sm:py-16 space-y-16">
            {/* Hero Banner */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div>
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-xs font-semibold gap-2 border-primary/30 text-primary"
                >
                  <span className="flex size-2 rounded-full bg-primary animate-pulse" />
                  Interactive Causal Loop Diagramming
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                Map Complex Systems. <br className="hidden sm:inline" />
                <span className="text-primary">Uncover Feedback Loops.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Causal Loop Maker empowers thinkers, engineers, and strategists
                to model cause-and-effect relationships, balance reinforcing and
                balancing loops, and master systemic complexity.
              </p>

              {/* Primary Call to Action Box */}
              <div className="pt-4 flex flex-col items-center justify-center gap-4">
                <Card className="w-full max-w-md p-6 text-center">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Sign in to create your first causal diagram topic
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex justify-center">
                    <GoogleSignInButton />
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground">
                  Instant sign-in with Google OAuth • Secure Supabase Cloud
                  Storage
                </p>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <Card className="hover:ring-primary/40 transition-all">
                <CardHeader>
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <RefreshCwIcon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">
                    Reinforcing & Balancing Loops
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Identify exponential growth (R) and stabilizing equilibrium
                    (B) dynamics across complex system domains.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:ring-primary/40 transition-all">
                <CardHeader>
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <GitMergeIcon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">
                    Causal Polarities (+ / -)
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Connect key variables with explicit positive (+) or inverse
                    (-) causality arrows for intuitive analysis.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:ring-primary/40 transition-all">
                <CardHeader>
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <CloudIcon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">Cloud Persistence</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Your topics are safely stored in your private Supabase
                    database, accessible anywhere across devices.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-muted/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Causal Loop Maker. Built for Systems
            Thinking.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-foreground transition-colors">
              Supabase Auth & DB
            </span>
            <span>•</span>
            <span className="hover:text-foreground transition-colors">
              Next.js App Router
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
