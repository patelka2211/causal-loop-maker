"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/utils/supabase/server";

export type FactorItem = {
  id: string;
  name: string;
};

export type CreateLinkParams = {
  topicId: string;
  sourceFactorId: string;
  targetFactorId: string;
  polarity: "POSITIVE" | "NEGATIVE";
  hasDelay: boolean;
};

export async function getFactors(): Promise<FactorItem[]> {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("factors")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function createFactor(
  name: string,
): Promise<{ factor?: FactorItem; error?: string }> {
  const { supabase, user } = await getUser();

  if (!user) {
    return { error: "You must be signed in to create a factor." };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: "Factor name cannot be empty." };
  }

  // Check if factor already exists for this user
  const { data: existing } = await supabase
    .from("factors")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("name", trimmedName)
    .maybeSingle();

  if (existing) {
    return { factor: existing };
  }

  const { data: created, error: insertError } = await supabase
    .from("factors")
    .insert({
      name: trimmedName,
      user_id: user.id,
    })
    .select("id, name")
    .single();

  if (insertError || !created) {
    return { error: insertError?.message || "Failed to create factor." };
  }

  return { factor: created };
}

export async function createLink(params: CreateLinkParams) {
  const { supabase, user } = await getUser();

  if (!user) {
    return { error: "You must be signed in to create a link." };
  }

  const { topicId, sourceFactorId, targetFactorId, polarity, hasDelay } =
    params;

  if (!sourceFactorId || !targetFactorId) {
    return { error: "Both source and target factors are required." };
  }

  // Insert link directly into database
  const { data: link, error: linkError } = await supabase
    .from("links")
    .insert({
      topic_id: topicId,
      source_factor_id: sourceFactorId,
      target_factor_id: targetFactorId,
      polarity,
      has_delay: hasDelay,
      user_id: user.id,
    })
    .select()
    .single();

  if (linkError) {
    return { error: linkError.message };
  }

  revalidatePath(`/topic/${topicId}`);
  return { success: true, link };
}

export type TopicLinkItem = {
  id: string;
  polarity: "POSITIVE" | "NEGATIVE";
  has_delay: boolean;
  source_factor_id: string;
  target_factor_id: string;
  source_factor: {
    id: string;
    name: string;
  };
  target_factor: {
    id: string;
    name: string;
  };
};

export async function getTopicLinks(topicId: string): Promise<TopicLinkItem[]> {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("links")
    .select(`
      id,
      polarity,
      has_delay,
      source_factor_id,
      target_factor_id,
      source_factor:factors!links_source_factor_id_fkey(id, name),
      target_factor:factors!links_target_factor_id_fkey(id, name)
    `)
    .eq("topic_id", topicId)
    .eq("user_id", user.id);

  if (error || !data) return [];
  return data as unknown as TopicLinkItem[];
}

