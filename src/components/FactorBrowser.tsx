"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  LayersIcon,
  Loader2Icon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import {
  deleteFactor,
  FactorWithUsage,
} from "@/utils/supabase/actions/links";

interface FactorBrowserProps {
  initialFactors: FactorWithUsage[];
}

export default function FactorBrowser({ initialFactors }: FactorBrowserProps) {
  const router = useRouter();
  const [factors, setFactors] = useState<FactorWithUsage[]>(initialFactors);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNUSED" | "USED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [factorToDelete, setFactorToDelete] = useState<FactorWithUsage | null>(
    null,
  );
  const [isDeleting, startDeletingTransition] = useTransition();

  // Sync factors if initialFactors update
  useMemo(() => {
    setFactors(initialFactors);
  }, [initialFactors]);

  const unusedCount = useMemo(
    () => factors.filter((f) => f.isUnused).length,
    [factors],
  );
  const usedCount = useMemo(
    () => factors.filter((f) => !f.isUnused).length,
    [factors],
  );

  const filteredFactors = useMemo(() => {
    return factors.filter((factor) => {
      // Filter by tab
      if (activeTab === "UNUSED" && !factor.isUnused) return false;
      if (activeTab === "USED" && factor.isUnused) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        return factor.name
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });
  }, [factors, activeTab, searchQuery]);

  const promptDeleteFactor = (factor: FactorWithUsage) => {
    if (!factor.isUnused) {
      setError(
        `Cannot delete "${factor.name}" because it is currently in use.`,
      );
      return;
    }
    setFactorToDelete(factor);
  };

  const handleConfirmDelete = () => {
    if (!factorToDelete) return;
    const factor = factorToDelete;
    setFactorToDelete(null);

    setError(null);
    setSuccess(null);
    setDeletingId(factor.id);

    startDeletingTransition(async () => {
      const res = await deleteFactor(factor.id);
      setDeletingId(null);

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Factor "${factor.name}" deleted.`);
        setFactors((prev) => prev.filter((f) => f.id !== factor.id));
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === "ALL"
              ? "border-primary bg-primary/5 ring-2 ring-primary/30"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Total Factors
          </span>
          <span className="text-3xl font-extrabold text-foreground mt-1">
            {factors.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("UNUSED")}
          className={`flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === "UNUSED"
              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500/40"
              : "border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          }`}
        >
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Unused Factors
          </span>
          <span className="text-3xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
            {unusedCount}
          </span>
          <span className="text-[11px] text-muted-foreground mt-1">
            Not referenced in any links
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("USED")}
          className={`flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === "USED"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/40"
              : "border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          }`}
        >
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Used Factors
          </span>
          <span className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
            {usedCount}
          </span>
          <span className="text-[11px] text-muted-foreground mt-1">
            Active in topic diagrams
          </span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <Alert variant="destructive" className="p-3 text-xs sm:text-sm">
          <AlertCircleIcon className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="p-3 text-xs sm:text-sm border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search factors by name..."
            className="pl-9 h-10 text-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({factors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("UNUSED")}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "UNUSED"
                ? "bg-background text-amber-700 dark:text-amber-400 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unused ({unusedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("USED")}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "USED"
                ? "bg-background text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Used ({usedCount})
          </button>
        </div>
      </div>

      {/* Factors List Grid */}
      {filteredFactors.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl bg-card text-muted-foreground text-sm space-y-2">
          <LayersIcon className="size-8 mx-auto text-muted-foreground/60" />
          <p className="font-medium text-foreground">No factors found</p>
          <p className="text-xs text-muted-foreground">
            {factors.length === 0
              ? "No factors recorded yet."
              : searchQuery
                ? `No factors matching "${searchQuery}"`
                : activeTab === "UNUSED"
                  ? "No unused factors found. All your factors are referenced in topic diagrams!"
                  : "No used factors found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFactors.map((factor) => {
            const isCurrentlyDeleting = isDeleting && deletingId === factor.id;
            return (
              <div
                key={factor.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-all text-sm gap-3"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground truncate block text-sm">
                    {factor.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {factor.isUnused ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      Unused
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      {factor.usageCount} {factor.usageCount === 1 ? "link" : "links"}
                    </span>
                  )}

                  {factor.isUnused && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isCurrentlyDeleting}
                      onClick={() => promptDeleteFactor(factor)}
                      title="Delete factor"
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                    >
                      {isCurrentlyDeleting ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <Trash2Icon className="size-4" />
                      )}
                      <span className="sr-only">Delete factor</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!factorToDelete}
        onOpenChange={(open) => !open && setFactorToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2Icon className="size-5" />
              Delete Factor
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete factor{" "}
              <strong className="text-foreground">
                "{factorToDelete?.name}"
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFactorToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete Factor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
