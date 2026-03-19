import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Chatbot from '../components/Chatbot';

const API_URL = 'https://api-quan-ly-nha-tro.onrender.com/api';

/* ── helpers ── */
const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const parseImages = (raw) => {
  try { return JSON.parse(raw) || []; } catch { return typeof raw === 'string' ? [raw] : []; }
};

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

/* ── sub-components ── */

/** Navbar */
function Navbar({ name, phone }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Giới thiệu', href: '#about' },
    { label: 'Danh sách phòng', href: '#rooms' },
    { label: 'Tiện ích', href: '#features' },
    { label: 'Liên hệ', href: '#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease',
      }}
      className={scrolled ? 'glass-nav' : ''}
    >
      <div className="container-tight" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, padding: '0 1.5rem' }}>
        {/* Logo */}
        <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16, boxShadow: '0 4px 12px hsla(24,80%,55%,0.35)'
          }}>H</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'hsl(220,20%,10%)', letterSpacing: '-0.02em' }}>
            {name || 'Hệ thống Nhà trọ'}
          </span>
        </a>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          {links.map(l => (
            <a key={l.href} href={l.href} style={{
              fontSize: 14, fontWeight: 500, color: 'hsl(220,10%,46%)',
              textDecoration: 'none', transition: 'color 0.2s'
            }}
              onMouseEnter={e => e.target.style.color = 'hsl(24,80%,55%)'}
              onMouseLeave={e => e.target.style.color = 'hsl(220,10%,46%)'}
            >{l.label}</a>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
          {phone && (
            <a href={`tel:${phone}`} style={{
              fontSize: 13, fontWeight: 600, color: 'hsl(220,10%,46%)',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6
            }}>
              📞 {phone}
            </a>
          )}
          <Link to="/login" style={{
            background: 'var(--gradient-primary)', color: '#fff',
            padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 4px 12px hsla(24,80%,55%,0.3)',
            transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px hsla(24,80%,55%,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 12px hsla(24,80%,55%,0.3)'; }}
          >Đăng nhập</Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{
          display: 'none', background: 'none', border: 'none',
          fontSize: 22, cursor: 'pointer', padding: 4
        }} className="mobile-toggle">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="glass-nav animate-fade-in" style={{ borderTop: '1px solid hsla(30,15%,90%,0.5)' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', padding: '1rem 1.5rem', gap: 4 }}>
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{
                fontSize: 14, fontWeight: 500, color: 'hsl(220,10%,46%)',
                textDecoration: 'none', padding: '10px 0',
                borderBottom: '1px solid hsla(30,15%,90%,0.4)'
              }}>{l.label}</a>
            ))}
            <div style={{ paddingTop: 12 }}>
              <Link to="/login" style={{
                display: 'block', textAlign: 'center',
                background: 'var(--gradient-primary)', color: '#fff',
                padding: '10px', borderRadius: 10, fontWeight: 700,
                textDecoration: 'none'
              }}>Đăng nhập</Link>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}

/** Hero Section */
function HeroSection({ settings, availableCount }) {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      background: 'var(--gradient-hero)', overflowX: 'hidden', position: 'relative'
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 500, height: 500,
          borderRadius: '50%', background: 'hsla(24,80%,55%,0.06)', filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80, width: 400, height: 400,
          borderRadius: '50%', background: 'hsla(200,60%,50%,0.06)', filter: 'blur(60px)'
        }} />
      </div>

      <div className="container-tight" style={{ width: '100%', padding: '7rem 1.5rem 4rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem',
          alignItems: 'center'
        }} className="hero-grid">

          {/* Left */}
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
              <span style={{
                padding: '6px 16px', borderRadius: 999,
                background: 'hsla(24,80%,55%,0.1)',
                color: 'hsl(24,80%,45%)', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span className="animate-pulse-dot" style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'hsl(152,60%,45%)', display: 'inline-block'
                }} />
                {availableCount > 0 ? `Còn ${availableCount} phòng trống hôm nay` : 'Nền tảng quản lý nhà trọ #1'}
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800,
              lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0,
              color: 'hsl(220,20%,10%)'
            }}>
              Tìm phòng trọ{' '}
              <span className="gradient-text">chất lượng</span>
              <br />chỉ trong vài phút
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 17, color: 'hsl(220,10%,46%)', lineHeight: 1.7,
              margin: 0, maxWidth: 480
            }}>
              {settings.nha_tro_name} cung cấp phòng trọ cao cấp, được xác minh, giá minh bạch. An tâm thuê, dễ dàng theo dõi.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#rooms" style={{
                background: 'var(--gradient-primary)', color: '#fff',
                padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 6px 20px hsla(24,80%,55%,0.35)',
                transition: 'all 0.25s', display: 'inline-block'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px hsla(24,80%,55%,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px hsla(24,80%,55%,0.35)'; }}
              >Xem phòng ngay</a>
              <a href={`tel:${settings.phone}`} style={{
                background: '#fff', color: 'hsl(220,20%,10%)',
                padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600,
                textDecoration: 'none', border: '1px solid hsl(30,15%,88%)',
                boxShadow: 'var(--shadow-sm)', transition: 'all 0.25s', display: 'inline-flex', alignItems: 'center', gap: 8
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(24,80%,55%)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(30,15%,88%)'; e.currentTarget.style.transform = ''; }}
              >📞 Gọi {settings.owner || 'tư vấn'}</a>
            </div>

            {/* Trust stats row */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 8 }}>
              {[
                { icon: '🏠', bold: '100+ phòng', sub: 'Đa dạng lựa chọn' },
                { icon: '🛡️', bold: 'An toàn', sub: 'Camera 24/7' },
                { icon: '✅', bold: 'Minh bạch', sub: 'Giá rõ ràng' },
              ].map(s => (
                <div key={s.bold} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'hsla(24,80%,55%,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                  }}>{s.icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'hsl(220,20%,10%)' }}>{s.bold}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'hsl(220,10%,56%)' }}>{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - image */}
          <div className="animate-fade-up hero-img-col" style={{ position: 'relative', animationDelay: '0.15s' }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 64px hsla(220,20%,10%,0.14)' }}>
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
                alt="Phòng trọ hiện đại"
                style={{ width: '100%', height: 440, objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, hsla(220,20%,10%,0.2), transparent)'
              }} />
            </div>

            {/* Floating card */}
            <div className="glass-card" style={{
              position: 'absolute', bottom: -20, left: -20,
              padding: '16px 20px', minWidth: 180
            }}>
              <p style={{ margin: 0, fontSize: 11, color: 'hsl(220,10%,56%)' }}>Phòng có sẵn</p>
              <p style={{ margin: '4px 0', fontSize: 28, fontWeight: 800, color: 'hsl(220,20%,10%)' }}>
                {availableCount}+
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'hsl(152,60%,38%)', fontWeight: 600 }}>
                ↑ Cập nhật liên tục
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero-img-col { display: none; }
        }
      `}</style>
    </section>
  );
}

/** Features Section */
function FeaturesSection() {
  const features = [
    { icon: '🛡️', title: 'An toàn tuyệt đối', desc: 'Camera giám sát, cửa từ vân tay, bảo vệ toàn thời gian.' },
    { icon: '👁️', title: 'Minh bạch 100%', desc: 'Giá niêm yết rõ ràng, hóa đơn điện tử, không phí ẩn.' },
    { icon: '⚡', title: 'Quản lý tự động', desc: 'Hệ thống điện nước tự động, thông báo kịp thời.' },
    { icon: '🎧', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ quản lý luôn sẵn sàng giải quyết mọi vấn đề.' },
  ];

  return (
    <section id="features" style={{ background: 'hsl(30,15%,96%)' }} className="section-padding">
      <div className="container-tight">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'hsl(24,80%,50%)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            TẠI SAO CHỌN CHÚNG TÔI
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Trải nghiệm thuê phòng{' '}
            <span className="gradient-text">vượt trội</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={f.title} className="glass-card-hover animate-fade-up"
              style={{ padding: '2rem 1.5rem', textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'hsla(24,80%,55%,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, margin: '0 auto 1rem'
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', color: 'hsl(220,20%,10%)' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'hsl(220,10%,50%)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Room Card */
function RoomCard({ room, onClick }) {
  const images = parseImages(room.image_url);
  const img = images[0] || FALLBACK_IMG;
  const available = room.status === 'Available';

  return (
    <div className="glass-card-hover" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => onClick(room)}>
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
        <img src={img} alt={room.room_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        />
        <span style={{
          position: 'absolute', top: 12, left: 12,
          background: available ? 'hsl(152,60%,45%)' : 'hsl(0,70%,55%)',
          color: '#fff', fontSize: 11, fontWeight: 700,
          padding: '4px 12px', borderRadius: 8
        }}>{available ? 'Còn phòng' : 'Hết phòng'}</span>
      </div>
      <div style={{ padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'hsl(220,20%,10%)', lineHeight: 1.3 }}>{room.room_name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'hsl(220,10%,56%)' }}>
          📍 {room.area ? `${room.area} m²` : ''}
          {room.area && room.floor && ' • '}
          {room.floor ? `Tầng ${room.floor}` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'hsl(24,80%,50%)' }}>
            {formatVND(room.price)}
          </p>
          <span style={{
            fontSize: 11, color: 'hsl(220,10%,56%)',
            background: 'hsl(30,15%,94%)', padding: '3px 10px', borderRadius: 8
          }}>/ tháng</span>
        </div>
      </div>
    </div>
  );
}

/** Rooms Section */
function RoomsSection({ rooms, loading, onRoomClick }) {
  const [search, setSearch] = useState('');
  const availableRooms = rooms.filter(r => r.status === 'Available').length;

  const filtered = rooms.filter(r =>
    r.room_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="rooms" className="section-padding" style={{ background: '#fff' }}>
      <div className="container-tight">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'hsl(24,80%,50%)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              DANH SÁCH PHÒNG
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Phòng trọ <span className="gradient-text">nổi bật</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: 'hsl(152,60%,95%)', border: '1px solid hsl(152,60%,85%)'
          }}>
            <span className="animate-pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'hsl(152,60%,45%)', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'hsl(152,60%,35%)' }}>
              CÒN {availableRooms} PHÒNG TRỐNG
            </span>
          </div>
        </div>

        {/* Search */}
        <div style={{ maxWidth: 440, marginBottom: '2rem', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm phòng..."
            style={{
              width: '100%', padding: '11px 16px 11px 40px',
              borderRadius: 12, border: '1px solid hsl(30,15%,88%)',
              fontSize: 14, background: 'hsl(30,15%,98%)', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'hsl(24,80%,55%)'}
            onBlur={e => e.target.style.borderColor = 'hsl(30,15%,88%)'}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ aspectRatio: '4/3', background: 'hsl(30,10%,92%)', borderRadius: 16, animation: 'fadeIn 1s infinite alternate' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(room => (
              <RoomCard key={room.id} room={room} onClick={onRoomClick} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'hsl(220,10%,56%)', padding: '3rem 0' }}>
            Không tìm thấy phòng phù hợp. Thử tìm kiếm khác nhé!
          </p>
        )}
      </div>
    </section>
  );
}

/** Rules Section */
function RulesSection({ note }) {
  if (!note) return null;
  return (
    <section className="section-padding" style={{ background: '#fff' }}>
      <div className="container-tight">
        <div style={{ background: 'hsl(30,15%,98%)', padding: 'clamp(2rem, 5vw, 3rem)', borderRadius: 24, border: '1px solid hsl(30,15%,92%)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>📋</span> Nội quy nhà trọ
          </h2>
          <div style={{ fontSize: 15, color: 'hsl(220,15%,35%)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {note}
          </div>
        </div>
      </div>
    </section>
  );
}

/** CTA Section */
function CTASection({ nhaName, phone, owner }) {
  return (
    <section className="section-padding" style={{ background: 'hsl(30,15%,96%)' }}>
      <div className="container-tight">
        <div style={{
          position: 'relative', borderRadius: 28, overflow: 'hidden',
          padding: 'clamp(2.5rem,6vw,4rem)',
          background: 'var(--gradient-cta)', textAlign: 'center'
        }}>
          {/* blobs */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', blur: '2xl' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          </div>
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.5rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
              Sẵn sàng trở thành cư dân tiếp theo?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.65 }}>
              Đừng ngần ngại liên hệ hoặc đến xem trực tiếp tại {nhaName}. Chúng tôi luôn sẵn sàng hỗ trợ bạn.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#rooms" style={{
                background: '#fff', color: 'hsl(24,80%,50%)',
                padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                transition: 'all 0.25s', display: 'inline-flex', alignItems: 'center', gap: 8
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
              >Xem phòng ngay →</a>
              {phone && (
                <a href={`tel:${phone}`} style={{
                  border: '2px solid rgba(255,255,255,0.5)', color: '#fff',
                  padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.25s', display: 'inline-flex', alignItems: 'center', gap: 8
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                >📞 Gọi {owner || 'tư vấn'}</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Room Details Modal */
function RoomModal({ room, settings, onClose }) {
  const images = parseImages(room.image_url);
  if (images.length === 0) images.push(FALLBACK_IMG);
  const [activeImg, setActiveImg] = useState(0);
  const amenities = room.amenities
    ? room.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : ['Đầy đủ tiện nghi cơ bản'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'hsla(220,20%,10%,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={onClose} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 24,
        width: '100%', maxWidth: 840, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(30,15%,92%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{room.room_name}</h3>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                background: room.status === 'Available' ? 'hsl(152,60%,92%)' : 'hsl(0,70%,94%)',
                color: room.status === 'Available' ? 'hsl(152,60%,30%)' : 'hsl(0,70%,40%)'
              }}>{room.status === 'Available' ? 'Còn phòng' : 'Hết phòng'}</span>
              {room.area && <span style={{ fontSize: 12, color: 'hsl(220,10%,50%)' }}>📐 {room.area} m²</span>}
              {room.floor && <span style={{ fontSize: 12, color: 'hsl(220,10%,50%)' }}>🏢 Tầng {room.floor}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%',
            border: 'none', background: 'hsl(30,10%,94%)', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s'
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="modal-grid">
            {/* Images */}
            <div>
              <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', marginBottom: 10 }}>
                <img src={images[activeImg]} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {images.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {images.slice(0, 4).map((img, idx) => (
                    <div key={idx} onClick={() => setActiveImg(idx)} style={{
                      aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                      border: activeImg === idx ? '2px solid hsl(24,80%,55%)' : '2px solid transparent'
                    }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1.25rem', borderRadius: 14, background: 'hsla(24,80%,55%,0.06)', border: '1px solid hsla(24,80%,55%,0.15)' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'hsl(220,10%,56%)', letterSpacing: '0.06em' }}>Giá phòng</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'hsl(24,80%,50%)' }}>
                  {formatVND(room.price)}
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'hsl(220,10%,56%)' }}> / tháng</span>
                </p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid hsl(30,15%,92%)', paddingBottom: 8 }}>Tiện nghi & Dịch vụ</h4>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                  {amenities.map((a, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'hsl(220,15%,35%)' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'hsl(152,60%,92%)', color: 'hsl(152,60%,38%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'hsl(220,10%,52%)', lineHeight: 1.65, borderTop: '1px solid hsl(30,15%,92%)', paddingTop: '1rem' }}>
                Phòng thuộc hệ thống <strong style={{ color: 'hsl(220,20%,15%)' }}>{settings.nha_tro_name}</strong>. Môi trường sống văn minh, an toàn, ban quản lý thân thiện.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', background: 'hsl(30,15%,98%)', borderTop: '1px solid hsl(30,15%,92%)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'hsl(30,10%,92%)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            Đóng
          </button>
          <a href={`tel:${settings.phone}`} style={{
            padding: '9px 22px', borderRadius: 10, background: 'var(--gradient-primary)',
            color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8
          }}>📞 Gọi tư vấn</a>
        </div>

        <style>{`@media(max-width:640px){ .modal-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  );
}

/** Footer */
function Footer({ settings }) {
  return (
    <footer id="contact" style={{ background: 'hsl(220,20%,10%)', color: '#fff' }}>
      <div className="container-tight section-padding" style={{ paddingBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem', marginBottom: '2.5rem'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 16
              }}>H</div>
              <span style={{ fontWeight: 800, fontSize: 17 }}>{settings.nha_tro_name}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'hsla(30,15%,90%,0.55)', lineHeight: 1.65 }}>
              Nền tảng quản lý nhà trọ uy tín, minh bạch và an toàn.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsla(30,15%,90%,0.6)' }}>Điều hướng</h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['#about', 'Giới thiệu'], ['#rooms', 'Danh sách phòng'], ['#features', 'Tính năng']].map(([href, label]) => (
                <li key={href}><a href={href} style={{ fontSize: 13, color: 'hsla(30,15%,90%,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'hsla(30,15%,90%,0.55)'}
                >{label}</a></li>
              ))}
            </ul>
          </div>

          {/* Tiện ích */}
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsla(30,15%,90%,0.6)' }}>Hỗ trợ</h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Nội quy nhà trọ', 'Chính sách bảo mật', 'Câu hỏi thường gặp'].map(t => (
                <li key={t}><a href="#" style={{ fontSize: 13, color: 'hsla(30,15%,90%,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'hsla(30,15%,90%,0.55)'}
                >{t}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsla(30,15%,90%,0.6)' }}>Liên hệ</h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {settings.phone && <li style={{ fontSize: 13, color: 'hsla(30,15%,90%,0.55)', display: 'flex', gap: 8 }}>📞 {settings.phone}</li>}
              {settings.address && <li style={{ fontSize: 13, color: 'hsla(30,15%,90%,0.55)', display: 'flex', gap: 8 }}>📍 {settings.address}</li>}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid hsla(30,15%,90%,0.1)', paddingTop: '1.5rem', textAlign: 'center', fontSize: 12, color: 'hsla(30,15%,90%,0.35)' }}>
          © {new Date().getFullYear()} {settings.nha_tro_name}. Phát triển bởi <span style={{ color: 'hsla(30,15%,90%,0.6)' }}>Phạm Minh Hiếu</span>.
        </div>
      </div>
    </footer>
  );
}

/* ── Main Page ── */
const LandingPage = () => {
  const [settings, setSettings] = useState({
    nha_tro_name: 'Hệ thống Nhà trọ',
    address: '',
    phone: '',
    note: '',
    owner: '',
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, roomsRes] = await Promise.all([
          axios.get(`${API_URL}/settings/public`),
          axios.get(`${API_URL}/rooms/public`),
        ]);
        setSettings(prev => ({ ...prev, ...settingsRes.data }));
        setRooms(roomsRes.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableCount = rooms.filter(r => r.status === 'Available').length;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      <Navbar name={settings.nha_tro_name} phone={settings.phone} />
      <HeroSection settings={settings} availableCount={availableCount} />
      <FeaturesSection />
      <RoomsSection rooms={rooms} loading={loading} onRoomClick={setSelectedRoom} />
      <RulesSection note={settings.note} />
      <CTASection nhaName={settings.nha_tro_name} phone={settings.phone} owner={settings.owner} />
      <Footer settings={settings} />

      {selectedRoom && (
        <RoomModal room={selectedRoom} settings={settings} onClose={() => setSelectedRoom(null)} />
      )}
      <Chatbot />
    </div>
  );
};

export default LandingPage;
