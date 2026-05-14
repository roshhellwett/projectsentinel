'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

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

      const data = await response.json();

      if (data.success) {
        document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
        router.push('/admin/');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="premium-card rounded-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-accent/15 border border-accent/30 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-accent" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center text-slate-950 mb-2">Admin Login</h1>
          <p className="text-slate-600 text-center mb-6 text-sm">
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
              className="w-full px-4 py-3 bg-white/70 border border-slate-950/[0.10] rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 mb-4 transition-all"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-glow-accent hover:shadow-glow-accent-lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
