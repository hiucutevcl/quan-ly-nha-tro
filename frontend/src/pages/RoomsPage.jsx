import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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

/** Header Đơn Giản */
function SimpleHeader({ settings }) {
  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-decoration-none" style={{ textDecoration: 'none' }}>
          {settings.logo_image ? (
            <img src={settings.logo_image} alt="Logo" style={{ height: 34, borderRadius: 8, objectFit: 'contain' }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 15
            }}>H</div>
          )}
          <span className="text-xl font-black text-gray-800 tracking-tight" style={{ color: '#111827', textDecoration: 'none' }}>
            {settings.nha_tro_name || 'Hệ thống Nhà trọ'}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', textDecoration: 'none' }} className="hover:text-indigo-600 transition-colors">
            Trang chủ
          </Link>
          {settings.phone && (
            <a href={`tel:${settings.phone}`} style={{ fontSize: 14, fontWeight: 700, background: '#e0e7ff', color: '#4f46e5', padding: '8px 16px', borderRadius: 999, textDecoration: 'none' }} className="hover:bg-indigo-200 transition-colors">
              📞 Liên hệ
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

/** Room Card */
function RoomCard({ room, onClick }) {
  const images = parseImages(room.image_url);
  const img = images[0] || FALLBACK_IMG;
  const available = room.status === 'Available';

  return (
    <div className="glass-card-hover" style={{ overflow: 'hidden', cursor: 'pointer', background: '#fff', borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'all 0.3s' }} onClick={() => onClick(room)}>
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
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
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827', lineHeight: 1.3 }}>{room.room_name}</h3>
        {room.building_name && (
          <span style={{
            display: 'inline-block', fontSize: 10, items: 'center', fontWeight: 700,
            background: 'hsl(172,60%,92%)', color: 'hsl(172,60%,30%)',
            padding: '4px 10px', borderRadius: 6, width: 'fit-content'
          }}>🏢 {room.building_name}</span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'hsl(220,10%,56%)', flexWrap: 'wrap' }}>
          <span>📐 {room.area ? `${room.area} m²` : ''}</span>
          {room.area && room.floor && <span>•</span>}
          <span>{room.floor ? `Tầng ${room.floor}` : ''}</span>
          {room.room_address && (
              <span style={{ width: '100%', marginTop: 2, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📍 {room.room_address}
              </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#4f46e5' }}>
            {formatVND(room.price)}
          </p>
          <span style={{
            fontSize: 11, color: 'hsl(220,10%,56%)', fontWeight: 600,
            background: 'hsl(30,15%,94%)', padding: '4px 10px', borderRadius: 8
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
      if (r.building_name) set.add(r.building_name);
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
    <section id="rooms" style={{ padding: '4rem 1.5rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              TÌM KIẾM THEO NHU CẦU
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#0f172a' }}>
              Danh sách phòng <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>cho thuê</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 999,
            background: '#dcfce7', border: '1px solid #bbf7d0'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#15803d' }}>
              CÒN {availableRooms} PHÒNG TRỐNG
            </span>
          </div>
        </div>

        {/* Search + Filter Row */}
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Search Input */}
          <div style={{ maxWidth: 600, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm phòng, địa chỉ, khu vực (vd: Hoàng Mai, Cầu Giấy...)"
              style={{
                width: '100%', padding: '14px 40px 14px 48px', boxSizing: 'border-box',
                borderRadius: 14, border: '2px solid #e2e8f0',
                fontSize: 15, background: '#fff', outline: 'none',
                fontFamily: 'inherit', color: '#0f172a',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: '#e2e8f0', border: 'none', borderRadius: '50%', width: 24, height: 24,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', fontSize: 14, fontWeight: 700, padding: 0
              }}>✕</button>
            )}
          </div>

          {/* Area Filter Chips */}
          {areas.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Khu vực:</span>
              <button
                onClick={() => setActiveArea('')}
                style={{
                  padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  border: '1.5px solid', transition: 'all 0.2s', outline: 'none',
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
                    padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    border: '1.5px solid', transition: 'all 0.2s', outline: 'none',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ aspectRatio: '4/3', background: '#e2e8f0', borderRadius: 20, animation: 'pulse 1.5s infinite alternate' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {filtered.map(room => (
              <RoomCard key={room.id} room={room} onClick={onRoomClick} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0', background: '#fff', borderRadius: 24, border: '1px dashed #cbd5e1', marginTop: '1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Không tìm thấy phòng nào</h3>
            <p style={{ color: '#64748b', fontSize: 16, margin: 0 }}>
              Không có phòng trống nào phù hợp với "<strong>{search || activeArea}</strong>".
            </p>
            <button onClick={() => { setSearch(''); setActiveArea(''); }}
              style={{ marginTop: 24, padding: '10px 24px', borderRadius: 999, border: '1.5px solid #e2e8f0', background: 'white', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontSize: 15, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              Xem tất cả phòng
            </button>
          </div>
        )}
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
    <section id="location" style={{ padding: '4rem 1.5rem', background: '#fff' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#4f46e5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            VỊ TRÍ & TIỆN ÍCH NGOẠI KHU
          </p>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,2.5rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em', color: '#0f172a' }}>
            Sinh hoạt <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>thuận lợi</span>
          </h2>
        </div>

        {displayBuildings.length > 1 && (
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {displayBuildings.map((b, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveTab(idx)}
                style={{
                  padding: '12px 28px', borderRadius: 999, fontWeight: 800, fontSize: 14,
                  background: activeTab === idx ? '#4f46e5' : '#fff',
                  color: activeTab === idx ? '#fff' : '#475569',
                  border: activeTab === idx ? 'none' : '2px solid #e2e8f0',
                  boxShadow: activeTab === idx ? '0 8px 16px rgba(79, 70, 229, 0.25)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8, outline: 'none'
                }}
              >
                📍 {b.name || `Cơ sở ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1.25fr)', gap: '2.5rem', alignItems: 'center' }} className="location-grid">
          {/* Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', height: 420, background: '#e2e8f0', position: 'relative' }}>
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
                background: '#4f46e5', color: '#fff',
                padding: '14px 24px', borderRadius: 16, fontSize: 16, fontWeight: 800,
                textDecoration: 'none', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(79, 70, 229, 0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 16px rgba(79, 70, 229, 0.25)'; }}
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
                  padding: '1.5rem', background: '#f8fafc', borderRadius: 20, 
                  textDecoration: 'none', display: 'block', border: '2px solid transparent',
                  transition: 'all 0.3s'
                }}
                className="hover:scale-105 hover:bg-indigo-50 hover:border-indigo-100 hover:shadow-lg"
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 0 1rem 0' }}>
                  {am.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{am.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{am.desc}</p>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
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
          @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
        `}</style>
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
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 24,
        width: '100%', maxWidth: 900, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{room.room_name}</h3>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 999,
                background: room.status === 'Available' ? '#dcfce7' : '#fee2e2',
                color: room.status === 'Available' ? '#16a34a' : '#dc2626'
              }}>{room.status === 'Available' ? 'Còn phòng' : 'Hết phòng'}</span>
              {room.building_name && (
                <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 999,
                  background: '#e0e7ff', color: '#4338ca' }}>🏢 {room.building_name}</span>
              )}
              {room.area && <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center' }}>📐 {room.area} m²</span>}
              {room.floor && <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center' }}>🏢 Tầng {room.floor}</span>}
            </div>
            {room.room_address && (
              <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, margin: '10px 0 0 0', display: 'flex', alignItems: 'center' }}>📍 {room.room_address}</p>
            )}
          </div>
          <button onClick={onClose} style={{
            width: 40, height: 40, borderRadius: '50%',
            border: 'none', background: '#f1f5f9', cursor: 'pointer',
            fontSize: 18, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s, color 0.2s', fontWeight: 600
          }} className="hover:bg-slate-200 hover:text-slate-900">✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="modal-grid">
            {/* Images */}
            <div>
              <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', marginBottom: 16 }}>
                <img src={images[activeImg]} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {images.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
                  {images.map((img, idx) => (
                    <div key={idx} onClick={() => setActiveImg(idx)} style={{
                      aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                      border: activeImg === idx ? '3px solid #6366f1' : '3px solid transparent',
                      boxSizing: 'border-box'
                    }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', borderRadius: 16, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#b45309', letterSpacing: '0.05em' }}>Giá thuê hợp lý</p>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: '#ea580c', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  {formatVND(room.price)}
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#d97706' }}>/ tháng</span>
                </p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b' }}>Tiện nghi & Dịch vụ</h4>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {amenities.map((a, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#334155', fontWeight: 500 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, fontWeight: 800 }}>✓</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.7, borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                Phòng thuộc hệ thống <strong style={{ color: '#0f172a' }}>{settings.nha_tro_name}</strong>. Môi trường sống văn minh, an toàn, ban quản lý thân thiện và luôn sẵn sàng giải quyết sự cố 24/7.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: 999, border: '2px solid #e2e8f0', background: 'transparent', fontWeight: 700, cursor: 'pointer', fontSize: 15, color: '#475569', transition: 'all 0.2s' }} className="hover:bg-slate-100 hover:text-slate-900">
            Đóng
          </button>
          <a href={`tel:${settings.phone}`} style={{
            padding: '12px 28px', borderRadius: 999, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff', fontWeight: 800, textDecoration: 'none', fontSize: 15,
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', transition: 'all 0.2s'
          }} className="hover:scale-105 hover:shadow-lg">📞 Gọi tư vấn ngay</a>
        </div>

        <style>{`@media(max-width:768px){ .modal-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [settings, setSettings] = useState({ nha_tro_name: 'Hệ thống Nhà trọ', phone: '', address: '' });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen bg-slate-50 flex flex-col">
      <SimpleHeader settings={settings} />

      <main className="flex-1">
        {/* Banner ở đầu trang */}
        <div className="max-w-7xl mx-auto px-4 mt-8">
           <AdsBanner layout="banner" />
        </div>

        <RoomsSection rooms={rooms} loading={loading} onRoomClick={setSelectedRoom} />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
           <AdsBanner layout="any" />
        </div>

        <LocationSection address={settings.address} buildings_info={settings.buildings_info} />
      </main>

      {/* Basic Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">{settings.nha_tro_name}</h3>
            <p className="text-sm opacity-70 mb-6">Nền tảng quản lý nhà trọ uy tín, minh bạch và an toàn.</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
                {settings.phone && <span className="flex items-center gap-2">📞 {settings.phone}</span>}
                {settings.address && <span className="flex items-center gap-2">📍 {settings.address}</span>}
            </div>
            <div className="border-t border-slate-700/50 pt-6 text-xs text-slate-500">
                © {new Date().getFullYear()} {settings.nha_tro_name}. Tất cả các quyền được bảo lưu.
            </div>
        </div>
      </footer>

      {selectedRoom && (
        <RoomModal room={selectedRoom} settings={settings} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
}
