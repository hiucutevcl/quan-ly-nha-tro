import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const defaultSettings = {
    nha_tro_name: 'Nhà Trọ Gia Đình',
    address: '',
    phone: '',
    owner: '',
    elec_price: 3500,
    water_price: 15000,
    note: '',
    bank_name: '',
    bank_account: '',
    bank_owner: ''
};

const SettingsPage = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const axiosAuth = axios.create({
        baseURL: 'https://api-quan-ly-nha-tro.onrender.com/api',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        axiosAuth.get('/settings')
            .then(res => {
                if (Object.keys(res.data).length > 0) {
                    setSettings({ ...defaultSettings, ...res.data });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải cài đặt:", err);
                setLoading(false);
            });
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axiosAuth.put('/settings', settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (error) {
            alert('Lỗi khi lưu cài đặt: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-black text-gray-800 mb-6 uppercase text-center">⚙️ Cài Đặt Nhà Trọ</h1>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Thông tin cơ bản */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-500">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Thông tin nhà trọ</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Tên nhà trọ</label>
                            <input type="text" name="nha_tro_name" className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
                                value={settings.nha_tro_name} onChange={handleChange} placeholder="VD: Nhà trọ Thành Công" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Địa chỉ</label>
                            <input type="text" name="address" className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
                                value={settings.address} onChange={handleChange} placeholder="Số nhà, đường, phường, quận..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Số điện thoại chủ trọ</label>
                                <input type="text" name="phone" className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
                                    value={settings.phone} onChange={handleChange} placeholder="0912 345 678" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Tên chủ trọ</label>
                                <input type="text" name="owner" className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
                                    value={settings.owner} onChange={handleChange} placeholder="Nguyễn Văn A" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Giá Điện / Nước */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-yellow-400">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Giá Điện & Nước</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Giá điện (đ/kWh)</label>
                            <input type="number" name="elec_price" className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-400"
                                value={settings.elec_price} onChange={handleChange} />
                            <p className="text-xs text-gray-400 mt-1">Giá điện hiện tại: <b>{Number(settings.elec_price).toLocaleString()}đ / kWh</b></p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Giá nước (đ/m³)</label>
                            <input type="number" name="water_price" className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-400"
                                value={settings.water_price} onChange={handleChange} />
                            <p className="text-xs text-gray-400 mt-1">Giá nước hiện tại: <b>{Number(settings.water_price).toLocaleString()}đ / m³</b></p>
                        </div>
                    </div>
                </div>

                {/* Thanh toán / Ngân hàng */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Thông tin chuyển khoản (Tạo mã QR)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-600 mb-1">Tên Ngân Hàng (Viết tắt chuẩn, vd: VCB, MB, TPB...)</label>
                            <input type="text" name="bank_name" className="w-full border rounded p-2 focus:ring-2 focus:ring-green-400"
                                value={settings.bank_name} onChange={handleChange} placeholder="MB, VCB, CTG, BIDV, TCB... (bắt buộc đúng để tạo QR)" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Số tài khoản</label>
                            <input type="text" name="bank_account" className="w-full border rounded p-2 focus:ring-2 focus:ring-green-400"
                                value={settings.bank_account} onChange={handleChange} placeholder="Số tài khoản ngân hàng" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Tên chủ tài khoản</label>
                            <input type="text" name="bank_owner" className="w-full border rounded p-2 focus:ring-2 focus:ring-green-400"
                                value={settings.bank_owner} onChange={handleChange} placeholder="NGUYEN VAN A" />
                        </div>
                    </div>
                </div>

                {/* Ghi chú */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-gray-300">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Ghi chú / Nội quy nhà trọ</h2>
                    <textarea name="note" rows={4} className="w-full border rounded p-2 focus:ring-2 focus:ring-gray-400"
                        value={settings.note} onChange={handleChange}
                        placeholder="Nhập nội quy, ghi chú hiển thị trên hóa đơn..." />
                </div>

                <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-3 rounded-xl shadow-lg transition text-lg">
                    💾 LƯU CÀI ĐẶT
                </button>

                {saved && (
                    <div className="text-center text-green-700 font-bold bg-green-100 p-3 rounded-xl border border-green-300">
                        ✅ Đã lưu cài đặt thành công!
                    </div>
                )}
            </form>
        </div>
    );
};

export default SettingsPage;
