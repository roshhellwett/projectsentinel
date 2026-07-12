"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Z_INDEX } from "@/lib/theme/zIndex";
import { Post } from "@/types";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/utils/bodyScrollLock";
import { invalidatePostsCache } from "@/lib/utils/fetchCache";
import { showToast } from "@/lib/utils/toast";

interface CorrectionFormProps {
  post: Post;
  type: "corrected" | "retracted";
  onClose: () => void;
  onSuccess?: (updatedPost: Post) => void;
}

export function CorrectionForm({
  post,
  type,
  onClose,
  onSuccess,
}: CorrectionFormProps) {
  const [note, setNote] = useState(post.correction_note || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin_token="))
        ?.split("=")[1];

      const response = await fetch(`/api/post/${post.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: type,
          correction_note: note,
        }),
      });

      if (response.ok) {
        invalidatePostsCache();
        showToast(`Article marked as ${type}`, "success");
        const updatedPost: Post = {
          ...post,
          status: type,
          correction_note: note,
        };
        if (onSuccess) {
          onSuccess(updatedPost);
        } else {
          window.location.reload();
        }
        onClose();
      } else {
        const payload = await response.json().catch(() => ({}));
        setError(payload?.error || `Request failed (${response.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-slate-950/40 md:bg-slate-950/25 ${Z_INDEX.adminModal} flex items-center justify-center p-4`}
      onClick={onClose}
    >
      <div
        className="bg-paper border border-rule-strong rounded-md p-6 w-full max-w-lg shadow-paper-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">
            {type === "corrected" ? "Add Correction" : "Retract Article"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="tap-target p-1 hover:bg-paper-2 rounded text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-muted mb-4">Article: {post.headline}</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <label
            htmlFor="correction-note"
            className="block text-sm text-muted mb-2"
          >
            {type === "corrected" ? "Correction Note" : "Retraction Reason"}
          </label>
          <textarea
            id="correction-note"
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              type === "corrected"
                ? "Explain what was corrected..."
                : "Explain why this article is being retracted..."
            }
            className="w-full px-4 py-3 bg-paper-2 border border-rule rounded text-ink placeholder-muted focus:outline-none focus:border-accent mb-4 min-h-[100px]"
            required
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-paper-2 border border-rule hover:bg-rule text-ink font-medium rounded transition-colors hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 text-paper font-medium rounded hover-lift transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                type === "corrected"
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {loading
                ? "Saving..."
                : type === "corrected"
                  ? "Add Correction"
                  : "Retract"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
