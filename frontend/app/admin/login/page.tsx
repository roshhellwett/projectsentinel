'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { setCookie } from '@/lib/utils/cookies';
import { PageShell } from '@/components/layout/PageShell';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();

      if (!data.success || !data.token) {
        setError(data.message || 'Invalid password');
        return;
      }

      setCookie('admin_token', data.token, { maxAge: 86400, path: '/', sameSite: 'Strict' });
      router.push('/admin/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <PageShell className="!px-4 !pb-0">
        <div className="w-full max-w-md mx-auto py-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-accent/15 border border-accent/30 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-accent" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center text-ink mb-2">Admin Login</h1>
          <p className="text-muted text-center mb-6 text-sm">
            Enter your password to access the admin panel
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-paper-2 border border-rule rounded-lg text-ink placeholder-muted focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 mb-4 transition-all"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="tap-target min-h-[44px] w-full py-3 bg-accent hover:bg-accent-hover text-paper font-semibold rounded-lg transition-all disabled:opacity-50 hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </PageShell>
    </div>
  );
}
