import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [settings, setSettings] = useState({});
    const navigate = useNavigate();

    React.useEffect(() => {
        axios.get('https://api-quan-ly-nha-tro.onrender.com/api/settings/public')
            .then(res => setSettings(res.data))
            .catch(err => console.log('Err fetch settings', err));
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            const formattedUsername = username.trim();
            const response = await axios.post('https://api-quan-ly-nha-tro.onrender.com/api/auth/login', { username: formattedUsername, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            localStorage.setItem('user', JSON.stringify({ full_name: decoded.full_name || decoded.username, role: decoded.role }));
            if (decoded.role === 'Admin') navigate('/admin-dashboard');
            else navigate('/my-invoices');
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: '#f1f5f9', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            position: 'relative'
        }}>
            {/* Back Home Button Floating */}
            <Link to="/" style={{
                position: 'absolute', top: 24, right: 24, zIndex: 10,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 999, background: 'white',
                color: '#475569', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(15,23,42,0.06)', border: '1px solid #e2e8f0', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = ''; }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Về Trang chủ
            </Link>
            {/* Left Panel - Branding */}
            <div style={{
                flex: 1, display: 'none',
                background: 'linear-gradient(145deg, #0f0f1a 0%, #1e1b4b 60%, #4338ca 100%)',
                padding: '3rem', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden'
            }} className="login-left-panel">
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px',
                    borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-40px', left: '-60px', width: '220px', height: '220px',
                    borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', pointerEvents: 'none'
                }} />

                {/* Logo */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '3rem' }}>
                        {settings.logo_image ? (
                            <img src={settings.logo_image} alt="Logo" style={{ height: 44, maxWidth: 120, borderRadius: 8, objectFit: 'contain' }} />
                        ) : (
                            <div style={{
                                width: 44, height: 44, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            </div>
                        )}
                        <span style={{ color: 'white', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{settings.name || 'Nhà Trọ Minh Hiếu'}</span>
                    </div>

                    <h1 style={{ color: 'white', fontSize: 38, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 16 }}>
                        Quản lý nhà trọ<br />chưa bao giờ dễ đến vậy.
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.6, maxWidth: 340 }}>
                        Hệ thống quản lý phòng trọ tích hợp đầy đủ: hóa đơn, chỉ số điện nước, hợp đồng và báo cáo.
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {[{ v: '100+', l: 'Phòng trọ' }, { v: '24/7', l: 'Hỗ trợ' }, { v: '3+', l: 'Cơ sở' }].map(s => (
                        <div key={s.l}>
                            <div style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{s.v}</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={{
                width: '100%', maxWidth: 480,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '2rem',
                margin: '0 auto'
            }}>
                <div style={{ width: '100%' }}>
                    {/* Mobile Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="login-mobile-logo">
                        {settings.logo_image ? (
                            <img src={settings.logo_image} alt="Logo" style={{ height: 52, maxWidth: 140, borderRadius: 12, objectFit: 'contain', marginBottom: 16 }} />
                        ) : (
                            <div style={{
                                width: 52, height: 52, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 14,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            </div>
                        )}
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>{settings.name || 'Nhà Trọ Minh Hiếu'}</h2>
                        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Hệ thống quản lý phòng trọ</p>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: 'white', borderRadius: 20,
                        padding: '2.5rem', boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Đăng nhập</h3>
                            <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>Chào mừng bạn quay lại!</p>
                        </div>

                        {errorMsg && (
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fecaca',
                                color: '#dc2626', padding: '12px 16px', borderRadius: 10,
                                fontSize: 14, display: 'flex', gap: 8, alignItems: 'flex-start',
                                marginBottom: '1.25rem'
                            }}>
                                <svg width="18" height="18" style={{ flexShrink: 0, marginTop: 1 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                                    Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên đăng nhập hoặc số điện thoại"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                                        border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 15,
                                        color: '#0f172a', background: '#f8fafc', outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                                    Mật khẩu
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Nhập mật khẩu của bạn"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{
                                            width: '100%', padding: '12px 48px 12px 16px', boxSizing: 'border-box',
                                            border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 15,
                                            color: '#0f172a', background: '#f8fafc', outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; }}
                                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                                    />
                                    <button type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        style={{
                                            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                                            display: 'flex', alignItems: 'center', padding: 0
                                        }}>
                                        {showPass ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%', padding: '13px', borderRadius: 12,
                                    background: isLoading ? '#c4b5fd' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white',
                                    fontWeight: 700, fontSize: 15, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all 0.2s', letterSpacing: '0.01em',
                                    boxShadow: isLoading ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.35)'
                                }}
                                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(99,102,241,0.45)'; }}}
                                onMouseLeave={e => { if (!isLoading) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)'; }}}
                            >
                                {isLoading ? (
                                    <>
                                        <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        Đang đăng nhập...
                                    </>
                                ) : 'Đăng nhập'}
                            </button>
                        </form>

                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                                Hệ thống chỉ cấp tài khoản sau khi ký hợp đồng thuê phòng.
                                <br />Liên hệ chủ nhà để được hỗ trợ.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (min-width: 800px) {
                    .login-left-panel { display: flex !important; }
                    .login-mobile-logo { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;
