import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { getUser } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to access and manage your causal loop diagrams.",
};

export default async function LoginPage() {
  const { user } = await getUser();

  if (user) {
    redirect("/dashboard");
  }

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
