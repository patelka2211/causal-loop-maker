"use client";

import { AlertCircleIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { deleteLink, updateLink } from "@/utils/supabase/actions/links";
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

export type LinkDataForEdit = {
  id: string;
  topicId: string;
  sourceName: string;
  targetName: string;
  polarity: "POSITIVE" | "NEGATIVE";
  hasDelay: boolean;
};

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  linkData: LinkDataForEdit | null;
}

export default function EditLinkModal({
  isOpen,
  onClose,
  onSuccess,
  linkData,
}: EditLinkModalProps) {
  const [polarity, setPolarity] = useState<"POSITIVE" | "NEGATIVE">("POSITIVE");
  const [hasDelay, setHasDelay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (linkData) {
      setPolarity(linkData.polarity);
      setHasDelay(linkData.hasDelay);
      setError(null);
      setIsConfirmingDelete(false);
    }
  }, [linkData, isOpen]);

  if (!linkData) return null;

  const handleClose = () => {
    if (isPending) return;
    setError(null);
    setIsConfirmingDelete(false);
    onClose();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await updateLink({
        id: linkData.id,
        topicId: linkData.topicId,
        polarity,
        hasDelay,
      });

      if (res.error) {
        setError(res.error);
      } else {
        handleClose();
        onSuccess();
      }
    });
  };

  const handleDelete = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await deleteLink({
        id: linkData.id,
        topicId: linkData.topicId,
      });

      if (res.error) {
        setError(res.error);
      } else {
        handleClose();
        onSuccess();
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Causal Link</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">
              {linkData.sourceName}
            </span>{" "}
            &rarr;{" "}
            <span className="font-semibold text-foreground">
              {linkData.targetName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon data-icon="inline-start" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel>Polarity</FieldLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={polarity === "POSITIVE" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setPolarity("POSITIVE")}
                >
                  + Same Direction (Positive)
                </Button>
                <Button
                  type="button"
                  variant={polarity === "NEGATIVE" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setPolarity("NEGATIVE")}
                >
                  - Opposite Direction (Negative)
                </Button>
              </div>
            </Field>

            <Field>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDelay}
                  onChange={(e) => setHasDelay(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-ring"
                />
                <span>Includes Delay (//)</span>
              </label>
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2 flex flex-wrap sm:flex-nowrap justify-between gap-2">
            <div>
              {isConfirmingDelete ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={handleDelete}
                  >
                    {isPending ? (
                      <Loader2Icon
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : (
                      <Trash2Icon data-icon="inline-start" />
                    )}
                    Confirm Delete
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setIsConfirmingDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                  disabled={isPending}
                  onClick={handleDelete}
                >
                  <Trash2Icon data-icon="inline-start" />
                  Delete Link
                </Button>
              )}
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2Icon
                    className="animate-spin"
                    data-icon="inline-start"
                  />
                )}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
