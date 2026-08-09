"use client";

import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { createFactor, FactorItem } from "@/utils/supabase/actions/links";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FactorComboboxProps {
  value: string | null;
  onChange: (factorId: string | null, factorName?: string) => void;
  factors: FactorItem[];
  onFactorCreated: (newFactor: FactorItem) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  isInvalid?: boolean;
}

export default function FactorCombobox({
  value,
  onChange,
  factors,
  onFactorCreated,
  placeholder = "Select or search factor...",
  id,
  disabled = false,
  isInvalid = false,
}: FactorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const generatedId = useId();
  const fieldId = id || generatedId;

  // Selected factor object
  const selectedFactor = useMemo(
    () => factors.find((f) => f.id === value),
    [factors, value],
  );

  // Filtered factors list based on search query
  const filteredFactors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return factors;
    return factors.filter((f) => f.name.toLowerCase().includes(query));
  }, [factors, searchQuery]);

  // Check if search query matches an existing factor name exactly
  const exactMatchExists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return false;
    return factors.some((f) => f.name.toLowerCase() === query);
  }, [factors, searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchQuery("");
        setCreateError(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const handleSelectFactor = (factor: FactorItem) => {
    onChange(factor.id, factor.name);
    setOpen(false);
    setSearchQuery("");
    setCreateError(null);
  };

  const handleCreateFactor = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setCreateError(null);
    startTransition(async () => {
      const res = await createFactor(trimmed);
      if (res.error || !res.factor) {
        setCreateError(res.error || "Failed to create factor.");
      } else {
        onFactorCreated(res.factor);
        onChange(res.factor.id, res.factor.name);
        setOpen(false);
        setSearchQuery("");
      }
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        id={fieldId}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
            if (open) {
              setSearchQuery("");
              setCreateError(null);
            }
          }
        }}
        aria-expanded={open}
        aria-invalid={isInvalid}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isInvalid && "border-destructive focus-visible:ring-destructive/20",
          !selectedFactor && "text-muted-foreground",
        )}
      >
        <span className="truncate text-left font-normal">
          {selectedFactor ? selectedFactor.name : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selectedFactor && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Clear selection"
            >
              <XIcon className="size-3.5" />
            </span>
          )}
          <ChevronsUpDownIcon className="size-4 opacity-50" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-full rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95">
          {/* Search Input */}
          <div className="relative mb-2">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder="Search or type factor name..."
              className="pl-8 h-8 text-sm"
            />
          </div>

          {createError && (
            <Alert variant="destructive" className="my-2 p-2 text-xs">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          {/* Results List */}
          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {/* Create Option */}
            {searchQuery.trim() !== "" && !exactMatchExists && (
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={handleCreateFactor}
                className="w-full justify-start text-primary font-medium text-xs h-8 px-2 my-0.5 hover:bg-primary/10"
              >
                {isPending ? (
                  <Loader2Icon className="animate-spin size-3.5 mr-1.5" />
                ) : (
                  <PlusIcon className="size-3.5 mr-1.5" />
                )}
                Create &ldquo;{searchQuery.trim()}&rdquo;
              </Button>
            )}

            {filteredFactors.length > 0 ? (
              filteredFactors.map((factor) => {
                const isSelected = factor.id === value;
                return (
                  <button
                    key={factor.id}
                    type="button"
                    onClick={() => handleSelectFactor(factor)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none",
                      isSelected &&
                        "bg-accent text-accent-foreground font-medium",
                    )}
                  >
                    <span className="truncate">{factor.name}</span>
                    {isSelected && (
                      <CheckIcon className="size-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            ) : searchQuery.trim() === "" || exactMatchExists ? (
              <p className="text-xs text-center text-muted-foreground py-3">
                No factors found.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
