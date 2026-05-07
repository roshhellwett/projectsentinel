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
    <div className={`mb-6 p-4 rounded-lg ${isRetracted ? 'bg-danger/20 border border-danger' : 'bg-warning/20 border border-warning'}`}>
      <div className="flex items-start gap-3">
        {isRetracted ? (
          <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className={`font-medium ${isRetracted ? 'text-danger' : 'text-warning'}`}>
            {isRetracted ? 'Article Retracted' : 'Correction Notice'}
          </h4>
          {note && (
            <p className="text-sm text-gray-300 mt-1">
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
