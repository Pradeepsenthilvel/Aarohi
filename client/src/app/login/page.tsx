'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('aarohi_token', data.token);
      localStorage.setItem('aarohi_user', JSON.stringify(data));
      window.location.href = data.role === 'admin' ? '/admin' : '/dashboard';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parallax-section bg-hero" style={{ minHeight: '100vh', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      <div className="glass-card-heavy animate-fadeUp" style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, background: '#000', borderRadius: '50%' }} />
            </div>
          </Link>
          <h1 className="font-serif" style={{ fontSize: 32, fontWeight: 700, marginTop: 24, color: '#fff' }}>Welcome Back</h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 8 }}>Sign in to continue your audio journey.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#ff6b6b', fontSize: 14 }}>{error}</div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Email or Username</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com or username" className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 12, padding: '16px 0', fontSize: 16, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--text-secondary)', marginTop: 32 }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Create Profile</Link>
        </p>
      </div>
    </div>
  );
}
