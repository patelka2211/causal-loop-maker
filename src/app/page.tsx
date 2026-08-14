import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUser } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Ouro",
  description: "Causal Loop Diagramming Tool",
};

export default async function HomePage() {
  const { user } = await getUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 font-sans">
      <div className="flex flex-col items-center gap-6 text-center">
        <img src="/ouro.svg" alt="Ouro" className="h-10 w-auto dark:invert" />
        {user ? (
          <Button
            nativeButton={false}
            render={<Link href="/dashboard">Go to Dashboard</Link>}
          />
        ) : (
          <Button
            nativeButton={false}
            render={<Link href="/login">Login</Link>}
          />
        )}
      </div>
    </div>
  );
}
