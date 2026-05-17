'use client';

// last edited 2026-05-17 by roshhellwett

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Post } from '@/types';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/utils/bodyScrollLock';

interface CorrectionFormProps {
  post: Post;
  type: 'corrected' | 'retracted';
  onClose: () => void;
}

export function CorrectionForm({ post, type, onClose }: CorrectionFormProps) {
  const [note, setNote] = useState(post.correction_note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('admin_token='))
        ?.split('=')[1];

      const response = await fetch(`/api/post/${post.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: type,
          correction_note: note
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || `Request failed (${response.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/25 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white/95 border border-slate-950/[0.10] rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">
            {type === 'corrected' ? 'Add Correction' : 'Retract Article'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-950/[0.06] rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-600 mb-4">
          Article: {post.headline}
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <label className="block text-sm text-slate-600 mb-2">
            {type === 'corrected' ? 'Correction Note' : 'Retraction Reason'}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={type === 'corrected'
              ? 'Explain what was corrected...'
              : 'Explain why this article is being retracted...'
            }
            className="w-full px-4 py-3 bg-white/70 border border-slate-950/[0.10] rounded-lg text-slate-950 placeholder-slate-400 focus:outline-none focus:border-accent mb-4 min-h-[100px]"
            required
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-950/[0.06] hover:bg-slate-950/[0.10] text-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 text-white rounded-lg transition-colors disabled:opacity-50 ${
                type === 'corrected'
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading ? 'Saving...' : (type === 'corrected' ? 'Add Correction' : 'Retract')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
