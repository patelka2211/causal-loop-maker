"use client";

import {
  ArrowRightIcon,
  FolderPlusIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteTopic } from "@/app/actions/topics";
import CreateTopicModal from "@/components/CreateTopicModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/utils/supabase/schema";

type Topic = Tables<"topics">;

interface TopicListProps {
  initialTopics: Topic[];
}

export default function TopicList({ initialTopics }: TopicListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return initialTopics;
    const query = searchQuery.toLowerCase();
    return initialTopics.filter(
      (topic) =>
        topic.name.toLowerCase().includes(query) ||
        topic.description?.toLowerCase().includes(query),
    );
  }, [initialTopics, searchQuery]);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteTopic(id);
      setDeletingTopicId(null);
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Controls & Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <SearchIcon className="size-4" />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics by title or description..."
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-1 my-auto text-muted-foreground hover:text-foreground"
            >
              <XIcon />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <Badge variant="secondary">
            {filteredTopics.length}{" "}
            {filteredTopics.length === 1 ? "Topic" : "Topics"}
          </Badge>
          <Button
            type="button"
            onClick={() => {
              setEditingTopic(null);
              setIsModalOpen(true);
            }}
          >
            <PlusIcon data-icon="inline-start" />
            Create Topic
          </Button>
        </div>
      </div>

      {/* Grid of Topics */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="group relative flex flex-col justify-between hover:ring-primary/40 transition-all shadow-xs"
            >
              <CardHeader className="gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/20 bg-primary/5"
                  >
                    <RefreshCwIcon data-icon="inline-start" />
                    Causal Model
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(topic.updated_at || topic.created_at)}
                  </span>
                </div>

                <CardTitle className="group-hover:text-primary transition-colors line-clamp-1">
                  {topic.name}
                </CardTitle>
                <CardDescription className="line-clamp-3 min-h-[3rem]">
                  {topic.description || "No description provided."}
                </CardDescription>
              </CardHeader>

              <CardFooter className="mt-auto justify-between pt-3">
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 font-semibold text-primary"
                  render={
                    <Link href={`/topics/${topic.id}`}>
                      Open Diagram
                      <ArrowRightIcon data-icon="inline-end" />
                    </Link>
                  }
                />

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setEditingTopic(topic);
                      setIsModalOpen(true);
                    }}
                    title="Edit topic"
                  >
                    <PencilIcon />
                    <span className="sr-only">Edit topic</span>
                  </Button>

                  {deletingTopicId === topic.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        onClick={() => handleDelete(topic.id)}
                        disabled={isPending}
                      >
                        {isPending && (
                          <Loader2Icon
                            className="animate-spin"
                            data-icon="inline-start"
                          />
                        )}
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setDeletingTopicId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeletingTopicId(topic.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete topic"
                    >
                      <Trash2Icon />
                      <span className="sr-only">Delete topic</span>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : searchQuery ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <CardHeader className="items-center text-center pb-2">
            <SearchIcon className="size-10 text-muted-foreground/60 mb-2" />
            <CardTitle className="text-base font-semibold">
              No topics found
            </CardTitle>
            <CardDescription className="max-w-xs">
              No topics matched &quot;{searchQuery}&quot;. Try searching for
              something else or clear the filter.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2 border-t-0 bg-transparent">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <CardHeader className="items-center text-center pb-2">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <FolderPlusIcon className="size-7" />
            </div>
            <CardTitle className="text-lg font-bold">
              No topics created yet
            </CardTitle>
            <CardDescription className="max-w-sm">
              Create your first causal topic to start mapping variables,
              cause-and-effect relationships, and feedback loops.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-4 border-t-0 bg-transparent">
            <Button
              type="button"
              onClick={() => {
                setEditingTopic(null);
                setIsModalOpen(true);
              }}
            >
              <PlusIcon data-icon="inline-start" />
              Create Your First Topic
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Modal */}
      <CreateTopicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        topicToEdit={editingTopic}
      />
    </div>
  );
}
