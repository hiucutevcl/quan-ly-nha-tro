import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'nha_tro_settings';

const defaultSettings = {
    name: 'Nhà Trọ Gia Đình',
    address: '',
    phone: '',
    owner: '',
    elec_price: 3500,
    water_price: 15000,
    note: '',
};

const SettingsPage = () => {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch { return defaultSettings; }
    });
    const [saved, setSaved] = useState(false);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
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
                            <input type="text" name="name" className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
                                value={settings.name} onChange={handleChange} placeholder="VD: Nhà trọ Thành Công" />
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
