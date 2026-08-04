import { cookies } from "next/headers";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import SignOutButton from "@/components/SignOutButton";
import TopicList from "@/components/TopicList";
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <title>Causal Loop Maker Logo</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-800 dark:from-white dark:via-indigo-200 dark:to-zinc-300 bg-clip-text text-transparent">
                Causal Loop Maker
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                Systems Thinking
              </span>
            </div>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {(user.user_metadata.name || user.email || "U")[0]}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                      {user.user_metadata.name || user.email?.split("@")[0]}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-none mt-0.5 truncate max-w-[120px]">
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
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* User Greeting Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-zinc-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-800/30">
              <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200 backdrop-blur-md mb-3 border border-indigo-400/20">
                  <span>Welcome back</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Hello, {user.user_metadata.name || user.email?.split("@")[0]}!
                  👋
                </h1>
                <p className="mt-2 text-sm text-indigo-200/80 leading-relaxed">
                  Organize your systems thinking models, map causal feedback
                  loops, and analyze systemic dynamics across your active
                  topics.
                </p>
              </div>
            </div>

            {/* Topic List and Controls */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Your Causal Topics
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Select a topic to construct or edit causal loop diagrams.
                  </p>
                </div>
              </div>

              {/* Client Topic List component */}
              <TopicList initialTopics={topics} />
            </section>
          </div>
        ) : (
          /* LOGGED OUT LANDING HERO VIEW */
          <div className="py-8 sm:py-16 space-y-16 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>Interactive Causal Loop Diagramming</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                Map Complex Systems. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Uncover Feedback Loops.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Causal Loop Maker empowers thinkers, engineers, and strategists
                to model cause-and-effect relationships, balance reinforcing and
                balancing loops, and master systemic complexity.
              </p>

              {/* Primary Call to Action Box */}
              <div className="pt-4 flex flex-col items-center justify-center gap-4">
                <div className="p-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/10">
                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-6 flex flex-col items-center gap-4 border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Sign in to create your first causal diagram topic
                    </p>
                    <GoogleSignInButton />
                  </div>
                </div>
                <p className="text-xs text-zinc-400">
                  Instant sign-in with Google OAuth • Secure Supabase Cloud
                  Storage
                </p>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/80 dark:bg-zinc-900/60 dark:border-zinc-800 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <title>Loops</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Reinforcing & Balancing Loops
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Identify exponential growth (R) and stabilizing equilibrium
                  (B) dynamics across complex system domains.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/80 dark:bg-zinc-900/60 dark:border-zinc-800 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <title>Variables</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Causal Polarities (+ / -)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Connect key variables with explicit positive (+) or inverse
                  (-) causality arrows for intuitive analysis.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/80 dark:bg-zinc-900/60 dark:border-zinc-800 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <title>Cloud</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Cloud Persistence
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Your topics are safely stored in your private Supabase
                  database, accessible anywhere across devices.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            © {new Date().getFullYear()} Causal Loop Maker. Built for Systems
            Thinking.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
              Supabase Auth & DB
            </span>
            <span>•</span>
            <span className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
              Next.js App Router
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
