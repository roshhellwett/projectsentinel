'use client';

import { AlertTriangle, XCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-shared';

interface CorrectionsNoticeProps {
  type: 'corrected' | 'retracted';
  note?: string | null;
}

export function CorrectionsNotice({ type, note }: CorrectionsNoticeProps) {
  const { t } = useI18n();
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
            {isRetracted ? t('drawer.retracted') : t('drawer.corrected')}
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

