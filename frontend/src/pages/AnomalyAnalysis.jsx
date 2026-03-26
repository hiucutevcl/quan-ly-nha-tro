import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'https://api-quan-ly-nha-tro.onrender.com/api';

const SEVERITY_COLORS = {
    'Khẩn cấp': { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', badge: '#dc2626', badgeTxt: '#fff' },
    'Cao':       { bg: '#fff7ed', border: '#fdba74', text: '#ea580c', badge: '#ea580c', badgeTxt: '#fff' },
    'Trung bình':{ bg: '#fefce8', border: '#fde047', text: '#ca8a04', badge: '#ca8a04', badgeTxt: '#fff' },
    'Thấp':      { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', badge: '#16a34a', badgeTxt: '#fff' },
};
const CONDITION_COLORS = {
    'Tốt':     { bg: '#f0fdf4', text: '#15803d' },
    'Cần sửa': { bg: '#fefce8', text: '#a16207' },
    'Hỏng':    { bg: '#fef2f2', text: '#dc2626' },
};
const STATUS_COLORS = {
    'Mới':          { bg: '#eff6ff', text: '#1d4ed8' },
    'Đang xử lý':  { bg: '#fff7ed', text: '#c2410c' },
    'Đã xử lý':    { bg: '#f0fdf4', text: '#15803d' },
};

const formatPct = (pct) => `+${pct}%`;

// ====================== SUB-PAGE: PHÂN TÍCH BẤT THƯỜNG ======================
const AnomalyPage = ({ token }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/statistics/anomalies`, { headers })
            .then(res => { setData(res.data); setLoading(false); })
            .catch(err => { alert('Lỗi tải phân tích: ' + (err.response?.data?.message || err.message)); setLoading(false); });
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang phân tích dữ liệu...</div>;
    if (!data) return null;

    const { anomalies, all_analyses, summary } = data;
    const itemsToRender = all_analyses || anomalies; // Fallback in case backend hasn't updated yet

    return (
        <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                    { icon: '🏠', label: 'Phòng đã phân tích', value: summary.total_rooms_analyzed, color: '#6366f1' },
                    { icon: '⚠️', label: 'Phòng bất thường', value: summary.rooms_with_anomaly, color: '#f59e0b' },
                    { icon: '🔴', label: 'Mức độ cao', value: summary.high_severity, color: '#ef4444' },
                    { icon: '🟡', label: 'Mức độ vừa', value: summary.medium_severity, color: '#f59e0b' },
                ].map(c => (
                    <div key={c.label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 28 }}>{c.icon}</div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* All Rooms List */}
            {itemsToRender.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#16a34a' }}>
                    <div style={{ fontSize: 48 }}>✅</div>
                    <div style={{ fontWeight: 700, fontSize: 18, marginTop: 8 }}>Chưa có đủ dữ liệu lịch sử để phân tích.</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Cần ít nhất hóa đơn của 2 tháng trước để bắt đầu so sánh.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {itemsToRender.map(a => (
                        <div key={a.room_id} style={{
                            background: a.severity === 'high' ? '#fef2f2' : (a.severity === 'medium' ? '#fffbeb' : '#f0fdf4'),
                            border: `1.5px solid ${a.severity === 'high' ? '#fca5a5' : (a.severity === 'medium' ? '#fde68a' : '#86efac')}`,
                            borderRadius: 14, padding: 20,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                                <div>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>🏠 {a.room_name}</span>
                                    {a.tenant_name && <span style={{ marginLeft: 8, fontSize: 13, color: '#64748b' }}>· {a.tenant_name}</span>}
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Kỳ phân tích: {a.month_year}</div>
                                </div>
                                <span style={{
                                    background: a.severity === 'high' ? '#dc2626' : (a.severity === 'medium' ? '#f59e0b' : '#16a34a'), color: 'white',
                                    fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 999
                                }}>
                                    {a.severity === 'high' ? '🔴 Bất thường (Cao)' : (a.severity === 'medium' ? '🟡 Bất thường (Vừa)' : '🟢 Bình thường')}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                                {a.warnings.map(w => (
                                    <div key={w.type} style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{w.label}</div>
                                        <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                                            <div>
                                                <div style={{ color: '#94a3b8', fontSize: 11 }}>Tháng này</div>
                                                <div style={{ fontWeight: 800, fontSize: 18, color: w.severity !== 'normal' ? '#dc2626' : '#15803d' }}>
                                                    {w.current} <span style={{ fontSize: 12, fontWeight: 400 }}>{w.unit}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ color: '#94a3b8', fontSize: 11 }}>TB 3 tháng trước</div>
                                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{w.avg} {w.unit}</div>
                                            </div>
                                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                                <div style={{ color: '#94a3b8', fontSize: 11 }}>Biến động</div>
                                                <div style={{ fontWeight: 800, color: w.severity !== 'normal' ? '#dc2626' : '#15803d', fontSize: 18 }}>
                                                    {w.percent_increase >= 0 ? `+${w.percent_increase}%` : `${w.percent_increase}%`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ====================== SUB-PAGE: ĐỒ ĐẠC / TÀI SẢN ======================
const AssetsPage = ({ token, rooms }) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRoom, setFilterRoom] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ room_id: '', asset_name: '', description: '', condition_status: 'Tốt', quantity: 1 });
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const COMMON_AMENITIES = ["Máy lạnh", "Tủ lạnh", "Máy giặt", "Nóng lạnh", "Giường", "Nệm", "Tủ quần áo", "Bàn ghế", "Tivi", "Quạt", "Wifi", "Bếp điện"];
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    const fetchAssets = useCallback(() => {
        axios.get(`${API}/room-management/assets`, headers)
            .then(res => { setAssets(res.data); setLoading(false); })
            .catch(err => { alert(err.response?.data?.message || err.message); setLoading(false); });
    }, []);

    useEffect(() => { fetchAssets(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editItem) {
                await axios.put(`${API}/room-management/assets/${editItem.id}`, form, headers);
            } else {
                let assetsToSubmit = [];
                // Add all checked amenities
                selectedAmenities.forEach(am => {
                    assetsToSubmit.push({ asset_name: am, condition_status: 'Tốt', quantity: 1, description: '' });
                });
                // Add custom if typed
                if (form.asset_name.trim()) {
                    assetsToSubmit.push({ 
                        asset_name: form.asset_name, 
                        condition_status: form.condition_status, 
                        quantity: form.quantity, 
                        description: form.description 
                    });
                }
                if (assetsToSubmit.length === 0) {
                    return alert('Vui lòng chọn ít nhất 1 tiện nghi hoặc nhập tên tài sản mới!');
                }
                
                if (assetsToSubmit.length === 1) {
                    // Single insert fallback
                    await axios.post(`${API}/room-management/assets`, { ...assetsToSubmit[0], room_id: form.room_id }, headers);
                } else {
                    // Bulk insert
                    await axios.post(`${API}/room-management/assets/bulk`, { room_id: form.room_id, assets: assetsToSubmit }, headers);
                }
            }
            setShowForm(false); setEditItem(null);
            setForm({ room_id: '', asset_name: '', description: '', condition_status: 'Tốt', quantity: 1 });
            setSelectedAmenities([]);
            fetchAssets();
        } catch (err) { alert(err.response?.data?.message || err.message); }
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setForm({ room_id: item.room_id, asset_name: item.asset_name, description: item.description || '', condition_status: item.condition_status, quantity: item.quantity });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa tài sản này?')) return;
        try {
            await axios.delete(`${API}/room-management/assets/${id}`, headers);
            fetchAssets();
        } catch (err) { alert(err.response?.data?.message || err.message); }
    };

    const filtered = filterRoom ? assets.filter(a => a.room_id === Number(filterRoom)) : assets;

    // Group by room
    const grouped = filtered.reduce((acc, a) => {
        if (!acc[a.room_name]) acc[a.room_name] = [];
        acc[a.room_name].push(a);
        return acc;
    }, {});

    const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' };
    const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)}
                    style={{ padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#374151' }}>
                    <option value="">-- Tất cả phòng --</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.room_name}</option>)}
                </select>
                <button onClick={() => { setShowForm(!showForm); setEditItem(null); setForm({ room_id: '', asset_name: '', description: '', condition_status: 'Tốt', quantity: 1 }); setSelectedAmenities([]); }}
                    style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                    {showForm ? '✕ Đóng' : '+ Thêm Tài Sản'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={{ background: 'white', border: '1.5px solid #e0e7ff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                    <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#4338ca' }}>{editItem ? '✏️ Sửa tài sản' : '➕ Thêm tài sản/tiện nghi mới'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Phòng *</label>
                            <select required value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} style={inputStyle}>
                                <option value="">-- Chọn phòng --</option>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_name}</option>)}
                            </select>
                        </div>

                        {!editItem && (
                            <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: 10 }}>
                                <label style={{ ...labelStyle, fontSize: 14, color: '#1e293b', marginBottom: 12 }}>Đánh dấu những tiện nghi có trong phòng:</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                                    {COMMON_AMENITIES.map(amenity => (
                                        <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#334155' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedAmenities.includes(amenity)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedAmenities([...selectedAmenities, amenity]);
                                                    else setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                                                }}
                                                style={{ width: 16, height: 16, cursor: 'pointer' }}
                                            />
                                            {amenity}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
                            <label style={labelStyle}>{editItem ? 'Tên đồ đạc/Tài sản *' : 'Tài sản khác (Hoặc tự nhập tên)'}</label>
                            <input required={!!editItem} value={form.asset_name} onChange={e => setForm({ ...form, asset_name: e.target.value })} placeholder="VD: Bàn làm việc, ghế xoay..." style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Tình trạng {(!editItem && selectedAmenities.length > 0) ? '(Chỉ áp dụng cho TS Khác)' : ''}</label>
                            <select value={form.condition_status} onChange={e => setForm({ ...form, condition_status: e.target.value })} style={inputStyle}>
                                {['Tốt', 'Cần sửa', 'Hỏng'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Số lượng</label>
                            <input type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Ghi chú thêm</label>
                            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả thêm (không bắt buộc)" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer' }}>
                            {editItem ? '💾 Lưu thay đổi' : '✅ Thêm tài sản'}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                    </div>
                </form>
            )}

            {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</div> :
                Object.keys(grouped).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                        <div style={{ fontSize: 40 }}>📦</div>
                        <div style={{ marginTop: 8, fontWeight: 600 }}>Chưa có tài sản nào được ghi nhận.</div>
                        <button onClick={() => { setShowForm(true); setEditItem(null); setForm({ room_id: '', asset_name: '', description: '', condition_status: 'Tốt', quantity: 1 }); setSelectedAmenities([]); }}
                            style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginTop: 16 }}>
                            + Thêm Tài Sản Đầu Tiên
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {Object.entries(grouped).map(([roomName, items]) => {
                            const firstItem = items[0];
                            return (
                            <div key={roomName} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ background: '#f8fafc', padding: '10px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 800, color: '#1e1b4b', fontSize: 15 }}>
                                        🏠 {roomName} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 13 }}>({items.length} tài sản)</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setShowForm(true);
                                            setEditItem(null);
                                            setForm({ room_id: firstItem.room_id, asset_name: '', description: '', condition_status: 'Tốt', quantity: 1 });
                                            setSelectedAmenities([]);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        + Thêm tiện nghi
                                    </button>
                                </div>
                                <div>
                                    {items.map(item => {
                                        const cc = CONDITION_COLORS[item.condition_status] || CONDITION_COLORS['Tốt'];
                                        return (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 6 }}>
                                                <div>
                                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.asset_name}</span>
                                                    {item.quantity > 1 && <span style={{ marginLeft: 6, fontSize: 12, color: '#64748b' }}>x{item.quantity}</span>}
                                                    {item.description && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.description}</div>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ background: cc.bg, color: cc.text, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{item.condition_status}</span>
                                                    <button onClick={() => handleEdit(item)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏️</button>
                                                    <button onClick={() => handleDelete(item.id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )})}
                    </div>
                )
            }
        </div>
    );
};

// ====================== SUB-PAGE: SỰ CỐ ======================
const IncidentsPage = ({ token, rooms }) => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRoom, setFilterRoom] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [resolveItem, setResolveItem] = useState(null);
    const [form, setForm] = useState({ room_id: '', title: '', description: '', severity: 'Trung bình' });
    const [resolveNote, setResolveNote] = useState('');
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    const fetchIncidents = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/room-management/incidents`, headers);
            setIncidents(res.data);
            setLoading(false);
        } catch (err) { alert(err.response?.data?.message || err.message); setLoading(false); }
    }, []);

    useEffect(() => { fetchIncidents(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editItem) {
                await axios.put(`${API}/room-management/incidents/${editItem.id}`, { ...editItem, ...form }, headers);
            } else {
                await axios.post(`${API}/room-management/incidents`, form, headers);
            }
            setShowForm(false); setEditItem(null);
            setForm({ room_id: '', title: '', description: '', severity: 'Trung bình' });
            fetchIncidents();
        } catch (err) { alert(err.response?.data?.message || err.message); }
    };

    const handleResolve = async (item) => {
        try {
            await axios.put(`${API}/room-management/incidents/${item.id}`, {
                ...item, status: 'Đã xử lý',
                resolved_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                resolve_note: resolveNote
            }, headers);
            setResolveItem(null); setResolveNote('');
            fetchIncidents();
        } catch (err) { alert(err.response?.data?.message || err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa sự cố này?')) return;
        try {
            await axios.delete(`${API}/room-management/incidents/${id}`, headers);
            fetchIncidents();
        } catch (err) { alert(err.response?.data?.message || err.message); }
    };

    let filtered = incidents;
    if (filterRoom) filtered = filtered.filter(i => i.room_id === Number(filterRoom));
    if (filterStatus) filtered = filtered.filter(i => i.status === filterStatus);

    const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' };
    const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 };

    const openCount = incidents.filter(i => i.status !== 'Đã xử lý').length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)}
                        style={{ padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                        <option value="">-- Tất cả phòng --</option>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.room_name}</option>)}
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                        <option value="">-- Tất cả trạng thái --</option>
                        {['Mới', 'Đang xử lý', 'Đã xử lý'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    {openCount > 0 && (
                        <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 14px', fontSize: 14, fontWeight: 700 }}>
                            ⚠️ {openCount} sự cố chưa xử lý
                        </span>
                    )}
                </div>
                <button onClick={() => { setShowForm(!showForm); setEditItem(null); setForm({ room_id: '', title: '', description: '', severity: 'Trung bình' }); }}
                    style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                    {showForm ? '✕ Đóng' : '+ Ghi Nhận Sự Cố'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={{ background: 'white', border: '1.5px solid #fca5a5', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                    <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#dc2626' }}>{editItem ? '✏️ Sửa sự cố' : '🚨 Ghi nhận sự cố mới'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Phòng *</label>
                            <select required value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} style={inputStyle}>
                                <option value="">-- Chọn phòng --</option>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Tiêu đề sự cố *</label>
                            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="VD: Rò điện, Tắc bồn rửa..." style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Mức độ</label>
                            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={inputStyle}>
                                {['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Mô tả chi tiết</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả cụ thể sự cố..." rows={2}
                                style={{ ...inputStyle, resize: 'vertical' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <button type="submit" style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer' }}>
                            {editItem ? '💾 Lưu' : '🚨 Ghi nhận'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                    </div>
                </form>
            )}

            {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</div> :
                filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                        <div style={{ fontSize: 40 }}>🛠️</div>
                        <div style={{ marginTop: 8, fontWeight: 600 }}>Không có sự cố nào.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map(inc => {
                            const sc = SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS['Trung bình'];
                            const stc = STATUS_COLORS[inc.status] || STATUS_COLORS['Mới'];
                            return (
                                <div key={inc.id} style={{ background: sc.bg, border: `1.5px solid ${sc.border}`, borderRadius: 12, padding: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: inc.description || resolveItem?.id === inc.id ? 10 : 0 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{inc.title}</span>
                                                <span style={{ background: sc.badge, color: sc.badgeTxt, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>{inc.severity}</span>
                                                <span style={{ background: stc.bg, color: stc.text, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, border: `1px solid ${stc.text}30` }}>{inc.status}</span>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                                🏠 {inc.room_name} · Ghi nhận: {new Date(inc.reported_at).toLocaleDateString('vi-VN')}
                                                {inc.resolved_at && ` · Đã xử lý: ${new Date(inc.resolved_at).toLocaleDateString('vi-VN')}`}
                                            </div>
                                            {inc.description && <div style={{ fontSize: 13, color: '#374151', marginTop: 6 }}>{inc.description}</div>}
                                            {inc.resolve_note && <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>✅ Ghi chú xử lý: {inc.resolve_note}</div>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                            {inc.status !== 'Đã xử lý' && (
                                                <button onClick={() => { setResolveItem(resolveItem?.id === inc.id ? null : inc); setResolveNote(''); }}
                                                    style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                                    ✅ Xử lý xong
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(inc.id)}
                                                style={{ background: 'white', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 7, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
                                        </div>
                                    </div>
                                    {resolveItem?.id === inc.id && (
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                            <input value={resolveNote} onChange={e => setResolveNote(e.target.value)} placeholder="Ghi chú cách xử lý (không bắt buộc)..."
                                                style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #86efac', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                                            <button onClick={() => handleResolve(inc)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                                                ✅ Xác nhận
                                            </button>
                                            <button onClick={() => setResolveItem(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Hủy</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            }
        </div>
    );
};

// ====================== TRANG TỔNG HỢP CHÍNH ======================
const AnomalyAnalysis = () => {
    const [activeTab, setActiveTab] = useState('anomaly');
    const [rooms, setRooms] = useState([]);
    const token = localStorage.getItem('token');
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        axios.get(`${API}/rooms/all`, headers)
            .then(res => setRooms(res.data))
            .catch(() => {});
    }, []);

    const TABS = [
        { key: 'anomaly',   label: '📊 Phân tích Bất thường', sub: 'Điện/nước tăng đột biến' },
        { key: 'assets',    label: '🪑 Đồ đạc & Tài sản',     sub: 'Theo dõi tình trạng' },
        { key: 'incidents', label: '🔧 Sự cố & Hỏng hóc',     sub: 'Ghi nhận và xử lý' },
    ];

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100%' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>🔍 Phân tích & Quản lý Tình trạng Phòng</h1>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Phát hiện bất thường, theo dõi đồ đạc, ghi nhận & xử lý sự cố cho từng phòng</p>
            </div>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        background: activeTab === tab.key ? '#4f46e5' : 'white',
                        color: activeTab === tab.key ? 'white' : '#374151',
                        border: `1.5px solid ${activeTab === tab.key ? '#4f46e5' : '#e2e8f0'}`,
                        borderRadius: 10, padding: '10px 20px', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.15s'
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{tab.label}</div>
                        <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{tab.sub}</div>
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'anomaly'   && <AnomalyPage   token={token} />}
            {activeTab === 'assets'    && <AssetsPage    token={token} rooms={rooms} />}
            {activeTab === 'incidents' && <IncidentsPage token={token} rooms={rooms} />}
        </div>
    );
};

export default AnomalyAnalysis;
