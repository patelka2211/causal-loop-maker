"use client";

import { useMemo, useState } from "react";
import { RepeatIcon, ScaleIcon, TrendingUpIcon } from "lucide-react";
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
import { detectCausalLoops } from "@/utils/loops";
import type { TopicLinkItem } from "@/utils/supabase/actions/links";

interface LoopsModalProps {
  links: TopicLinkItem[];
}

export default function LoopsModal({ links }: LoopsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "REINFORCING" | "BALANCING"
  >("ALL");

  const summary = useMemo(() => detectCausalLoops(links), [links]);

  const filteredLoops = useMemo(() => {
    if (activeTab === "REINFORCING") {
      return summary.loops.filter((l) => l.type === "REINFORCING");
    }
    if (activeTab === "BALANCING") {
      return summary.loops.filter((l) => l.type === "BALANCING");
    }
    return summary.loops;
  }, [summary.loops, activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 border-border hover:bg-accent text-xs sm:text-sm font-medium gap-2 cursor-pointer shadow-xs transition-colors"
          />
        }
      >
        <RepeatIcon className="size-4 text-muted-foreground shrink-0" />
        <span className="hidden sm:inline text-muted-foreground">Loops:</span>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
            title="Reinforcing Loops"
          >
            <TrendingUpIcon className="size-3" />
            <span>R {summary.reinforcingCount}</span>
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
            title="Balancing Loops"
          >
            <ScaleIcon className="size-3" />
            <span>B {summary.balancingCount}</span>
          </span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <RepeatIcon className="size-5 text-primary" />
            Causal Loops Summary
          </DialogTitle>
          <DialogDescription>
            Overview of detected reinforcing and balancing feedback loops in
            this diagram.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("REINFORCING")}
              className={`flex flex-col p-3 rounded-lg border text-left cursor-pointer transition-all ${
                activeTab === "REINFORCING"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500/50"
                  : "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              }`}
            >
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <TrendingUpIcon className="size-4" />
                Reinforcing (R)
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {summary.reinforcingCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Compounding loops with an even number of negative links.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("BALANCING")}
              className={`flex flex-col p-3 rounded-lg border text-left cursor-pointer transition-all ${
                activeTab === "BALANCING"
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-500/50"
                  : "border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <ScaleIcon className="size-4" />
                Balancing (B)
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-900 dark:text-amber-100">
                {summary.balancingCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Stabilizing loops with an odd number of negative links.
              </p>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({summary.totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("REINFORCING")}
              className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "REINFORCING"
                  ? "bg-background text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUpIcon className="size-3.5" />
              Reinforcing ({summary.reinforcingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("BALANCING")}
              className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "BALANCING"
                  ? "bg-background text-amber-700 dark:text-amber-400 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ScaleIcon className="size-3.5" />
              Balancing ({summary.balancingCount})
            </button>
          </div>

          {/* Loops List if any, or empty state */}
          {filteredLoops.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
              {summary.totalCount === 0
                ? "No closed causal loops detected yet in this topic diagram."
                : `No ${activeTab.toLowerCase()} loops found.`}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {activeTab === "ALL"
                  ? `All Detected Loops (${filteredLoops.length})`
                  : activeTab === "REINFORCING"
                    ? `Reinforcing Loops (${filteredLoops.length})`
                    : `Balancing Loops (${filteredLoops.length})`}
              </div>
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {filteredLoops.map((loop, idx) => (
                  <div
                    key={loop.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border bg-muted/30 text-xs gap-2.5"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-semibold text-foreground text-xs leading-normal break-words">
                        Loop #{idx + 1}: {loop.pathFactorNames.join(" → ")} →{" "}
                        {loop.pathFactorNames[0]}
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {loop.links.length} links • {loop.negativeCount}{" "}
                        negative polarity
                      </div>
                    </div>
                    <span
                      className={`self-start sm:self-center shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        loop.type === "REINFORCING"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {loop.type === "REINFORCING" ? "R" : "B"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 pt-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
