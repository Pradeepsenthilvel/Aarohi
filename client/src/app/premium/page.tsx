'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

interface UserData { _id: string; username: string; email: string; role: string; isPremium: boolean; token: string; }

export default function PremiumUpgrade() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('aarohi_user');
    if (u) { setUser(JSON.parse(u)); }
    else { window.location.href = '/login'; }
  }, []);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API}/payment/create-order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.message || 'Failed to create order');

      // Load Razorpay Script
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        amount: order.amount,
        currency: order.currency,
        name: 'Aarohi VIP',
        description: 'Lifetime VIP Upgrade',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${API}/payment/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message || 'Verification failed');
            
            localStorage.setItem('aarohi_user', JSON.stringify(verifyData));
            setUser(verifyData);
            setSuccess(true);
          } catch (err: unknown) {
            alert('Verification Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
          }
        },
        prefill: { name: user.username, email: user.email },
        theme: { color: '#d4af37' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setErrorMsg(response.error.description);
      });
      rzp.open();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (success || user.isPremium) {
    return (
      <div className="parallax-section bg-premium" style={{ minHeight: '100vh', padding: 0 }}>
        <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', height: 72, display: 'flex', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>← Return to Dashboard</Link>
          </div>
        </nav>
        <main className="parallax-content" style={{ maxWidth: 600, margin: '0 auto', padding: '160px 40px 140px', textAlign: 'center' }}>
          <div className="glass-card-heavy animate-fadeUp">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-gold), #ffbf00)', margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#000', boxShadow: '0 0 40px rgba(212,175,55,0.4)' }}>✓</div>
            <h1 className="font-serif" style={{ fontSize: 48, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Welcome to VIP</h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.6 }}>Your account has been upgraded. You now have unlimited access to exclusive high-fidelity master tracks and lossless downloads.</p>
            <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-block', padding: '16px 40px', textDecoration: 'none', fontSize: 16 }}>Start Listening</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="parallax-section bg-premium" style={{ minHeight: '100vh', padding: 0 }}>
      {/* ── Top Bar ── */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 12, height: 12, background: '#000', borderRadius: '50%' }} />
            </div>
            <span className="font-serif" style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Aarohi</span>
          </Link>
          <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>Cancel</Link>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="parallax-content" style={{ maxWidth: 1000, margin: '0 auto', padding: '140px 40px 140px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }} className="animate-fadeUp">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Elevate Your Sound</p>
          <h1 className="font-serif" style={{ fontSize: 56, fontWeight: 700, color: '#fff', marginBottom: 20, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Aarohi VIP</h1>
          <p style={{ fontSize: 20, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>Experience music exactly as the artists intended. Uncompressed, unlimited, and absolutely pristine.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'stretch' }} className="animate-fadeUp">
          {/* Free Tier */}
          <div className="glass-card" style={{ padding: 48, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Standard</h3>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>Your current plan</p>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 40, lineHeight: 1 }}>$0<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-tertiary)' }}>/mo</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent-gold)' }}>✓</span><span style={{ color: '#fff' }}>Access to standard library</span></div>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent-gold)' }}>✓</span><span style={{ color: '#fff' }}>Create collections</span></div>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--text-tertiary)' }}>✕</span><span style={{ color: 'var(--text-tertiary)' }}>VIP Exclusive tracks</span></div>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--text-tertiary)' }}>✕</span><span style={{ color: 'var(--text-tertiary)' }}>Lossless audio streaming</span></div>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--text-tertiary)' }}>✕</span><span style={{ color: 'var(--text-tertiary)' }}>Offline downloads</span></div>
            </div>
            <button disabled className="btn-secondary" style={{ width: '100%', marginTop: 40, opacity: 0.5 }}>Current Plan</button>
          </div>

          {/* Premium Tier */}
          <div className="glass-card-heavy" style={{ padding: 48, display: 'flex', flexDirection: 'column', border: '1px solid rgba(212,175,55,0.3)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--accent-gold), #ffbf00)' }} />
            <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', padding: '6px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recommended</div>
            
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Aarohi VIP</h3>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>The ultimate listening experience</p>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 40, lineHeight: 1 }}>$9.99<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-tertiary)' }}>/mo</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent-gold)' }}>✓</span><span style={{ color: '#fff', fontWeight: 600 }}>Access to standard library</span></div>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent-gold)' }}>✓</span><span style={{ color: '#fff', fontWeight: 600 }}>Create collections</span></div>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent-gold)' }}>✓</span><span style={{ color: '#fff', fontWeight: 600 }}>Unlock VIP Exclusive tracks</span></div>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent-gold)' }}>✓</span><span style={{ color: '#fff', fontWeight: 600 }}>24-bit Lossless streaming</span></div>
              <div style={{ display: 'flex', gap: 12 }}><span style={{ color: 'var(--accent-gold)' }}>✓</span><span style={{ color: '#fff', fontWeight: 600 }}>Unlimited offline downloads</span></div>
            </div>
            
            {errorMsg && <p style={{ color: '#ff6b6b', fontSize: 14, marginTop: 20, textAlign: 'center' }}>{errorMsg}</p>}
            
            <button onClick={handleUpgrade} disabled={loading} style={{ width: '100%', marginTop: 40, padding: '16px 0', background: 'var(--accent-gold)', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing Secure Payment...' : 'Upgrade to VIP'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 16 }}>Secured by Razorpay. Cancel anytime.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
