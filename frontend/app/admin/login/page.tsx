/**
 * Admin login page
 */

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
        // Set cookie or session
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
        <div className="bg-surface rounded-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-accent" />
            </div>
          </div>
          
          <h1 className="text-2xl font-medium text-center mb-2">Admin Login</h1>
          <p className="text-gray-400 text-center mb-6">
            Enter your password to access the admin panel
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-danger/20 text-danger rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-background border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent mb-4"
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
