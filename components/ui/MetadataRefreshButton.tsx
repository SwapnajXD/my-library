"use client";

import React, { useState } from "react";
import { Button } from "./Button";
import { RefreshCw, Loader2 } from "lucide-react";

interface MetadataRefreshButtonProps {
  onRefresh?: () => Promise<void> | void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  children?: React.ReactNode;
}

export const MetadataRefreshButton = ({
  onRefresh,
  variant = 'ghost',
  className,
  children = 'Refresh Metadata',
}: MetadataRefreshButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    try {
      setLoading(true);
      if (onRefresh) {
        await Promise.resolve(onRefresh());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
      {children}
    </Button>
  );
};
