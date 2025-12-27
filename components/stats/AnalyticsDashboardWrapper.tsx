"use client";

import React, { useState } from "react";
import Charts from "./Charts";
import Graph from "./Graph";
import Sidebar from "./Sidebar";

import type { Media } from "./Graph";

interface Props {
  items?: Media[];
  onSelectNode?: (id: string | null) => void;
}

export default function AnalyticsDashboardWrapper({ items: propItems, onSelectNode }: Props) {
  const items = propItems || [];
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  return (
    <div className="flex w-full h-screen bg-black overflow-hidden">
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-8 border-b border-white/10">
          <Charts items={items} />
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex-1 relative p-8">
          <div className="h-full">
            <Graph items={items} onSelectNode={(id) => { setSelectedNodeId(id); onSelectNode?.(id); }} />
          </div>
        </div>
      </div>

      {selectedNodeId && (
        <Sidebar selectedNodeId={selectedNodeId} setSelectedNodeId={setSelectedNodeId} items={items as any} />
      )}
    </div>
  );
}
