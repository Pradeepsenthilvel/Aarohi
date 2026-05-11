'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      localStorage.setItem('aarohi_token', data.token);
      localStorage.setItem('aarohi_user', JSON.stringify(data));
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parallax-section bg-premium" style={{ minHeight: '100vh', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      <div className="glass-card-heavy animate-fadeUp" style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, background: '#000', borderRadius: '50%' }} />
            </div>
          </Link>
          <h1 className="font-serif" style={{ fontSize: 32, fontWeight: 700, marginTop: 24, color: '#fff' }}>Join Aarohi</h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 8 }}>Initialize your premium audio profile.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#ff6b6b', fontSize: 14 }}>{error}</div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="johndoe" className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimum 6 characters" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 12, padding: '16px 0', fontSize: 16, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--text-secondary)', marginTop: 32 }}>
          Already registered?{' '}
          <Link href="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
