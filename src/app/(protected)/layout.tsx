import { requireUser } from "@/utils/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/login");

  return <>{children}</>;
}
