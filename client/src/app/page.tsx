'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

const FEATURES = [
  { icon: '🎧', title: 'Studio Fidelity', desc: 'Stream uncompressed, lossless audio directly from the master recordings. Hear every detail.' },
  { icon: '🌐', title: 'Global Delivery', desc: 'Zero buffering. Our edge network ensures your tracks play instantly, no matter where you are.' },
  { icon: '🧠', title: 'Curated Intelligence', desc: 'Advanced algorithms build playlists that adapt to your mood and environment in real-time.' },
  { icon: '💎', title: 'Creator Royalty', desc: 'We take zero cut from your direct sales. You keep 100% of your premium download revenue.' },
  { icon: '🔒', title: 'Ironclad Security', desc: 'Military-grade encryption protects your catalog. Your music is safe with us.' },
  { icon: '🎛️', title: 'Command Center', desc: 'A beautiful, intuitive dashboard gives you total control over your audience and analytics.' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/music/songs`)
      .then(res => res.json())
      .then(data => setSongs(data))
      .catch(console.error);
  }, []);

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: '#000' }}>
      
      {/* ── Nav ── */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 12, height: 12, background: '#000', borderRadius: '50%' }} />
              </div>
              <span className="font-serif" style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Aarohi</span>
            </Link>
            
            <div className="hidden md:flex gap-8">
              {['Discover', 'Features', 'Premium'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}>{item}</a>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '10px 20px', transition: 'opacity 0.3s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.opacity = '0.7'}
              onMouseLeave={e => (e.target as HTMLElement).style.opacity = '1'}>Sign In</Link>
            <Link href="/register" className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>Try Premium</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Parallax ── */}
      <section className="parallax-section bg-hero">
        <div className="parallax-content animate-fadeUp" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div className="glass-card-heavy" style={{ maxWidth: 800, width: '100%', marginBottom: 60 }}>
            <p className="text-overline" style={{ marginBottom: 20 }}>The Audiophile Standard</p>
            <h1 className="text-display font-serif" style={{ marginBottom: 30 }}>
              Pure Sound.<br/>Zero Compromise.
            </h1>
            <p style={{ fontSize: 20, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 48px', fontWeight: 400, lineHeight: 1.6 }}>
              Aarohi is the definitive platform for creators and listeners who demand perfection. Immersive streaming, lossless downloads, and a truly premium experience.
            </p>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn-primary" style={{ padding: '18px 48px', fontSize: 16 }}>Start Listening</Link>
              <a href="#discover" className="btn-secondary" style={{ padding: '18px 48px', fontSize: 16, textDecoration: 'none' }}>Discover Music</a>
            </div>
          </div>
          
        </div>
      </section>

      {/* ── Discover & Search ── */}
      <section id="discover" style={{ padding: '100px 40px', background: '#0a0a0a', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="text-title font-serif" style={{ marginBottom: 16 }}>Discover Our Catalog</h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)' }}>Search through our collection of high-fidelity tracks.</p>
          </div>
          
          <input 
            type="text" 
            placeholder="Search tracks or artists..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ borderRadius: 100, padding: '16px 32px', fontSize: 18, marginBottom: 40, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredSongs.slice(0, 5).map(song => (
              <div key={song._id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', cursor: 'pointer', transition: 'all 0.2s' }}
                   onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                   onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                   onClick={() => window.location.href = '/register'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{song.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{song.artist}</p>
                  </div>
                </div>
                <div style={{ padding: '8px 16px', borderRadius: 100, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontWeight: 600 }}>Play</div>
              </div>
            ))}
            {filteredSongs.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No tracks found.</p>
            )}
            {filteredSongs.length > 5 && (
              <p style={{ textAlign: 'center', color: 'var(--accent-gold)', fontSize: 14, marginTop: 20, cursor: 'pointer' }} onClick={() => window.location.href = '/register'}>
                Sign up to see {filteredSongs.length - 5} more tracks...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '140px 40px', background: '#050505', position: 'relative', zIndex: 10 }}>
        <div className="animate-fadeUp delay-1" style={{ textAlign: 'center', marginBottom: 80, maxWidth: 1400, margin: '0 auto 80px' }}>
          <h2 className="text-title font-serif">Engineered for Excellence</h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 16 }}>Every feature is crafted to elevate your audio experience.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 30, maxWidth: 1400, margin: '0 auto' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="glass-card animate-fadeUp" style={{ animationDelay: `${(i+2)*100}ms` }}>
              <div style={{ fontSize: 32, marginBottom: 24, display: 'inline-flex', padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: '#fff' }}>{f.title}</h3>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Premium Parallax ── */}
      <section id="premium" className="parallax-section bg-premium">
        <div className="parallax-content animate-fadeUp delay-1">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 className="text-title font-serif" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>Choose Your Experience</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 40, maxWidth: 900, margin: '0 auto' }}>
            
            {/* Free Tier */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Standard</h3>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 40 }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8 }}>$</span>
                <span style={{ fontSize: 64, fontWeight: 700, lineHeight: 1 }}>0</span>
                <span style={{ fontSize: 16, color: 'var(--text-tertiary)', alignSelf: 'flex-end', paddingBottom: 10 }}>/mo</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexGrow: 1, marginBottom: 40 }}>
                {['High-quality streaming (320kbps)', 'Ad-supported playback', 'Basic playlist generation', 'Community access'].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{feat}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-secondary" style={{ width: '100%' }}>Join Free</Link>
            </div>

            {/* Premium Tier */}
            <div className="glass-card-heavy" style={{ display: 'flex', flexDirection: 'column', transform: 'scale(1.05)' }}>
              <div style={{ position: 'absolute', top: 24, right: 24 }}>
                <span style={{ background: '#fff', color: '#000', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>VIP Access</span>
              </div>
              
              <h3 className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Audiophile</h3>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 40 }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8 }}>$</span>
                <span style={{ fontSize: 64, fontWeight: 700, lineHeight: 1, color: '#fff' }}>9.99</span>
                <span style={{ fontSize: 16, color: 'var(--text-secondary)', alignSelf: 'flex-end', paddingBottom: 10 }}>/mo</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexGrow: 1, marginBottom: 40 }}>
                {['Lossless Master Quality (FLAC)', 'Zero interruptions. Ad-free forever.', 'Unlimited high-res downloads', 'Early access to exclusive releases', '24/7 Priority VIP support'].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                    <span style={{ color: '#fff', fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Upgrade to VIP</Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px', background: '#020202', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 24, height: 24, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, background: '#000', borderRadius: '50%' }} />
            </div>
            <span className="font-serif" style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Aarohi</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            © 2026 Aarohi Music. Pure Sound.
          </p>
        </div>
      </footer>

    </div>
  );
}
