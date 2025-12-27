"use client";

import React, { useState } from "react";
import { MetadataRefreshButton } from "./MetadataRefreshButton";
import { ProgressBar } from "./ProgressBar";
import { useMediaStore } from "@/store/mediaStore";
import { ModalBase } from "./ModalBase";
import { Button } from "./Button";

export const BulkMetadataRefresh = () => {
  const bulkRefresh = useMediaStore((s: any) => s.bulkRefreshMissingMetadata);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const start = async () => {
    if (running) return;
    setRunning(true);
    setDone(0);
    setTotal(0);
    try {
      await bulkRefresh({
        concurrency: 4,
        onProgress: (d: number, t: number) => {
          setDone(d);
          setTotal(t);
        },
      });
    } finally {
      setRunning(false);
      setShowConfirm(false);
    }
  };

  const percentage = total > 0 ? Math.min((done / total) * 100, 100) : 0;

  return (
    <>
      <div className="w-full max-w-md p-4 bg-neutral-900 rounded-xl">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="text-sm font-semibold">Bulk Metadata Refresh</div>
          <MetadataRefreshButton
            onRefresh={() => setShowConfirm(true)}
            variant="secondary"
            className="text-xs px-3 py-1"
          >
            {running ? 'Running...' : 'Refresh Missing'}
          </MetadataRefreshButton>
        </div>

        <div className="text-[11px] text-neutral-400 mb-2">{done} / {total} items updated</div>

        <div className="h-3">
          <ProgressBar progress={done} total={total || 1} showGlow={running} />
        </div>
      </div>

      {showConfirm && (
        <ModalBase title="Confirm Bulk Refresh" onClose={() => setShowConfirm(false)}>
          <div className="mb-4 text-sm">This will attempt to fetch missing metadata for {total || 'all'} items. This may take a while and is subject to external API rate limits. Proceed?</div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button variant="primary" onClick={start} disabled={running}>{running ? 'Running...' : 'Start Refresh'}</Button>
          </div>
        </ModalBase>
      )}
    </>
  );
};
