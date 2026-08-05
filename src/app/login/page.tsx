import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { createClient } from "@/utils/supabase/server";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 font-sans">
      <div className="max-w-sm w-full p-8 space-y-6 bg-card rounded-xl border border-border text-center shadow-xs">
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">
            Causal Loop Maker
          </h1>
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
