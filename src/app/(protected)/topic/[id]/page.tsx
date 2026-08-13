import type { Metadata } from "next";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CreateLinkModal from "@/components/CreateLinkModal";
import LoopsModal from "@/components/LoopsModal";
import TopicCanvas from "@/components/TopicCanvas";
import { Button } from "@/components/ui/button";
import { getTopicLinks } from "@/utils/supabase/actions/links";
import { requireUser } from "@/utils/supabase/server";

type TopicPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data: topic } = await supabase
    .from("topics")
    .select("name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!topic) {
    return { title: "Topic Not Found" };
  }

  return { title: topic.name };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  // Fetch topic details
  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (topicError || !topic) {
    notFound();
  }

  // Fetch links for this topic
  const links = await getTopicLinks(topic.id);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Top Header Strip */}
      <header className="h-14 shrink-0 border-b border-border bg-background px-4 flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={
              <Link href="/" title="Back to topics">
                <ArrowLeftIcon />
                <span className="sr-only">Back to topics</span>
              </Link>
            }
          />
          <div className="h-4 w-px bg-border shrink-0" />
          <h1 className="font-semibold text-base sm:text-lg text-foreground truncate">
            {topic.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <LoopsModal links={links} />
          <CreateLinkModal topicId={topic.id} showTrigger />
        </div>
      </header>

      {/* Main ReactFlow Canvas Area */}
      <main className="flex-1 w-full relative min-h-0">
        <TopicCanvas initialLinks={links} />
      </main>
    </div>
  );
}
