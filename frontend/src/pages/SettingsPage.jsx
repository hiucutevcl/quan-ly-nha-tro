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
    bank_owner: '',
    chat_available_rooms: 'Hiện tại {name} đang có {count} phòng trống 🏠:\n\n{roomList}\n\nBạn muốn đặt lịch xem phòng, liên hệ chủ trọ qua số {phone} nhé!',
    chat_price: '💰 Bảng giá phòng tại {name}:\n\n{prices}\n\nChưa bao gồm điện & nước. Liên hệ {phone} để biết thêm chi tiết!',
    chat_address: '📍 Địa chỉ: {address}\n\nBạn có thể liên hệ chủ trọ qua số {phone} để được hướng dẫn đường đi chi tiết nhé!',
    chat_utilities: '⚡ Giá điện: {elecPrice}đ/kWh\n💧 Giá nước: {waterPrice}đ/m³\n\nĐây là giá thu theo chỉ số thực tế hàng tháng. Nếu cần thêm thông tin, liên hệ {phone} nhé!',
    chat_contact: '📞 Để liên hệ chủ trọ {name}:\n\n• Số điện thoại/Zalo: {phone}\n• Địa chỉ: {address}\n\nBạn có thể nhắn tin Zalo hoặc gọi trực tiếp, chủ trọ sẽ phản hồi sớm nhất có thể nhé!',
    quick_replies: '🏠 Xem phòng trống\n💰 Báo giá thuê\n📍 Xin địa chỉ\n📞 Liên hệ chủ trọ\n⚡ Giá điện nước',
    quick_replies: '🏠 Xem phòng trống\n💰 Báo giá thuê\n📍 Xin địa chỉ\n📞 Liên hệ chủ trọ\n⚡ Giá điện nước',
    buildings_info: '',
    ads_config: JSON.stringify([
      { title: '🌐 Lắp đặt Internet FPT Sinh Viên', desc: 'Giảm ngay 50% phí hòa mạng.', details: 'Chương trình cực HOT dành cho Tân sinh viên! Tặng thêm 2 tháng cước khi đóng trước 6 tháng. Ưu tiên lắp đặt hỏa tốc trong 24h vòng quanh hệ thống nhà trọ. Liên hệ ngay SĐT: 0988.xxx.xxx', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80' },
      { title: '📦 Dịch vụ chuyển trọ Thành Hưng', desc: 'Chỉ từ 299k trọn gói xe tải nhỏ.', details: 'Bạn cần chuyển trọ cuối tháng? Đã có Thành Hưng! Xe tải nhỏ 500kg chạy nội ô. Hỗ trợ bọc lót chống trầy xước tủ lạnh, tivi, đệm. Gọi trước 1 ngày để nhận ngay chiết khấu 100k cho khách quen nhà trọ.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' }
    ])
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

    const getQr = (index) => {
        if (!settings.quick_replies) return '';
        return settings.quick_replies.split('\n')[index] || '';
    };

    const updateQr = (index, value) => {
        let arr = (settings.quick_replies || '').split('\n');
        while (arr.length < 5) arr.push('');
        arr[index] = value;
        setSettings({ ...settings, quick_replies: arr.join('\n') });
    };

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <h1 className="text-2xl font-black text-gray-800 mb-6 uppercase text-center mt-6">⚙️ Cài Đặt Nhà Trọ</h1>

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
                    <textarea name="note" rows={10} className="w-full border rounded p-2 focus:ring-2 focus:ring-gray-400"
                        value={settings.note} onChange={handleChange}
                        placeholder="Nhập nội quy, ghi chú hiển thị trên hóa đơn và web chính..." />
                </div>

                {/* Thông tin Đa Khu Nhà */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-purple-500">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">🏠 Thông tin các Khu nhà (Chatbot dùng báo giá Điện/Nước)</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Nếu bạn có nhiều khu nhà, hãy ghi rõ từng khu với đơn vị đo chuẩn (kWh, m³). Ví dụ:
                        <br/>
                        - Khu A (Q10): Điện 3.500đ/kWh, Nước 15.000đ/m³.
                        <br/>
                        - Khu B (Q3): Điện 4.000đ/kWh, Nước 20.000đ/m³.
                    </p>
                    <textarea name="buildings_info" rows={5} className="w-full border rounded p-2 focus:ring-2 focus:ring-purple-400"
                        value={settings.buildings_info} onChange={handleChange}
                        placeholder="Nhập thông tin các khu nhà..." />
                </div>

                {/* Cấu hình Chatbot FAQ */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-indigo-500">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">🤖 Cấu hình Câu trả lời Chatbot (FAQ)</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Bạn có thể thay đổi tên <b>Nút gợi ý</b> (sẽ hiển thị trên Chatbot cho khách bấm) và <b>Câu trả lời</b> tương ứng của Bot.
                        Sử dụng các biến như <b>{'{name}'}</b>, <b>{'{phone}'}</b>... để dữ liệu tự động thay đổi theo thông tin thật.
                    </p>
                    <div className="space-y-6">

                        {/* 1. Phòng Trống */}
                        <div className="border border-slate-200 p-5 rounded-xl bg-slate-50 relative">
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">1</div>
                            <h3 className="text-md font-bold text-slate-800 mb-1">Khi khách hỏi Phòng Trống</h3>
                            <p className="text-xs text-slate-500 mb-4">Biến hỗ trợ: {'{name}, {count}, {roomList}, {phone}'}</p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tên nút Gợi ý (Quick Reply):</label>
                                    <input type="text" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={getQr(0)} onChange={(e) => updateQr(0, e.target.value)} placeholder="VD: 🏠 Xem phòng trống" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Câu trả lời của Bot:</label>
                                    <textarea name="chat_available_rooms" rows={3} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={settings.chat_available_rooms} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Giá Phòng */}
                        <div className="border border-slate-200 p-5 rounded-xl bg-slate-50 relative">
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">2</div>
                            <h3 className="text-md font-bold text-slate-800 mb-1">Khi khách hỏi Giá Phòng</h3>
                            <p className="text-xs text-slate-500 mb-4">Biến hỗ trợ: {'{name}, {prices}, {phone}'}</p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tên nút Gợi ý (Quick Reply):</label>
                                    <input type="text" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={getQr(1)} onChange={(e) => updateQr(1, e.target.value)} placeholder="VD: 💰 Báo giá thuê" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Câu trả lời của Bot:</label>
                                    <textarea name="chat_price" rows={3} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={settings.chat_price} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* 3. Địa Chỉ */}
                        <div className="border border-slate-200 p-5 rounded-xl bg-slate-50 relative">
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">3</div>
                            <h3 className="text-md font-bold text-slate-800 mb-1">Khi khách hỏi Địa Chỉ</h3>
                            <p className="text-xs text-slate-500 mb-4">Biến hỗ trợ: {'{address}, {phone}'}</p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tên nút Gợi ý (Quick Reply):</label>
                                    <input type="text" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={getQr(2)} onChange={(e) => updateQr(2, e.target.value)} placeholder="VD: 📍 Xin địa chỉ" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Câu trả lời của Bot:</label>
                                    <textarea name="chat_address" rows={2} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={settings.chat_address} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* 4. Liên Hệ */}
                        <div className="border border-slate-200 p-5 rounded-xl bg-slate-50 relative">
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">4</div>
                            <h3 className="text-md font-bold text-slate-800 mb-1">Khi khách hỏi Liên Hệ / Gọi điện</h3>
                            <p className="text-xs text-slate-500 mb-4">Biến hỗ trợ: {'{name}, {phone}, {address}'}</p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tên nút Gợi ý (Quick Reply):</label>
                                    <input type="text" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={getQr(3)} onChange={(e) => updateQr(3, e.target.value)} placeholder="VD: 📞 Liên hệ chủ trọ" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Câu trả lời của Bot:</label>
                                    <textarea name="chat_contact" rows={3} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={settings.chat_contact} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* 5. Điện Nước */}
                        <div className="border border-slate-200 p-5 rounded-xl bg-slate-50 relative">
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">5</div>
                            <h3 className="text-md font-bold text-slate-800 mb-1">Khi khách hỏi Giá Điện / Nước</h3>
                            <p className="text-xs text-slate-500 mb-4">Biến hỗ trợ: {'{elecPrice}, {waterPrice}, {phone}'}</p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tên nút Gợi ý (Quick Reply):</label>
                                    <input type="text" className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={getQr(4)} onChange={(e) => updateQr(4, e.target.value)} placeholder="VD: ⚡ Giá điện nước" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Câu trả lời của Bot:</label>
                                    <textarea name="chat_utilities" rows={3} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                        value={settings.chat_utilities} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- QUẢN LÝ QUẢNG CÁO ĐỘNG (ADS BANNER) --- */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-rose-500">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">📢 Quản lý Cấu hình Quảng Cáo (Ads Banner)</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Các thẻ quảng cáo này sẽ xuất hiện tại Trang chủ và cột Sidebar của Trang Tin Tức. Người thuê nhấn vào sẽ hiển thị chi tiết (<b>Sinh doanh thu thương mại chéo</b>).
                    </p>
                    
                    {(() => {
                        let adsList = [];
                        try {
                            if (settings.ads_config) {
                                adsList = JSON.parse(settings.ads_config);
                                if (!Array.isArray(adsList)) adsList = [];
                            }
                        } catch (e) {
                            adsList = [];
                        }

                        const handleAdChange = (index, field, value) => {
                            const newAds = [...adsList];
                            newAds[index][field] = value;
                            setSettings({ ...settings, ads_config: JSON.stringify(newAds) });
                        };

                        const addAd = () => {
                            const newAds = [...adsList, { title: '', desc: '', details: '', image: '' }];
                            setSettings({ ...settings, ads_config: JSON.stringify(newAds) });
                        };

                        const removeAd = (index) => {
                            if (!window.confirm('Bạn có chắc muốn xóa quảng cáo này?')) return;
                            const newAds = adsList.filter((_, i) => i !== index);
                            setSettings({ ...settings, ads_config: JSON.stringify(newAds) });
                        };

                        return (
                            <div className="space-y-6">
                                {adsList.map((ad, idx) => (
                                    <div key={idx} className="border border-rose-200 p-4 rounded-xl bg-rose-50 relative">
                                        <button type="button" onClick={() => removeAd(idx)} className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 font-bold bg-white px-2 py-0.5 rounded shadow-sm text-sm">Xóa QC</button>
                                        <h3 className="text-sm font-bold text-rose-800 mb-3">Banner Quảng Cáo #{idx + 1}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-600 mb-1">Tiêu đề (Hiển thị nổi bật)</label>
                                                <input type="text" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-rose-400"
                                                    value={ad.title} onChange={(e) => handleAdChange(idx, 'title', e.target.value)} placeholder="VD: Lắp Internet FPT Sinh Viên" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">Mô tả ngắn gọn (Hiển thị thẻ ngoài)</label>
                                                <input type="text" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-rose-400"
                                                    value={ad.desc} onChange={(e) => handleAdChange(idx, 'desc', e.target.value)} placeholder="VD: Giảm ngay 50%..." />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-600 mb-1">Ảnh Banner (Click để tải lên hoặc dán link)</label>
                                                <div className="flex gap-2">
                                                    <input type="text" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-rose-400"
                                                        value={ad.image} onChange={(e) => handleAdChange(idx, 'image', e.target.value)} placeholder="https://..." />
                                                    
                                                    <label className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded font-bold cursor-pointer text-sm whitespace-nowrap flex items-center justify-center transition-colors">
                                                        <span>📸 Tải Ảnh Lên</span>
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;
                                                                
                                                                const formData = new FormData();
                                                                formData.append('image', file);
                                                                
                                                                try {
                                                                    // Loading indicator...
                                                                    handleAdChange(idx, 'image', 'Đang tải ảnh lên hệ thống...');
                                                                    const res = await axiosAuth.post('/settings/upload-banner', formData, {
                                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                                    });
                                                                    handleAdChange(idx, 'image', res.data.imageUrl);
                                                                } catch (err) {
                                                                    handleAdChange(idx, 'image', ad.image); // Revert
                                                                    alert('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message));
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-600 mb-1">CHI TIẾT MỞ RỘNG (Hiển thị khi Click vào Popup)</label>
                                                <textarea rows={3} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-rose-400"
                                                    value={ad.details} onChange={(e) => handleAdChange(idx, 'details', e.target.value)} placeholder="Nhập đầy đủ thông tin quảng cáo, số ĐT liên hệ, chương trình khuyến mãi chéo..." />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <button type="button" onClick={addAd} className="w-full py-2 border-2 border-dashed border-rose-400 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition">+ THÊM QUẢNG CÁO MỚI</button>
                            </div>
                        );
                    })()}
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
