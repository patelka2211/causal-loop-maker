"use client";

import { AlertCircleIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import {
  createLink,
  FactorItem,
  getFactors,
} from "@/utils/supabase/actions/links";
import FactorCombobox from "@/components/FactorCombobox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

interface CreateLinkModalProps {
  topicId: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  /** Optional preloaded factors list */
  initialFactors?: FactorItem[];
  /** If provided, renders a trigger button. Otherwise can be controlled via isOpen/onClose */
  showTrigger?: boolean;
}

export default function CreateLinkModal({
  topicId,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onSuccess,
  initialFactors = [],
  showTrigger = false,
}: CreateLinkModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    if (isControlled && externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const [factors, setFactors] = useState<FactorItem[]>(initialFactors);
  const [sourceFactorId, setSourceFactorId] = useState<string | null>(null);
  const [targetFactorId, setTargetFactorId] = useState<string | null>(null);
  const [polarity, setPolarity] = useState<"POSITIVE" | "NEGATIVE">("POSITIVE");
  const [hasDelay, setHasDelay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load factors whenever modal opens
  useEffect(() => {
    if (isOpen) {
      getFactors().then((fetched) => {
        if (fetched && fetched.length > 0) {
          setFactors(fetched);
        }
      });
    }
  }, [isOpen]);

  const handleFactorCreated = (newFactor: FactorItem) => {
    setFactors((prev) => {
      if (prev.some((f) => f.id === newFactor.id)) return prev;
      return [...prev, newFactor].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  const resetForm = () => {
    setSourceFactorId(null);
    setTargetFactorId(null);
    setPolarity("POSITIVE");
    setHasDelay(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceFactorId || !targetFactorId) {
      setError("Both source and target factors are required.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const res = await createLink({
        topicId,
        sourceFactorId,
        targetFactorId,
        polarity,
        hasDelay,
      });

      if (res.error) {
        setError(res.error);
      } else {
        resetForm();
        handleClose();
        if (onSuccess) onSuccess();
      }
    });
  };

  const dialogMarkup = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Causal Link</DialogTitle>
        <DialogDescription>
          Connect two factors with a positive (+) or negative (-) causal
          relationship.
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
          <Field data-invalid={Boolean(error && !sourceFactorId)}>
            <FieldLabel htmlFor="source-factor">
              Source Factor <span className="text-destructive">*</span>
            </FieldLabel>
            <FactorCombobox
              id="source-factor"
              value={sourceFactorId}
              onChange={(id) => setSourceFactorId(id)}
              factors={factors}
              onFactorCreated={handleFactorCreated}
              placeholder="Search or select source factor..."
              isInvalid={Boolean(error && !sourceFactorId)}
            />
          </Field>

          <Field data-invalid={Boolean(error && !targetFactorId)}>
            <FieldLabel htmlFor="target-factor">
              Target Factor <span className="text-destructive">*</span>
            </FieldLabel>
            <FactorCombobox
              id="target-factor"
              value={targetFactorId}
              onChange={(id) => setTargetFactorId(id)}
              factors={factors}
              onFactorCreated={handleFactorCreated}
              placeholder="Search or select target factor..."
              isInvalid={Boolean(error && !targetFactorId)}
            />
          </Field>

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

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !sourceFactorId || !targetFactorId}
          >
            {isPending && (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            )}
            Add Link
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  if (showTrigger) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !isPending) {
            handleClose();
          } else if (open) {
            setInternalIsOpen(true);
          }
        }}
      >
        <DialogTrigger render={<Button size="sm" />}>
          <PlusIcon data-icon="inline-start" />
          Add Link
        </DialogTrigger>
        {dialogMarkup}
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          handleClose();
        }
      }}
    >
      {dialogMarkup}
    </Dialog>
  );
}
