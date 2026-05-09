/**
 * Form to add correction note and change status
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Post } from '@/types';

interface CorrectionFormProps {
  post: Post;
  type: 'corrected' | 'retracted';
  onClose: () => void;
}

export function CorrectionForm({ post, type, onClose }: CorrectionFormProps) {
  const [note, setNote] = useState(post.correction_note || '');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
      }
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-white/[0.08] rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">
            {type === 'corrected' ? 'Add Correction' : 'Retract Article'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/[0.06] rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-400 mb-4">
          Article: {post.headline}
        </p>
        
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-gray-400 mb-2">
            {type === 'corrected' ? 'Correction Note' : 'Retraction Reason'}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={type === 'corrected' 
              ? 'Explain what was corrected...' 
              : 'Explain why this article is being retracted...'
            }
            className="w-full px-4 py-3 bg-background border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent mb-4 min-h-[100px]"
            required
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/[0.06] hover:bg-white/[0.10] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 text-white rounded-lg transition-colors disabled:opacity-50 ${
                type === 'corrected' 
                  ? 'bg-cred-mid hover:bg-cred-mid/80' 
                  : 'bg-cred-low hover:bg-cred-low/80'
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
