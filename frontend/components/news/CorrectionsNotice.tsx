/**
 * Banner for corrected or retracted posts
 */

import { AlertTriangle, XCircle } from 'lucide-react';

interface CorrectionsNoticeProps {
  type: 'corrected' | 'retracted';
  note?: string | null;
}

export function CorrectionsNotice({ type, note }: CorrectionsNoticeProps) {
  const isRetracted = type === 'retracted';
  
  return (
    <div className={`mb-6 p-4 rounded-lg ${isRetracted ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
      <div className="flex items-start gap-3">
        {isRetracted ? (
          <XCircle className="w-5 h-5 text-cred-low flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-cred-mid flex-shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className={`font-medium ${isRetracted ? 'text-cred-low' : 'text-cred-mid'}`}>
            {isRetracted ? 'Article Retracted' : 'Correction Notice'}
          </h4>
          {note && (
            <p className="text-sm text-slate-600 mt-1">
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
