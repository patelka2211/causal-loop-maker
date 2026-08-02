import { cookies } from "next/headers";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: todos } = await supabase.from("todos").select();

  return (
    <main className="min-h-screen p-8 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center">
          Supabase Auth & Database Test
        </h1>

        <section className="flex flex-col items-center gap-4">
          {user ? (
            <div className="w-full flex flex-col gap-3 items-center text-center">
              <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg w-full">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                  Signed In
                </p>
                <p className="text-sm font-medium mt-1">{user.email}</p>
                <p className="text-xs text-zinc-500 mt-1">ID: {user.id}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {user.user_metadata["name"]}
                </p>
              </div>
              <SignOutButton />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                Sign in using your Google Account via Supabase Auth:
              </p>
              <GoogleSignInButton />
            </div>
          )}
        </section>

        <hr className="border-zinc-200 dark:border-zinc-700" />

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Database Query Test (Todos)</h2>
          {todos && todos.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-sm">
              {todos.map((todo) => (
                <li key={todo.id}>{todo.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 italic">
              No todos found or table empty.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
