import type { TopicLinkItem } from "@/utils/supabase/actions/links";

export type CausalLoop = {
  id: string;
  type: "REINFORCING" | "BALANCING";
  links: TopicLinkItem[];
  pathFactorIds: string[];
  pathFactorNames: string[];
  negativeCount: number;
};

export type LoopSummary = {
  reinforcingCount: number;
  balancingCount: number;
  totalCount: number;
  loops: CausalLoop[];
};

export function detectCausalLoops(links: TopicLinkItem[]): LoopSummary {
  if (!links || links.length === 0) {
    return { reinforcingCount: 0, balancingCount: 0, totalCount: 0, loops: [] };
  }

  // Build adjacency list: source_factor_id -> Array of { targetId, link }
  const adj = new Map<
    string,
    Array<{ targetId: string; link: TopicLinkItem }>
  >();
  const nodeIdsSet = new Set<string>();

  for (const link of links) {
    const src = link.source_factor_id;
    const tgt = link.target_factor_id;
    if (!src || !tgt) continue;

    nodeIdsSet.add(src);
    nodeIdsSet.add(tgt);

    if (!adj.has(src)) {
      adj.set(src, []);
    }
    adj.get(src)!.push({ targetId: tgt, link });
  }

  const nodes = Array.from(nodeIdsSet);
  const nodeIndexMap = new Map<string, number>();
  nodes.forEach((id, idx) => nodeIndexMap.set(id, idx));

  const rawCycles: Array<{ pathNodes: string[]; pathLinks: TopicLinkItem[] }> =
    [];

  // DFS to detect simple cycles using lowest index node as root to prevent duplicate cycles
  function findCyclesFromStart(
    startNode: string,
    startIndex: number,
    currentPath: string[],
    currentLinks: TopicLinkItem[],
    visitedInPath: Set<string>,
  ) {
    const lastNode = currentPath[currentPath.length - 1];
    const neighbors = adj.get(lastNode) || [];

    for (const { targetId, link } of neighbors) {
      const targetIdx = nodeIndexMap.get(targetId);
      if (targetIdx === undefined || targetIdx < startIndex) {
        // Skip nodes with index lower than start node to enforce canonical cycle order
        continue;
      }

      if (targetId === startNode) {
        // Found a closed cycle
        rawCycles.push({
          pathNodes: [...currentPath],
          pathLinks: [...currentLinks, link],
        });
      } else if (!visitedInPath.has(targetId)) {
        visitedInPath.add(targetId);
        findCyclesFromStart(
          startNode,
          startIndex,
          [...currentPath, targetId],
          [...currentLinks, link],
          visitedInPath,
        );
        visitedInPath.delete(targetId);
      }
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const startNode = nodes[i];
    const visited = new Set<string>([startNode]);
    findCyclesFromStart(startNode, i, [startNode], [], visited);
  }

  const loops: CausalLoop[] = rawCycles.map((cycle, index) => {
    let negativeCount = 0;
    const pathFactorNames: string[] = [];

    for (const l of cycle.pathLinks) {
      if (l.polarity === "NEGATIVE") {
        negativeCount++;
      }
      pathFactorNames.push(l.source_factor?.name || "Unknown");
    }

    const type: "REINFORCING" | "BALANCING" =
      negativeCount % 2 === 0 ? "REINFORCING" : "BALANCING";

    return {
      id: `loop-${index}-${cycle.pathNodes.join("-")}`,
      type,
      links: cycle.pathLinks,
      pathFactorIds: cycle.pathNodes,
      pathFactorNames,
      negativeCount,
    };
  });

  const reinforcingCount = loops.filter((l) => l.type === "REINFORCING").length;
  const balancingCount = loops.filter((l) => l.type === "BALANCING").length;

  return {
    reinforcingCount,
    balancingCount,
    totalCount: loops.length,
    loops,
  };
}
