"use client";

import { useEffect } from "react";
import { X, Trash2, Download, ShieldAlert, Cpu } from "lucide-react";
import { BulkMetadataRefresh } from "../ui";
import { useMediaStore } from "@/store/mediaStore";

interface Props {
  onClose: () => void;
}

export const VaultSettings = ({ onClose }: Props) => {
  // Debug check
  useEffect(() => {
    console.log("Settings Modal Mounted");
  }, []);

  const { media, setMedia } = useMediaStore();

  const exportData = () => {
    const dataStr = JSON.stringify(media, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const clearVault = () => {
    if (confirm("CRITICAL: This will wipe your entire local database. Proceed?")) {
      setMedia([]);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-600 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-[#050505] w-full max-w-md rounded-[40px] border border-neutral-900 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <Cpu size={18} className="text-sky-500" />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">System Settings</h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 bg-neutral-900 text-neutral-500 hover:text-white rounded-2xl transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Backup Action */}
            <button 
              onClick={exportData}
              className="w-full flex items-center justify-between p-6 bg-neutral-950 border border-neutral-900 rounded-4xl group hover:border-sky-500/50 transition-all"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase italic">Export Data</h3>
                  <p className="text-[9px] text-neutral-600 uppercase font-bold tracking-tight">Save local storage to JSON</p>
                </div>
              </div>
            </button>
            {/* Bulk Refresh Action (embedded component) */}
            <div>
              <BulkMetadataRefresh />
            </div>

            {/* Wipe Action */}
            <button 
              onClick={clearVault}
              className="w-full flex items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-4xl group hover:bg-red-500/10 hover:border-red-500/50 transition-all"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-red-500 uppercase italic">Purge Vault</h3>
                  <p className="text-[9px] text-red-500/40 uppercase font-bold tracking-tight">Delete all records forever</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-10 pt-6 border-t border-neutral-900 text-center">
             <p className="text-[8px] text-neutral-800 font-black uppercase tracking-[0.5em]">Neural Link Established</p>
          </div>
        </div>
      </div>
    </div>
  );
};