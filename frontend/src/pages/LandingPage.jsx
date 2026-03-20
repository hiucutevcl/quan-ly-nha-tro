import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Chatbot from '../components/Chatbot';
import AdsBanner from '../components/AdsBanner';

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
function Navbar({ name, phone, logo_image }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Giới thiệu', href: '/gioi-thieu' },
    { label: 'Danh sách phòng', href: '/danh-sach-phong' },
    { label: 'Tin tức & Lưu trú', href: '/tin-tuc-quy-dinh' },
    { label: 'Tiện ích', href: '#features' },
    { label: 'Liên hệ', href: '#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="container-tight" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, padding: '0 1.5rem' }}>
        {/* Logo */}
        <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          {logo_image ? (
            <img src={logo_image} alt="Logo" style={{ height: 34, borderRadius: 8, objectFit: 'contain' }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 15
            }}>H</div>
          )}
          <span style={{ fontWeight: 800, fontSize: 17, color: '#111827', letterSpacing: '-0.02em' }}>
            {name || 'Hệ thống Nhà trọ'}
          </span>
        </a>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
          {links.map(l => (
            <a key={l.href} href={l.href} style={{
              fontSize: 14, fontWeight: 500, color: '#6b7280',
              textDecoration: 'none', transition: 'color 0.2s'
            }}
              onMouseEnter={e => e.target.style.color = '#111827'}
              onMouseLeave={e => e.target.style.color = '#6b7280'}
            >{l.label}</a>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="desktop-nav">
          {phone && (
            <a href={`tel:${phone}`} style={{
              fontSize: 13, fontWeight: 600, color: '#6b7280',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              {phone}
            </a>
          )}
          <Link to="/danh-sach-phong" style={{
            background: '#f5f3ff', color: '#6366f1',
            padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            textDecoration: 'none', transition: 'all 0.2s', border: '1px solid #e0e7ff'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ff'; }}
          >Xem phòng</Link>
          <a href="#faq" style={{
            background: 'transparent', color: '#6b7280',
            padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            textDecoration: 'none', transition: 'all 0.2s', border: '1px solid transparent'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >Đăng ký</a>
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff',
            padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            textDecoration: 'none', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)'; }}
          >Đăng nhập</Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{
          display: 'none', background: 'none', border: 'none',
          cursor: 'pointer', padding: 4, color: '#374151'
        }} className="mobile-toggle">
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid #f3f4f6' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', padding: '1rem 1.5rem', gap: 4 }}>
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{
                fontSize: 14, fontWeight: 500, color: '#374151',
                textDecoration: 'none', padding: '10px 0',
                borderBottom: '1px solid #f3f4f6'
              }}>{l.label}</a>
            ))}
            <div style={{ paddingTop: 12, display: 'flex', gap: 8 }}>
              <Link to="/danh-sach-phong" onClick={() => setMobileOpen(false)} style={{
                flex: 1, textAlign: 'center', background: '#f5f3ff', color: '#6366f1',
                padding: '10px', borderRadius: 999, fontWeight: 600, textDecoration: 'none', border: '1px solid #e0e7ff'
              }}>Xem phòng</Link>
              <a href="#faq" onClick={() => setMobileOpen(false)} style={{
                flex: 1, textAlign: 'center', background: '#f8fafc', color: '#475569',
                padding: '10px', borderRadius: 999, fontWeight: 600, textDecoration: 'none'
              }}>Đăng ký</a>
              <Link to="/login" style={{
                flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff',
                padding: '10px', borderRadius: 999, fontWeight: 600, textDecoration: 'none'
              }}>Đăng nhập</Link>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

/** Hero Section */
function HeroSection({ settings, availableCount }) {
  return (
    <section style={{
      background: '#fff', overflowX: 'hidden', position: 'relative',
      paddingTop: '7rem', paddingBottom: 0
    }}>
      {/* Soft radial bg blobs - Airbnb/Notion style */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '80%', background: 'radial-gradient(ellipse, rgba(199,210,254,0.45) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '10%', right: '-15%', width: '55%', height: '70%', background: 'radial-gradient(ellipse, rgba(221,214,254,0.35) 0%, transparent 65%)', borderRadius: '50%' }} />
      </div>

      <div className="container-tight" style={{ padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        {/* Center content */}
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>

          {/* Badge */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 999,
              background: '#f5f3ff', border: '1px solid #ddd6fe',
              color: '#6366f1', fontSize: 13, fontWeight: 600
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: 'hpulse 2s ease-in-out infinite' }} />
              {availableCount > 0 ? `${availableCount} phòng đang trống` : 'Hệ thống phòng trọ hiện đại'}
            </span>
          </div>

          {/* Headline - Airbnb/Linear style: very large, tight tracking */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4rem)', fontWeight: 800,
            lineHeight: 1.08, letterSpacing: '-0.05em', margin: '0 0 1.25rem',
            color: '#111827'
          }}>
            Tìm phòng trọ
            {' '}<span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 60%, #ec4899 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>chất lượng</span>{' '}
            nhanh chóng
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 17, color: '#6b7280', lineHeight: 1.7,
            margin: '0 auto 2rem', maxWidth: 500, fontWeight: 400
          }}>
            Lưu trú an toàn, tiện nghi, minh bạch tại{' '}
            <strong style={{ color: '#374151' }}>{settings.nha_tro_name || 'Nhà Trọ Minh Hiếu'}</strong>.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <Link to="/danh-sach-phong" style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff',
              padding: '14px 32px', borderRadius: 999, fontSize: 15, fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.25s', letterSpacing: '-0.01em'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)'; }}
            >Xem phòng ngay →</Link>
            {settings.phone && (
              <a href={`tel:${settings.phone}`} style={{
                background: '#fff', color: '#374151',
                padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600,
                textDecoration: 'none', border: '1.5px solid #e5e7eb', transition: 'all 0.25s',
                display: 'inline-flex', alignItems: 'center', gap: 8
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Gọi {settings.owner || 'Chủ trọ'}
              </a>
            )}
          </div>

          {/* Trust bar - compact pill style */}
          <div style={{ display: 'inline-flex', gap: 0, border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', flexWrap: 'wrap' }}>
            {[
              { value: '100+', label: 'Phòng tiện nghi' },
              { value: 'An ninh', label: 'Bảo vệ 24/7' },
              { value: 'Minh bạch', label: 'Không phí ẩn' },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                flex: '1 1 130px', padding: '12px 24px', textAlign: 'center',
                borderRight: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div style={{ marginTop: '3.5rem', borderRadius: '28px 28px 0 0', overflow: 'hidden', position: 'relative' }}>
          <img
            src={settings.hero_image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=85"}
            alt="Phòng trọ tiện nghi"
            style={{ width: '100%', maxHeight: 500, objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          {/* Badge on image */}
          <div style={{
            position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
            borderRadius: 999, padding: '10px 22px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.8)'
          }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
              {availableCount > 0 ? `${availableCount} phòng trống — sẵn sàng vào ở` : 'Cập nhật liên tục mỗi ngày'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hpulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
      `}</style>
    </section>
  );
}

/** Features Section */
function FeaturesSection() {
  const features = [
    { 
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
      title: 'An toàn tuyệt đối', desc: 'Camera giám sát, cửa từ vân tay, bảo vệ toàn thời gian.' 
    },
    { 
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
      title: 'Minh bạch 100%', desc: 'Giá niêm yết rõ ràng, hóa đơn điện tử, không phí ẩn.' 
    },
    { 
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
      title: 'Quản lý tự động', desc: 'Hệ thống điện nước tự động, thông báo kịp thời.' 
    },
    { 
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
      title: 'Hỗ trợ 24/7', desc: 'Đội ngũ quản lý luôn sẵn sàng giải quyết mọi vấn đề.' 
    },
  ];

  return (
    <section id="features" style={{ background: '#f8fafc' }} className="section-padding">
      <div className="container-tight">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            TẠI SAO CHỌN CHÚNG TÔI
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.02em', color: '#0f172a' }}>
            Trải nghiệm thuê phòng{' '}
            <span className="gradient-text">vượt trội</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={f.title} style={{
              padding: '2rem 1.75rem', background: '#fff', borderRadius: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#ddd6fe'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: '#f5f3ff', color: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
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
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{room.room_name}</h3>
        {room.building_name && (
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 700,
            background: 'hsl(172,60%,92%)', color: 'hsl(172,60%,30%)',
            padding: '2px 8px', borderRadius: 6, marginTop: 2
          }}>🏢 {room.building_name}</span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'hsl(220,10%,56%)', flexWrap: 'wrap' }}>
          <span>📐 {room.area ? `${room.area} m²` : ''}</span>
          {room.area && room.floor && <span>•</span>}
          <span>{room.floor ? `Tầng ${room.floor}` : ''}</span>
          {room.room_address && (
              <span style={{ width: '100%', marginTop: 2, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📍 {room.room_address}
              </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#4338ca' }}>
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
  const [activeArea, setActiveArea] = useState('');
  const availableRooms = rooms.filter(r => r.status === 'Available').length;

  // Trích xuất danh sách khu vực duy nhất từ dữ liệu phòng
  const areas = React.useMemo(() => {
    const set = new Set();
    rooms.forEach(r => {
      // Lấy từ building_name
      if (r.building_name) set.add(r.building_name);
      // Thử trích quận/huyện từ room_address (phần sau dấu phẩy cuối cùng trước "Hà Nội")
      if (r.room_address) {
        const keywords = ['Hoàng Mai', 'Cầu Giấy', 'Ba Đình', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân',
          'Tây Hồ', 'Long Biên', 'Hà Đông', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hoàn Kiếm'];
        keywords.forEach(k => {
          if (r.room_address.includes(k)) set.add(k);
        });
      }
    });
    return Array.from(set);
  }, [rooms]);

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase().trim();
    const matchArea = !activeArea ||
      r.building_name === activeArea ||
      (r.room_address || '').includes(activeArea);
    const matchSearch = !q || (
      r.room_name?.toLowerCase().includes(q) ||
      (r.room_address || '').toLowerCase().includes(q) ||
      (r.building_name || '').toLowerCase().includes(q) ||
      (r.amenities || '').toLowerCase().includes(q)
    );
    return matchArea && matchSearch;
  });

  return (
    <section id="rooms" className="section-padding" style={{ background: '#f8fafc' }}>
      <div className="container-tight">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              DANH SÁCH PHÒNG
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#0f172a' }}>
              Phòng trọ <span className="gradient-text">nổi bật</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: '#dcfce7', border: '1px solid #bbf7d0'
          }}>
            <span className="animate-pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>
              CÒN {availableRooms} PHÒNG TRỐNG
            </span>
          </div>
        </div>

        {/* Search + Filter Row */}
        <div style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search Input */}
          <div style={{ maxWidth: 520, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm phòng, địa chỉ, khu vực (vd: Hoàng Mai, Cầu Giấy...)"
              style={{
                width: '100%', padding: '12px 40px 12px 44px', boxSizing: 'border-box',
                borderRadius: 12, border: '1.5px solid #e2e8f0',
                fontSize: 14, background: '#fff', outline: 'none',
                fontFamily: 'inherit', color: '#0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: '#e2e8f0', border: 'none', borderRadius: '50%', width: 20, height: 20,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', fontSize: 12, fontWeight: 700, padding: 0
              }}>×</button>
            )}
          </div>

          {/* Area Filter Chips */}
          {areas.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Khu vực:</span>
              <button
                onClick={() => setActiveArea('')}
                style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: '1.5px solid', transition: 'all 0.2s',
                  background: !activeArea ? '#6366f1' : '#fff',
                  color: !activeArea ? '#fff' : '#475569',
                  borderColor: !activeArea ? '#6366f1' : '#e2e8f0',
                }}>
                Tất cả
              </button>
              {areas.map(area => (
                <button
                  key={area}
                  onClick={() => setActiveArea(activeArea === area ? '' : area)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: '1.5px solid', transition: 'all 0.2s',
                    background: activeArea === area ? '#6366f1' : '#fff',
                    color: activeArea === area ? '#fff' : '#475569',
                    borderColor: activeArea === area ? '#6366f1' : '#e2e8f0',
                  }}>
                  {area}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ aspectRatio: '4/3', background: '#f1f5f9', borderRadius: 16, animation: 'fadeIn 1s infinite alternate' }} />
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
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
              Không tìm thấy phòng phù hợp với "<strong>{search || activeArea}</strong>".
            </p>
            <button onClick={() => { setSearch(''); setActiveArea(''); }}
              style={{ marginTop: 16, padding: '8px 20px', borderRadius: 999, border: '1.5px solid #e2e8f0', background: 'white', color: '#6366f1', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Xem tất cả phòng
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/** Rules Section */
function RulesSection({ note }) {
  if (!note) return null;
  return (
    <section id="info" className="section-padding" style={{ background: '#fff' }}>
      <div className="container-tight">
        <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(2rem, 5vw, 3rem)', borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>Nội quy nhà trọ</h2>
          </div>
          <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {note}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Location & Amenities Section */
function LocationSection({ address, buildings_info }) {
  const [activeTab, setActiveTab] = React.useState(0);

  let buildings = [];
  try {
    if (buildings_info) {
      buildings = JSON.parse(buildings_info);
      if (!Array.isArray(buildings)) buildings = [];
    }
  } catch(e) {}

  if (buildings.length === 0) {
    buildings = [{ name: 'Trụ sở chính', address: address || 'Hà Nội, Việt Nam' }];
  }

  // Lọc bớt các cơ sở bị trống địa chỉ
  const validBuildings = buildings.filter(b => b.address?.trim() !== '');
  const displayBuildings = validBuildings.length > 0 ? validBuildings : buildings;
  const currentBuilding = displayBuildings[activeTab] || displayBuildings[0];

  const mapAddress = encodeURIComponent(currentBuilding.address || 'Hà Nội, Việt Nam');
  const nearbyAmenities = [
    { icon: '🛒', title: 'Siêu thị & Chợ', desc: 'Bách Hóa, Vinmart, Chợ Dân Sinh...', search: 'Chợ Siêu thị' },
    { icon: '🏥', title: 'Cơ sở Y Tế', desc: 'Nhà thuốc báo quanh khu vực, Bệnh viện lớn.', search: 'Bệnh viện Nhà thuốc' },
    { icon: '🚌', title: 'Giao Thông', desc: 'Trạm xe bus gần kề, trục đường lớn dễ đi.', search: 'Trạm xe buýt' },
    { icon: '🎓', title: 'Giáo Dục', desc: 'Gắn liền với cụm trường Đại học / Phổ thông.', search: 'Trường học' }
  ];

  return (
    <section id="location" style={{ background: 'hsl(30,15%,96%)' }} className="section-padding">
      <div className="container-tight">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#4338ca', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            VỊ TRÍ & TIỆN ÍCH NGOẠI KHU
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Sinh hoạt <span className="gradient-text">thuận lợi</span>
          </h2>
        </div>

        {displayBuildings.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {displayBuildings.map((b, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveTab(idx)}
                style={{
                  padding: '10px 24px', borderRadius: '30px', fontWeight: 700, fontSize: 14,
                  background: activeTab === idx ? '#6366f1' : '#fff',
                  color: activeTab === idx ? '#fff' : '#6b7280',
                  border: activeTab === idx ? 'none' : '1px solid hsl(210,16%,90%)',
                  boxShadow: activeTab === idx ? '0 4px 12px hsla(215,100%,45%,0.3)' : '0 2px 6px rgba(0,0,0,0.04)',
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                📍 {b.name || `Cơ sở ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1.25fr)', gap: '2rem', alignItems: 'center' }} className="location-grid">
          {/* Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', height: 400, background: '#e0e0e0', position: 'relative' }}>
              <iframe
                title="Bản đồ nhà trọ"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${mapAddress}`} 
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#6366f1', color: '#fff',
                padding: '12px 24px', borderRadius: '12px', fontSize: 15, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 4px 12px hsla(215,100%,45%,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px hsla(215,100%,45%,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 12px hsla(215,100%,45%,0.3)'; }}
            >
               📍 Xem bản đồ đường đi chi tiết
            </a>
          </div>

          {/* Amenities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="amenities-grid">
            {nearbyAmenities.map((am, i) => (
              <a 
                key={am.title} 
                href={`https://www.google.com/maps/search/${encodeURIComponent(am.search)}+gần+${mapAddress}`}
                target="_blank" rel="noopener noreferrer"
                style={{ 
                  padding: '1.25rem', background: '#fff', borderRadius: '16px', 
                  boxShadow: 'var(--shadow-sm)', textDecoration: 'none', display: 'block',
                  transition: 'all 0.2s', border: '1px solid transparent'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'hsl(210,16%,96%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: '0.75rem' }}>
                  {am.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{am.title}</h3>
                <p style={{ margin: 0, fontSize: 12, color: 'hsl(220,10%,56%)', lineHeight: 1.5 }}>{am.desc}</p>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Tìm trên Maps <span>→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) {
            .location-grid { grid-template-columns: 1fr !important; }
            .amenities-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

/** FAQ Section */
function FAQSection() {
  const [openIdx, setOpenIdx] = React.useState(null);
  const faqs = [
    {
      q: 'Làm thế nào để đăng ký tài khoản trên hệ thống?',
      a: 'Việc đăng ký tài khoản tự do không được hỗ trợ. Tài khoản sẽ được Ban quản lý tạo và cấp cho bạn ngay sau khi hoàn tất hợp đồng thuê phòng, nhằm mục đích bảo mật thông tin nội bộ.'
    },
    {
      q: 'Hệ thống tài khoản quản lý những gì?',
      a: 'Tài khoản giúp cư dân theo dõi số điện/nước từng tháng, xem hóa đơn tiền nhà chính xác, nhận thông báo quan trọng từ quản lý và báo cáo sự cố hư hỏng trực tuyến.'
    },
    {
      q: 'Làm sao để xem phòng trực tiếp?',
      a: 'Bạn vui lòng lựa chọn phòng trên website, sau đó liên hệ ngay qua số điện thoại đường dây nóng. Đội ngũ quản lý sẽ xếp lịch mở cửa đón bạn tới xem phòng bất cứ lúc nào.'
    }
  ];

  return (
    <section id="faq" className="section-padding" style={{ background: '#fff' }}>
      <div className="container-tight">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            HỎI ĐÁP PHỔ BIẾN
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.02em', color: '#0f172a' }}>
            Thông tin <span className="gradient-text">hữu ích</span>
          </h2>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              style={{
                padding: '1.25rem 1.5rem', border: '1.5px solid', borderRadius: 16,
                cursor: 'pointer', transition: 'all 0.2s',
                borderColor: openIdx === idx ? '#ddd6fe' : '#e2e8f0',
                background: openIdx === idx ? '#f8fafc' : '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
                  {faq.q}
                </h3>
                <span style={{ color: '#6366f1', fontSize: 18, transition: 'transform 0.2s', transform: openIdx === idx ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0 }}>+</span>
              </div>
              {openIdx === idx && (
                <p style={{ margin: '12px 0 0', fontSize: 14, color: '#475569', lineHeight: 1.75 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** CTA Section */
function CTASection({ nhaName, phone, owner }) {
  return (
    <section className="section-padding" style={{ background: '#f8fafc' }}>
      <div className="container-tight">
        <div style={{
          position: 'relative', borderRadius: 24, overflow: 'hidden',
          padding: 'clamp(2.5rem,6vw,4rem)',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #6366f1 100%)',
          textAlign: 'center'
        }}>
          {/* Subtle decoration */}
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '50%', height: '200%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Sẵn sàng trở thành cư dân tiếp theo?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.65 }}>
              Đừng ngần ngại liên hệ hoặc đến xem trực tiếp tại {nhaName}. Chúng tôi luôn sẵn sàng hỗ trợ bạn.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/danh-sach-phong" style={{
                background: '#fff', color: '#4338ca',
                padding: '13px 28px', borderRadius: 999, fontSize: 15, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                transition: 'all 0.25s', display: 'inline-flex', alignItems: 'center', gap: 8
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
              >Xem phòng ngay →</Link>
              {phone && (
                <a href={`tel:${phone}`} style={{
                  border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff',
                  padding: '13px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.25s', display: 'inline-flex', alignItems: 'center', gap: 8
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  Gọi {owner || 'tư vấn'}
                </a>
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
              {room.building_name && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                  background: 'hsl(172,60%,92%)', color: 'hsl(172,60%,30%)' }}>🏢 {room.building_name}</span>
              )}
              {room.area && <span style={{ fontSize: 12, color: 'hsl(220,10%,50%)' }}>📐 {room.area} m²</span>}
              {room.floor && <span style={{ fontSize: 12, color: 'hsl(220,10%,50%)' }}>🏢 Tầng {room.floor}</span>}
              {room.room_address && (
                <span style={{ fontSize: 12, color: 'hsl(220,10%,50%)', width: '100%' }}>📍 {room.room_address}</span>
              )}
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
                      border: activeImg === idx ? '2px solid #6366f1' : '2px solid transparent'
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
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#4338ca' }}>
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
    <footer id="contact" style={{ background: '#111827', color: '#fff' }}>
      <div className="container-tight section-padding" style={{ paddingBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem', marginBottom: '2.5rem'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {settings.logo_image ? (
                <img src={settings.logo_image} alt="Logo" style={{ height: 34, borderRadius: 8, objectFit: 'contain' }} />
              ) : (
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 16
                }}>H</div>
              )}
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
              {[['/gioi-thieu', 'Giới thiệu'], ['/danh-sach-phong', 'Danh sách phòng'], ['#features', 'Tính năng']].map(([href, label]) => (
                <li key={href}><Link to={href} style={{ fontSize: 13, color: 'hsla(30,15%,90%,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'hsla(30,15%,90%,0.55)'}
                >{label}</Link></li>
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
      <Navbar name={settings.nha_tro_name} phone={settings.phone} logo_image={settings.logo_image} />
      <HeroSection settings={settings} availableCount={availableCount} />

      <section style={{ background: '#f8fafc', paddingTop: '3.5rem', paddingBottom: '0.5rem' }}>
        <div className="container-tight">
          <AdsBanner layout="banner" />
        </div>
      </section>

      <FeaturesSection />

      {/* Rooms and Location sections have been moved to RoomsPage */}

      <FAQSection />

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
