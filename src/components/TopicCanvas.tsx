"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  EdgeProps,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EditLinkModal, { LinkDataForEdit } from "@/components/EditLinkModal";
import { TopicLinkItem } from "@/utils/supabase/actions/links";

// Custom Node Component matching clean, minimal, lightweight aesthetic
export type CausalNodeData = {
  label: string;
};

function CausalNode({ data }: NodeProps<Node<CausalNodeData>>) {
  return (
    <div className="bg-white border border-slate-300 rounded-md px-3.5 py-1.5 min-h-[34px] flex items-center justify-center text-slate-800 text-[13px] font-medium tracking-tight select-none shadow-none">
      {/* Invisible Handles on 4 sides for precise directional connection */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        style={{
          background: "transparent",
          border: "none",
          width: 1,
          height: 1,
          top: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="source-top"
        style={{
          background: "transparent",
          border: "none",
          width: 1,
          height: 1,
          top: 0,
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="target-bottom"
        style={{
          background: "transparent",
          border: "none",
          width: 1,
          height: 1,
          bottom: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        style={{
          background: "transparent",
          border: "none",
          width: 1,
          height: 1,
          bottom: 0,
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        style={{
          background: "transparent",
          border: "none",
          width: 1,
          height: 1,
          left: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        style={{
          background: "transparent",
          border: "none",
          width: 1,
          height: 1,
          left: 0,
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="target-right"
        style={{
          background: "transparent",
          border: "none",
          width: 1,
          height: 1,
          right: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        style={{
          background: "transparent",
          border: "none",
          width: 1,
          height: 1,
          right: 0,
        }}
      />
      <span className="whitespace-nowrap">{data.label}</span>
    </div>
  );
}

// Custom Edge Component with color-coded polarity, offset curves for bidirectional paths, and animated flow
export type CausalEdgeData = {
  polarity: "POSITIVE" | "NEGATIVE";
  hasDelay: boolean;
  curvature?: number;
  isSelfLoop?: boolean;
  topicId?: string;
  sourceName?: string;
  targetName?: string;
};

function CausalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<Edge<CausalEdgeData>>) {
  const isPositive = data?.polarity === "POSITIVE";
  const strokeColor = isPositive ? "#16a34a" : "#dc2626";
  const hasDelay = data?.hasDelay ?? false;
  const animationDuration = hasDelay ? "4.8s" : "0.8s";

  const isSelfLoop =
    data?.isSelfLoop || (sourceX === targetX && sourceY === targetY);

  let path: string;

  if (isSelfLoop) {
    const loopRadius = (data?.curvature as number) ?? 52;
    // Outer loop curve extending outward from top handle around to right handle
    const c1x = sourceX;
    const c1y = sourceY - loopRadius;
    const c2x = targetX + loopRadius;
    const c2y = targetY;
    path = `M ${sourceX} ${sourceY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${targetX} ${targetY}`;
  } else {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.hypot(dx, dy);

    const ux = distance > 0 ? dx / distance : 1;
    const uy = distance > 0 ? dy / distance : 0;

    const nx = -uy;
    const ny = ux;

    const curvature = (data?.curvature as number) ?? 28;

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    const controlX = midX + nx * curvature;
    const controlY = midY + ny * curvature;

    path = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
  }

  return (
    <g className="group cursor-pointer">
      {/* Invisible wide interaction path for responsive mouse click and touchscreen tap (24px hit area) */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="react-flow__edge-interaction cursor-pointer"
      />
      {/* Underlying stable edge line */}
      <path
        id={id}
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeOpacity={0.3}
        className="react-flow__edge-path transition-all duration-200 group-hover:stroke-width-[2.5] group-hover:stroke-opacity-80"
      />
      {/* Animated directional flow segment traveling at 0.8s (immediate) or 4.8s (delayed) */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeDasharray="6 14"
        strokeLinecap="round"
        className="transition-all duration-200 group-hover:stroke-width-[3]"
        style={{
          animation: `causalFlow ${animationDuration} linear infinite`,
        }}
      />
    </g>
  );
}

function buildGraphFromLinks(links: TopicLinkItem[]) {
  if (!links || links.length === 0) {
    return { nodes: [], edges: [], isEmpty: true };
  }

  // Extract unique factors
  const factorsMap = new Map<string, string>();
  links.forEach((link) => {
    if (link.source_factor) {
      factorsMap.set(link.source_factor.id, link.source_factor.name);
    }
    if (link.target_factor) {
      factorsMap.set(link.target_factor.id, link.target_factor.name);
    }
  });

  const factors = Array.from(factorsMap.entries());
  const count = factors.length;

  const radius = Math.max(180, count * 60);
  const centerX = 400;
  const centerY = 300;

  const nodePositions = new Map<string, { x: number; y: number }>();

  const nodes: Node<CausalNodeData>[] = factors.map(([id, name], index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodePositions.set(id, { x, y });

    return {
      id,
      type: "causalNode",
      position: { x, y },
      data: { label: name },
    };
  });

  // Track directional links per pair to assign distinct non-overlapping curved paths
  const pairDirCounts = new Map<string, Map<string, number>>();
  const pairDirSeen = new Map<string, Map<string, number>>();

  links.forEach((link) => {
    const pairKey = [link.source_factor_id, link.target_factor_id]
      .sort()
      .join("::");
    const dirKey = `${link.source_factor_id}->${link.target_factor_id}`;

    if (!pairDirCounts.has(pairKey)) {
      pairDirCounts.set(pairKey, new Map());
    }
    const dirMap = pairDirCounts.get(pairKey)!;
    dirMap.set(dirKey, (dirMap.get(dirKey) || 0) + 1);
  });

  const edges: Edge<CausalEdgeData>[] = links.map((link) => {
    const isSelfLoop = link.source_factor_id === link.target_factor_id;
    const pairKey = [link.source_factor_id, link.target_factor_id]
      .sort()
      .join("::");
    const dirKey = `${link.source_factor_id}->${link.target_factor_id}`;

    if (!pairDirSeen.has(pairKey)) {
      pairDirSeen.set(pairKey, new Map());
    }
    const seenMap = pairDirSeen.get(pairKey)!;
    const sameDirIndex = seenMap.get(dirKey) || 0;
    seenMap.set(dirKey, sameDirIndex + 1);

    const dirMap = pairDirCounts.get(pairKey)!;
    const sameDirCount = dirMap.get(dirKey) || 1;

    let oppositeDirCount = 0;
    dirMap.forEach((cnt, k) => {
      if (k !== dirKey) oppositeDirCount += cnt;
    });

    let curvature = 28;

    if (isSelfLoop) {
      curvature = 52 + sameDirIndex * 20;
    } else if (oppositeDirCount > 0) {
      // Bidirectional edge present: curve outward in this direction's right-hand side so A->B and B->A use complementary, non-overlapping paths
      curvature = 36 + sameDirIndex * 28;
    } else if (sameDirCount > 1) {
      // Multiple edges in same direction: alternate positive/negative curvature offsets
      if (sameDirIndex % 2 === 0) {
        curvature = 32 * (Math.floor(sameDirIndex / 2) + 1);
      } else {
        curvature = -32 * (Math.floor(sameDirIndex / 2) + 1);
      }
    }

    let sourceHandle = "source-right";
    let targetHandle = "target-left";

    if (isSelfLoop) {
      sourceHandle = "source-top";
      targetHandle = "target-right";
    } else {
      const srcPos = nodePositions.get(link.source_factor_id) || { x: 0, y: 0 };
      const tgtPos = nodePositions.get(link.target_factor_id) || { x: 0, y: 0 };
      const angleRad = Math.atan2(tgtPos.y - srcPos.y, tgtPos.x - srcPos.x);
      const angleDeg = (angleRad * 180) / Math.PI;

      if (angleDeg >= -45 && angleDeg < 45) {
        sourceHandle = "source-right";
        targetHandle = "target-left";
      } else if (angleDeg >= 45 && angleDeg < 135) {
        sourceHandle = "source-bottom";
        targetHandle = "target-top";
      } else if (angleDeg >= 135 || angleDeg < -135) {
        sourceHandle = "source-left";
        targetHandle = "target-right";
      } else {
        sourceHandle = "source-top";
        targetHandle = "target-bottom";
      }
    }

    return {
      id: link.id,
      source: link.source_factor_id,
      target: link.target_factor_id,
      sourceHandle,
      targetHandle,
      type: "causalEdge",
      data: {
        polarity: link.polarity,
        hasDelay: link.has_delay,
        curvature,
        isSelfLoop,
        topicId: link.topic_id,
        sourceName: link.source_factor?.name || "Source Factor",
        targetName: link.target_factor?.name || "Target Factor",
      },
    };
  });

  return { nodes, edges, isEmpty: false };
}

interface TopicCanvasProps {
  initialLinks?: TopicLinkItem[];
}

export default function TopicCanvas({ initialLinks = [] }: TopicCanvasProps) {
  const router = useRouter();
  const nodeTypes = useMemo(() => ({ causalNode: CausalNode }), []);
  const edgeTypes = useMemo(() => ({ causalEdge: CausalEdge }), []);

  const initialGraph = buildGraphFromLinks(initialLinks);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);

  const [selectedLinkForEdit, setSelectedLinkForEdit] =
    useState<LinkDataForEdit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const updated = buildGraphFromLinks(initialLinks);
    setNodes(updated.nodes);
    setEdges(updated.edges);
  }, [initialLinks, setNodes, setEdges]);

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge<CausalEdgeData>) => {
      if (edge.data && edge.data.topicId) {
        setSelectedLinkForEdit({
          id: edge.id,
          topicId: edge.data.topicId,
          sourceName: edge.data.sourceName || "Source Factor",
          targetName: edge.data.targetName || "Target Factor",
          polarity: edge.data.polarity,
          hasDelay: edge.data.hasDelay,
        });
        setIsEditModalOpen(true);
      }
    },
    [],
  );

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedLinkForEdit(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-background">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-sm">
          <h3 className="font-semibold text-base text-foreground mb-1">
            No causal links yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Click{" "}
            <span className="font-medium text-foreground">
              &quot;Add Link&quot;
            </span>{" "}
            in the header to connect your factors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Global CSS keyframes for smooth directional flow along edges */}
      <style>{`
        @keyframes causalFlow {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={handleEdgeClick}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={true}
        elementsSelectable={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#cbd5e1"
        />
        <Controls
          showInteractive={false}
          className="!bg-white !border-slate-200 !shadow-none !rounded-md"
        />
        <MiniMap
          nodeColor="#e2e8f0"
          maskColor="rgba(248, 250, 252, 0.7)"
          className="!border-slate-200 !rounded-md !shadow-none"
        />
      </ReactFlow>

      <EditLinkModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
        linkData={selectedLinkForEdit}
      />
    </div>
  );
}
