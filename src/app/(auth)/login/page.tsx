'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.data.name || data.data.email);
        router.push('/');
      } else {
        setError(data.error || 'Failed to login');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 relative z-10 w-full overflow-hidden">
      <div className="w-full max-w-md glass-card rounded-[2rem] p-10 flex flex-col relative overflow-hidden bg-white/50 dark:bg-black/20">
        {/* Subtle inner top glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

        <h1 className="text-4xl font-heading font-black text-center mb-10 text-zinc-900 dark:text-zinc-50 tracking-tight dark:text-glow">Welcome Back</h1>
        
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 font-bold p-4 rounded-xl mb-6 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-4 rounded-xl bg-zinc-900/5 dark:bg-black/20 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-4 rounded-xl bg-zinc-900/5 dark:bg-black/20 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 font-heading font-bold bg-zinc-900/10 dark:bg-white/10 hover:bg-zinc-900/20 dark:hover:bg-white/20 border border-transparent dark:border-white/10 text-zinc-800 dark:text-zinc-50 py-4 px-6 rounded-xl text-lg transition-all active:scale-95 disabled:opacity-50 tracking-wide"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
          No account? <Link href="/signup" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 dark:hover:text-glow transition-all ml-2">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
