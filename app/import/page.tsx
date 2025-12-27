"use client";

import { useEffect, useState } from "react";
import { useMediaStore } from "@/store/mediaStore";

export default function ImportPage() {
  const { media, setMedia } = useMediaStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const loadBackup = async () => {
      try {
        // Fetch the backup file from Downloads
        const response = await fetch("/api/load-backup");
        if (!response.ok) {
          throw new Error(`Failed to load backup: ${response.statusText}`);
        }
        const backupData = await response.json();

        if (!Array.isArray(backupData)) {
          throw new Error("Backup data is not an array");
        }

        // Merge with existing media, avoiding duplicates
        const currentIds = new Set(media.map((m) => m.id));
        const newEntries = backupData.filter((m) => !currentIds.has(m.id));

        setMedia([...media, ...newEntries]);
        setItemCount(newEntries.length);
        setStatus("success");
        setMessage(`Imported ${newEntries.length} new items. Total: ${media.length + newEntries.length}`);

        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = "/?view=neural-map";
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Unknown error");
      }
    };

    loadBackup();
  }, []);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
            Import Library
          </h1>
          <p className="text-sm text-neutral-400">Loading your vault backup...</p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-neutral-300">Processing backup file...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4 text-center">
              <div className="text-4xl">✓</div>
              <p className="text-sm text-green-400 font-semibold">{message}</p>
              <p className="text-xs text-neutral-500">Redirecting to Neural Map...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4 text-center">
              <div className="text-4xl">✕</div>
              <p className="text-sm text-red-400">{message}</p>
              <button
                onClick={() => window.location.href = "/"}
                className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-lg text-xs font-semibold hover:bg-sky-600 transition"
              >
                Return to Vault
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
