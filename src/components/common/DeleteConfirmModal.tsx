import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  itemName?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message = "This action will permanently delete the record from the database. Are you sure you want to proceed?",
  itemName,
  confirmLabel = "Confirm Delete",
  isDeleting = false,
  onConfirm,
  onClose
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-[#0d0d12] border border-red-500/20 rounded-2xl p-6 shadow-2xl relative text-left text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Warning Icon & Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
              {itemName && (
                <p className="text-xs font-mono text-red-400 mt-0.5 break-all">
                  &ldquo;{itemName}&rdquo;
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 border border-red-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>{isDeleting ? "Deleting from Database..." : confirmLabel}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
