import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [resetPassUser, setResetPassUser] = useState(null); // {id, full_name, newPass}
    const [credCard, setCredCard] = useState(null); // Hiển phiếu đăng nhập sau khi tạo

    const [newUser, setNewUser] = useState({
        username: '', password: '', full_name: '', phone: '', id_card: '', hometown: ''
    });

    const token = localStorage.getItem('token');
    const apiHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('https://api-quan-ly-nha-tro.onrender.com/api/auth/users', apiHeaders);
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            alert('Lỗi tải danh sách: ' + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Thêm tài khoản mới
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const formattedUsername = newUser.username.trim();
            const submissionData = { ...newUser, username: formattedUsername, role: 'Tenant' };
            await axios.post('https://api-quan-ly-nha-tro.onrender.com/api/auth/register', submissionData, apiHeaders);
            // Hiển phiếu đăng nhập sau khi tạo thành công
            setCredCard({ full_name: newUser.full_name, username: formattedUsername, password: newUser.password });
            setNewUser({ username: '', password: '', full_name: '', phone: '', id_card: '', hometown: '' });
            setShowAddForm(false);
            fetchUsers();
        } catch (error) {
            alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    // Cập nhật thông tin khách
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://api-quan-ly-nha-tro.onrender.com/api/auth/users/${editUser.id}`, editUser, apiHeaders);
            alert('✅ Đã cập nhật thông tin thành công!');
            setEditUser(null);
            fetchUsers();
        } catch (error) {
            alert('❌ Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        }
    };

    // Xóa tài khoản
    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Chắc chắn muốn xóa khách thuê "${name}"?`)) return;
        try {
            await axios.delete(`https://api-quan-ly-nha-tro.onrender.com/api/auth/users/${id}`, apiHeaders);
            alert('✅ Đã xóa tài khoản!');
            fetchUsers();
        } catch (error) {
            alert('❌ ' + (error.response?.data?.message || error.message));
        }
    };

    // Đặt lại mật khẩu
    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://api-quan-ly-nha-tro.onrender.com/api/auth/users/${resetPassUser.id}/reset-password`,
                { new_password: resetPassUser.newPass }, apiHeaders);
            // Hiển phiếu đăng nhập mới
            setCredCard({ full_name: resetPassUser.full_name, username: resetPassUser.username, password: resetPassUser.newPass });
            setResetPassUser(null);
        } catch (error) {
            alert('❌ ' + (error.response?.data?.message || error.message));
        }
    };

    // Xuất Excel
    const exportToExcel = () => {
        const data = users.map((u, index) => ({
            'STT': index + 1,
            'Họ và Tên': u.full_name,
            'Tên Đăng Nhập': u.username,
            'Số Điện Thoại': u.phone || '---',
            'SỐ CCCD/CMND': u.id_card || '---',
            'Quê Quán': u.hometown || '---',
            'Đang Thuê Phòng': u.room_name || 'Chưa xếp phòng'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DanhSachKhachThue');
        const d = new Date();
        const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
        XLSX.writeFile(wb, `DSKhachThue_${dateStr}.xlsx`);
    };

    if (loading) return <div className="text-center mt-10 text-gray-500">Đang tải...</div>;

    return (
        <div className="bg-slate-50 min-h-screen">

            {/* ===== MODAL PHIẾU ĐĂNG NHẬP ===== */}
            {credCard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center">
                        <div className="text-5xl mb-2">🎉</div>
                        <h2 className="text-xl font-black text-gray-800 mb-1">Tài khoản sẵn sàng!</h2>
                        <p className="text-gray-500 text-sm mb-5">Giao phiếu này cho khách thuê</p>
                        <div className="bg-indigo-50 border-2 border-dashed border-blue-300 rounded-xl p-4 text-left space-y-3 mb-5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-bold uppercase">Họ tên</span>
                                <span className="font-bold text-gray-800">{credCard.full_name}</span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2">
                                <span className="text-xs text-gray-500 font-bold uppercase">Tên đăng nhập</span>
                                <span className="font-mono font-black text-indigo-700 text-lg">{credCard.username}</span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2">
                                <span className="text-xs text-gray-500 font-bold uppercase">Mật khẩu</span>
                                <span className="font-mono font-black text-red-600 text-lg">{credCard.password}</span>
                            </div>
                            <div className="border-t pt-2 text-center">
                                <p className="text-xs text-slate-400">🌐 Đăng nhập tại: <b>localhost:5173</b></p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCredCard(null)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition"
                        >
                            ✅ Đã hiểu, đóng lại
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-black text-gray-800 uppercase">👥 Quản Lý Khách Thuê</h1>
                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        disabled={users.length === 0}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition disabled:opacity-40"
                    >
                        📤 Xuất Excel ({users.length})
                    </button>
                    <button
                        onClick={() => { setShowAddForm(!showAddForm); setEditUser(null); }}
                        className={`px-4 py-2 rounded-lg font-bold transition text-sm ${showAddForm ? 'bg-slate-400 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    >
                        {showAddForm ? '✕ Đóng' : '+ Thêm Khách Mới'}
                    </button>
                </div>
            </div>

            {/* ===== FORM THÊM MỚI ===== */}
            {showAddForm && (
                <div className="bg-white p-5 rounded-xl shadow mb-6 border-t-4 border-indigo-500">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">📋 Tạo Tài Khoản Khách Thuê Mới</h2>
                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                            <input type="text" required placeholder="Nguyễn Văn A"
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Số điện thoại</label>
                            <input type="text" placeholder="0912 345 678"
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                            <input type="text" required placeholder="VD: 0912345678 hoặc tên bất kỳ"
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                            <input type="text" required placeholder="Mật khẩu ban đầu"
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Số CCCD/CMND</label>
                            <input type="text" placeholder="012345678901"
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                value={newUser.id_card} onChange={e => setNewUser({...newUser, id_card: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Quê quán / Địa chỉ thường trú</label>
                            <input type="text" placeholder="Tỉnh/Thành phố..."
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                value={newUser.hometown} onChange={e => setNewUser({...newUser, hometown: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 flex gap-2 pt-1">
                            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition text-sm">
                                ✅ Tạo Tài Khoản
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-sm transition">
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ===== BẢNG DANH SÁCH ===== */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="bg-gray-700 text-white px-5 py-3 font-bold flex items-center justify-between">
                    <span>Danh sách khách thuê ({users.length} người)</span>
                </div>

                {users.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <span className="text-4xl block mb-2">👤</span>
                        <p>Chưa có khách thuê nào.</p>
                    </div>
                ) : (
                    <div>
                        {users.map((user, idx) => (
                            <div key={user.id} className="border-b border-gray-100 last:border-0">
                                {/* Dòng chính */}
                                <div className="flex items-center px-4 py-3 hover:bg-slate-50 transition">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 ml-3 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{user.full_name}</p>
                                            <p className="text-xs text-slate-400 font-mono">{user.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">{user.phone || <span className="text-gray-300 text-xs">Chưa có SĐT</span>}</p>
                                            <p className="text-xs text-slate-400">{user.id_card ? `CCCD: ${user.id_card}` : ''}</p>
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-xs text-gray-500">{user.hometown || <span className="text-gray-300">—</span>}</p>
                                        </div>
                                        <div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.room_name ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-slate-400'}`}>
                                                {user.room_name ? `🏠 ${user.room_name}` : 'Chưa có phòng'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                        <button
                                            onClick={() => { setEditUser(editUser?.id === user.id ? null : { ...user }); setResetPassUser(null); }}
                                            className="text-indigo-500 hover:text-indigo-700 text-xs font-bold hover:bg-indigo-50 px-2 py-1 rounded transition"
                                        >✏️ Sửa</button>
                                        <button
                                            onClick={() => { setResetPassUser(resetPassUser?.id === user.id ? null : { id: user.id, full_name: user.full_name, username: user.username, newPass: '' }); setEditUser(null); }}
                                            className="text-amber-600 hover:text-amber-800 text-xs font-bold hover:bg-amber-50 px-2 py-1 rounded transition"
                                        >🔑 MK</button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                                            className="text-red-500 hover:text-red-700 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded transition"
                                        >🗑️ Xóa</button>
                                    </div>
                                </div>

                                {/* Panel Đặt lại mật khẩu */}
                                {resetPassUser?.id === user.id && (
                                    <form onSubmit={handleResetPassword}
                                        className="bg-amber-50 border-t border-amber-100 p-3 flex items-end gap-2"
                                    >
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-amber-800 block mb-1">🔑 Mật khẩu mới cho {user.full_name}</label>
                                            <input type="text" required minLength={4} placeholder="Nhập mật khẩu mới..."
                                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-amber-400"
                                                value={resetPassUser.newPass}
                                                onChange={e => setResetPassUser({...resetPassUser, newPass: e.target.value})} />
                                        </div>
                                        <button type="submit" className="bg-amber-500 text-white font-bold px-3 py-2 rounded text-sm hover:bg-amber-600 transition">✅ Đặt lại</button>
                                        <button type="button" onClick={() => setResetPassUser(null)} className="bg-gray-200 font-bold px-2 py-2 rounded text-sm">Hủy</button>
                                    </form>
                                )}

                                {/* Panel Sửa thông tin */}
                                {editUser?.id === user.id && (
                                    <form onSubmit={handleUpdateUser}
                                        className="bg-indigo-50 border-t border-blue-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
                                    >
                                        <h3 className="md:col-span-2 text-sm font-bold text-indigo-800 mb-1">📝 Sửa thông tin: {user.full_name}</h3>
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Họ và Tên</label>
                                            <input type="text" required className="w-full border rounded p-2 text-sm"
                                                value={editUser.full_name} onChange={e => setEditUser({...editUser, full_name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Số điện thoại</label>
                                            <input type="text" className="w-full border rounded p-2 text-sm"
                                                value={editUser.phone || ''} onChange={e => setEditUser({...editUser, phone: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Số CCCD/CMND</label>
                                            <input type="text" className="w-full border rounded p-2 text-sm"
                                                value={editUser.id_card || ''} onChange={e => setEditUser({...editUser, id_card: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Quê quán</label>
                                            <input type="text" className="w-full border rounded p-2 text-sm"
                                                value={editUser.hometown || ''} onChange={e => setEditUser({...editUser, hometown: e.target.value})} />
                                        </div>
                                        <div className="md:col-span-2 flex gap-2">
                                            <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded text-sm hover:bg-indigo-700 transition">
                                                💾 Lưu thay đổi
                                            </button>
                                            <button type="button" onClick={() => setEditUser(null)} className="px-4 bg-gray-300 rounded text-sm font-bold hover:bg-slate-400 transition">
                                                Hủy
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
