import { notFound } from "next/navigation";
import { requireUser } from "@/utils/supabase/server";

type TopicPageProps = {
  params: Promise<{ id: string }>;
};

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

  return <>Topic: {topic.name}</>;
}
