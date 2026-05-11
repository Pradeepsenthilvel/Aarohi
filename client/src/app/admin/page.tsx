'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

interface User { _id: string; username: string; email: string; role: string; isPremium: boolean; createdAt: string; }
interface Song { _id: string; title: string; artist: string; genre: string; isPremium: boolean; }

export default function AdminPanel() {
  const [tab, setTab] = useState<'overview' | 'users' | 'music' | 'upload' | 'payments'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [token, setToken] = useState('');

  // Upload state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isPremiumTrack, setIsPremiumTrack] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('aarohi_token');
    const u = localStorage.getItem('aarohi_user');
    if (!t || !u) { window.location.href = '/login'; return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== 'admin') { window.location.href = '/dashboard'; return; }
    setToken(t);
  }, []);

  const fetchMusic = () => fetch(`${API}/music/songs`).then(r => r.json()).then(setSongs).catch(() => {});
  
  useEffect(() => {
    if (!token) return;
    fetchMusic();
    fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d); }).catch(() => {});
  }, [token]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setUploadMsg('Please select an MP3 file'); return; }
    setUploading(true); setUploadMsg('');
    const fd = new FormData();
    fd.append('audioFile', file); fd.append('title', title); fd.append('artist', artist); fd.append('genre', genre); fd.append('isPremium', String(isPremiumTrack));
    try {
      const res = await fetch(`${API}/music/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setUploadMsg('Track uploaded successfully'); setTitle(''); setArtist(''); setGenre(''); setFile(null); setIsPremiumTrack(false); fetchMusic();
    } catch (err: unknown) { setUploadMsg(err instanceof Error ? err.message : 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this track?')) return;
    try {
      const res = await fetch(`${API}/music/songs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to delete'); }
      fetchMusic();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Deletion failed');
    }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/'; };
  
  const TABS = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'users' as const, label: 'Users' },
    { key: 'music' as const, label: 'Library' },
    { key: 'upload' as const, label: 'Upload Master' },
    { key: 'payments' as const, label: 'Payments' },
  ];

  const stats = [
    { label: 'Total Users', value: users.length, color: 'rgba(52,199,89,1)' },
    { label: 'Total Tracks', value: songs.length, color: 'rgba(0,240,255,1)' },
    { label: 'Premium Tracks', value: songs.filter(s => s.isPremium).length, color: 'var(--accent-gold)' },
    { label: 'Premium Users', value: users.filter(u => u.isPremium).length, color: 'rgba(255,100,255,1)' },
  ];

  return (
    <div className="parallax-section bg-dashboard" style={{ minHeight: '100vh', padding: 0, justifyContent: 'flex-start' }}>
      {/* ── Top Bar ── */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, background: 'var(--accent-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 12, height: 12, background: '#000', borderRadius: '50%' }} />
              </div>
              <span className="font-serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-gold)' }}>Aarohi Admin</span>
            </Link>
            <div style={{ display: 'flex', gap: 8 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ padding: '8px 20px', fontSize: 14, fontWeight: 600, borderRadius: 99, border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                    background: tab === t.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: tab === t.key ? '#fff' : 'var(--text-secondary)' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>← Return to App</Link>
            <button onClick={logout} className="btn-secondary" style={{ padding: '8px 20px', fontSize: 13 }}>Sign out</button>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="parallax-content" style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 40px 140px', width: '100%' }}>
        
        {/* Overview */}
        {tab === 'overview' && (
          <div className="animate-fadeUp">
            <h1 className="font-serif" style={{ fontSize: 40, fontWeight: 700, color: '#fff', marginBottom: 40, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>System Overview</h1>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 48 }}>
              {stats.map((s, i) => (
                <div key={i} className="glass-card" style={{ padding: '32px 24px', borderTop: `4px solid ${s.color}` }}>
                  <p style={{ fontSize: 48, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Users */}
            <div className="glass-card-heavy">
              <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Recent Users</h2>
              {users.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 15, padding: '20px 0' }}>No users yet.</p>
              ) : (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                  {users.slice(0, 5).map((u, i) => (
                    <div key={u._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 100px 80px', gap: 16, padding: '16px 24px', borderBottom: i < Math.min(users.length, 5) - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0 }}>{u.username[0]?.toUpperCase()}</div>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{u.username}</span>
                      </div>
                      <span style={{ fontSize: 15, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>{u.email}</span>
                      <span style={{ display: 'flex', alignItems: 'center' }}>{u.isPremium ? <span style={{ background: 'var(--accent-gold)', color: '#000', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>VIP</span> : <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Free</span>}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', textTransform: 'capitalize', fontWeight: 600 }}>{u.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="animate-fadeUp">
            <h1 className="font-serif" style={{ fontSize: 40, fontWeight: 700, color: '#fff', marginBottom: 40, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>User Directory</h1>
            <div className="glass-card">
              {users.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: 15, padding: '20px 0' }}>No users registered.</p> : (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 100px 80px', gap: 16, padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.4)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>User</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Status</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Role</span>
                  </div>
                  {users.map((u, i) => (
                    <div key={u._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 100px 80px', gap: 16, padding: '16px 24px', borderBottom: i < users.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0 }}>{u.username[0]?.toUpperCase()}</div>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{u.username}</span>
                      </div>
                      <span style={{ fontSize: 15, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>{u.email}</span>
                      <span style={{ display: 'flex', alignItems: 'center' }}>{u.isPremium ? <span style={{ background: 'var(--accent-gold)', color: '#000', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>VIP</span> : <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Free</span>}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', textTransform: 'capitalize', fontWeight: 600 }}>{u.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Music Library */}
        {tab === 'music' && (
          <div className="animate-fadeUp">
            <h1 className="font-serif" style={{ fontSize: 40, fontWeight: 700, color: '#fff', marginBottom: 40, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Master Library</h1>
            <div className="glass-card">
              {songs.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: 15, padding: '20px 0' }}>No tracks uploaded yet.</p> : (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 140px 100px 40px', gap: 20, padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.4)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em' }}>#</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Title</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Genre</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Type</span>
                    <span />
                  </div>
                  {songs.map((s, i) => (
                    <div key={s._id} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 140px 100px 40px', gap: 20, padding: '16px 24px', borderBottom: i < songs.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <span style={{ fontSize: 15, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>{i + 1}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>♪</div>
                        <div><p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{s.title}</p><p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.artist}</p></div>
                      </div>
                      <span style={{ fontSize: 15, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>{s.genre}</span>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {s.isPremium ? <span style={{ background: 'var(--accent-gold)', color: '#000', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>VIP</span> : <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Free</span>}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleDeleteSong(s._id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 20, fontWeight: 300, transition: 'all 0.2s', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>✕</button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Master (Moved from Dashboard) */}
        {tab === 'upload' && (
          <div className="animate-fadeUp" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
              <h1 className="font-serif" style={{ fontSize: 40, fontWeight: 700, color: '#fff', marginBottom: 8, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Upload Master</h1>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Add new tracks to the platform. (Admin Only)</p>
            </div>
            <div className="glass-card-heavy">
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {uploadMsg && (
                <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', background: uploadMsg.includes('success') ? 'rgba(52,199,89,0.1)' : 'rgba(255,50,50,0.1)', border: `1px solid ${uploadMsg.includes('success') ? 'rgba(52,199,89,0.3)' : 'rgba(255,50,50,0.3)'}`, color: uploadMsg.includes('success') ? '#34c759' : '#ff6b6b', fontSize: 15 }}>{uploadMsg}</div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10 }}>Track Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Enter track title" className="input-field" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10 }}>Artist</label>
                  <input type="text" value={artist} onChange={e => setArtist(e.target.value)} required placeholder="Artist name" className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10 }}>Genre</label>
                  <input type="text" value={genre} onChange={e => setGenre(e.target.value)} required placeholder="Pop, Rock…" className="input-field" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10 }}>Audio File</label>
                <div style={{ padding: '40px 24px', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.3)', textAlign: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.3)'; }}>
                  <input type="file" accept=".mp3,audio/mpeg" onChange={e => setFile(e.target.files?.[0] || null)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  <p style={{ fontSize: 32, marginBottom: 12, opacity: 0.5, color: '#fff' }}>↑</p>
                  <p style={{ fontSize: 16, color: '#fff', fontWeight: 500 }}>{file ? file.name : 'Drop an MP3 here or click to browse'}</p>
                  <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 8 }}>MP3 format, max 50MB</p>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <input type="checkbox" checked={isPremiumTrack} onChange={e => setIsPremiumTrack(e.target.checked)} style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>VIP Exclusive (requires premium access)</span>
              </label>
              <button type="submit" disabled={uploading} className="btn-primary" style={{ width: '100%', padding: '18px 0', marginTop: 16, fontSize: 16, opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Processing…' : 'Publish Track'}
              </button>
            </form>
            </div>
          </div>
        )}

        {/* Payments */}
        {tab === 'payments' && (
          <div className="animate-fadeUp">
            <h1 className="font-serif" style={{ fontSize: 40, fontWeight: 700, color: '#fff', marginBottom: 8, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Payments</h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40 }}>Connected to Stripe Test Environment</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'Premium Track Download', amount: '+$1.99', status: 'Succeeded' },
                { title: 'Premium Subscription', amount: '+$4.99', status: 'Succeeded' },
                { title: 'Premium Track Download', amount: '+$1.99', status: 'Succeeded' },
              ].map((tx, i) => (
                <div key={i} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px' }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{tx.title}</p>
                    <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>pi_test_...{String(Math.random()).slice(2, 7)} · {new Date().toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{tx.amount}</p>
                    <p style={{ fontSize: 13, color: '#34c759', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
