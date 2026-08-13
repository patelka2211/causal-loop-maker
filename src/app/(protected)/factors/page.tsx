import type { Metadata } from "next";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import FactorBrowser from "@/components/FactorBrowser";
import SignOutButton from "@/components/SignOutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getFactorsWithUsage } from "@/utils/supabase/actions/links";
import { requireUser } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Factor Browser",
};

export default async function FactorsPage() {
  const { user } = await requireUser();
  const factors = await getFactorsWithUsage();

  const userName =
    user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const userInitials = (userName[0] || "U").toUpperCase();
  const userAvatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={
                <Link href="/" title="Back to home">
                  <ArrowLeftIcon />
                  <span className="sr-only">Back to home</span>
                </Link>
              }
            />
            <div className="h-4 w-px bg-border shrink-0" />
            <h1 className="font-bold text-lg tracking-tight">Factor Browser</h1>
          </div>

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
        <FactorBrowser initialFactors={factors} />
      </main>
    </div>
  );
}
