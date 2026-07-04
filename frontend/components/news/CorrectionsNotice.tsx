import { AlertTriangle, XCircle } from 'lucide-react';

interface CorrectionsNoticeProps {
  type: 'corrected' | 'retracted';
  note?: string | null;
}

export function CorrectionsNotice({ type, note }: CorrectionsNoticeProps) {
  const isRetracted = type === 'retracted';

  return (
    <div role="alert" className={`mb-6 p-4 rounded-lg ${isRetracted ? 'bg-cred-low/10 border border-cred-low/30' : 'bg-cred-mid/10 border border-cred-mid/30'}`}>
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
            <p className="text-sm text-muted mt-1">
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

