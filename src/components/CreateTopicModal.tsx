"use client";

import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { createTopic, updateTopic } from "@/app/actions/topics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/utils/supabase/schema";

type Topic = Tables<"topics">;

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicToEdit?: Topic | null;
  onSuccess?: () => void;
}

export default function CreateTopicModal({
  isOpen,
  onClose,
  topicToEdit,
  onSuccess,
}: CreateTopicModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (topicToEdit) {
      setName(topicToEdit.name);
      setDescription(topicToEdit.description || "");
    } else {
      setName("");
      setDescription("");
    }
    setError(null);
  }, [topicToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Topic name is required.");
      return;
    }

    setError(null);

    startTransition(async () => {
      if (topicToEdit) {
        const res = await updateTopic(topicToEdit.id, { name, description });
        if (res.error) {
          setError(res.error);
        } else {
          onClose();
          if (onSuccess) onSuccess();
        }
      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);

        const res = await createTopic(formData);
        if (res.error) {
          setError(res.error);
        } else {
          setName("");
          setDescription("");
          onClose();
          if (onSuccess) onSuccess();
        }
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {topicToEdit ? "Edit Causal Topic" : "Create New Causal Topic"}
          </DialogTitle>
          <DialogDescription>
            {topicToEdit
              ? "Update the topic name and description."
              : "Define a system context for mapping causal feedback loops."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon data-icon="inline-start" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={Boolean(error && !name.trim())}>
              <FieldLabel htmlFor="topic-name">
                Topic Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="topic-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Customer Churn Loop, Market Dynamics"
                aria-invalid={Boolean(error && !name.trim())}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="topic-description">
                Description{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="topic-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context or hypotheses about the causal relationships..."
                className="resize-none"
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending && (
                <Loader2Icon
                  className="animate-spin"
                  data-icon="inline-start"
                />
              )}
              {topicToEdit ? "Save Changes" : "Create Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
