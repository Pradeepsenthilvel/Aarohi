'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

interface Song { _id: string; title: string; artist: string; genre: string; fileUrl: string; isPremium: boolean; }
interface UserData { _id: string; username: string; email: string; role: string; isPremium: boolean; }

function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState('');
  useEffect(() => {
    const t = localStorage.getItem('aarohi_token');
    const u = localStorage.getItem('aarohi_user');
    if (t && u) { 
      try {
        setToken(t); 
        setUser(JSON.parse(u)); 
      } catch (e) {
        console.error("Auth parse error", e);
        window.location.href = '/login';
      }
    }
    else { window.location.href = '/login'; }
  }, []);
  return { user, token };
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState<'listen' | 'playlists'>('listen');
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Playlist State
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<any | null>(null);
  const [plName, setPlName] = useState('');
  const [plSongs, setPlSongs] = useState<string[]>([]);
  const [plMsg, setPlMsg] = useState('');

  const fetchSongs = async () => {
    try { 
      const r = await fetch(`${API}/music/songs`); 
      const data = await r.json();
      setSongs(Array.isArray(data) ? data : []); 
    } catch (err) { 
      console.error("Fetch songs error", err);
      setSongs([]); 
    }
  };
  
  const fetchPlaylists = async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API}/music/playlists`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const data = await r.json();
        setPlaylists(Array.isArray(data) ? data : []);
      }
    } catch (err) { 
      console.error("Fetch playlists error", err);
      setPlaylists([]); 
    }
  };

  useEffect(() => { 
    if (token) {
      fetchSongs(); 
      fetchPlaylists(); 
    }
  }, [token]);

  // Handle Playback State Transitions
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]); // Run on song switch or toggle

  const handlePlay = (song: Song) => {
    console.log("Play requested for:", song.title);
    
    if (currentSong?._id === song._id) {
      setIsPlaying(!isPlaying);
      return;
    }

    // New Song Selection
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Force immediate load if song changed
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plName) return;
    try {
      const res = await fetch(`${API}/music/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: plName, songIds: plSongs })
      });
      if (res.ok) { 
        setPlName(''); 
        setPlSongs([]); 
        fetchPlaylists(); 
        setPlMsg('Playlist created!'); 
      }
    } catch (err) { 
      setPlMsg('Error creating playlist'); 
    }
  };

  if (!user) return null;

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="parallax-section bg-dashboard" style={{ minHeight: '100vh', padding: 0 }}>
      {/* ── Navbar ── */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: '#fff', textDecoration: 'none' }}>AAROHI</Link>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setTab('listen')} style={{ background: tab === 'listen' ? 'rgba(255,255,255,0.15)' : 'transparent', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}>Listen Now</button>
              <button onClick={() => setTab('playlists')} style={{ background: tab === 'playlists' ? 'rgba(255,255,255,0.15)' : 'transparent', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}>Collections</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {!user.isPremium && <Link href="/premium" className="btn-primary" style={{ padding: '8px 20px', fontSize: 12, borderRadius: 20 }}>UPGRADE TO VIP</Link>}
            <button 
              onClick={() => { 
                console.log("Logging out...");
                localStorage.clear(); 
                window.location.href = '/login'; 
              }} 
              className="btn-secondary" 
              style={{ padding: '8px 20px', fontSize: 12, borderRadius: 20, cursor: 'pointer', pointerEvents: 'all' }}
            >
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      <main className="parallax-content" style={{ padding: '120px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {tab === 'listen' ? (
          <div className="animate-fadeUp">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <h1 style={{ fontSize: 48, fontWeight: 800, color: '#fff' }}>Discover</h1>
              <input 
                type="text" 
                placeholder="Search tracks or artists..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: 30, width: 300, outline: 'none' }}
              />
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              {filteredSongs.map((s, i) => (
                <div 
                  key={s._id} 
                  onClick={() => handlePlay(s)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '20px 32px', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    background: currentSong?._id === s._id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <span style={{ width: 40, color: currentSong?._id === s._id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{currentSong?._id === s._id && isPlaying ? '||' : i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: currentSong?._id === s._id ? 'var(--accent-gold)' : '#fff', fontWeight: 600, fontSize: 16 }}>{s.title}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{s.artist}</p>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 20 }}>{s.genre}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fadeUp" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 40 }}>
             <div>
               <h2 style={{ color: '#fff', fontSize: 32, marginBottom: 24 }}>My Collections</h2>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
                 {playlists.length === 0 ? (
                   <p style={{ color: 'rgba(255,255,255,0.4)' }}>No playlists yet.</p>
                 ) : playlists.map(pl => (
                   <div key={pl._id} className="glass-card" style={{ padding: 24 }}>
                     <h3 style={{ color: '#fff', marginBottom: 8, fontSize: 18 }}>{pl.name}</h3>
                     <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{pl.songs.length} tracks</p>
                   </div>
                 ))}
               </div>
             </div>
             <div className="glass-card-heavy" style={{ padding: 30 }}>
               <h3 style={{ color: '#fff', marginBottom: 20, fontSize: 20 }}>Create Playlist</h3>
               <form onSubmit={handleCreatePlaylist}>
                 <input 
                   value={plName} 
                   onChange={e => setPlName(e.target.value)} 
                   placeholder="Playlist Name" 
                   style={{ width: '100%', padding: 14, marginBottom: 20, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8, outline: 'none' }} 
                 />
                 <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14, fontWeight: 700 }}>CREATE</button>
                 {plMsg && <p style={{ color: 'var(--accent-gold)', fontSize: 13, marginTop: 16, textAlign: 'center' }}>{plMsg}</p>}
               </form>
             </div>
          </div>
        )}
      </main>

      {/* ── Fixed Player Bar ── */}
      {currentSong && (
        <div className="glass-nav animate-fadeUp" style={{ position: 'fixed', bottom: 0, width: '100%', height: 110, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 40px', zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(30px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: 350 }}>
            <div className="pulse" style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #222, #111)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>♪</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentSong.title}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentSong.artist}</p>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <audio 
              ref={audioRef}
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${currentSong.fileUrl}?v=${Date.now()}`}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error("Audio error:", e);
                setIsPlaying(false);
              }}
              onEnded={() => setIsPlaying(false)}
              controls
              style={{ width: '100%', maxWidth: 700, height: 40, filter: 'invert(1) hue-rotate(180deg) brightness(1.5)' }}
            />
          </div>

          <div style={{ width: 350, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20 }}>
            <button 
              onClick={() => { setCurrentSong(null); setIsPlaying(false); }} 
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,50,50,0.2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .pulse { animation: ${isPlaying ? 'pulse 2s infinite' : 'none'}; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(226, 194, 117, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(226, 194, 117, 0); }
          100% { box-shadow: 0 0 0 0 rgba(226, 194, 117, 0); }
        }
      `}</style>
    </div>
  );
}
