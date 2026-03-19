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
    custom_quick_replies: JSON.stringify([
        { title: '🏠 Xem phòng trống', answer: 'Hiện tại nhà trọ đang có phòng trống. Vui lòng liên hệ số ĐT chủ trọ để xem phòng!' },
        { title: '💰 Báo giá thuê', answer: 'Giá thuê phòng từ 2.500.000đ - 3.500.000đ tùy diện tích. (Chưa bao gồm điện nước).' },
        { title: '📍 Xin địa chỉ', answer: 'Bạn có thể xem định vị trên bản đồ hoặc gọi chủ trọ để được chỉ đường nhé!' },
        { title: '📞 Liên hệ chủ trọ', answer: 'Số điện thoại / Zalo quản lý: ...' },
        { title: '🏢 Thông tin các Khu Nhà', answer: 'Khu A (Q10): Điện 3.500đ/kWh, Nước 15.000đ/m³.\nKhu B (Q3): Điện 4.000đ/kWh, Nước 20.000đ/m³.' }
    ]),
    ads_config: JSON.stringify([
      { title: '🌐 Lắp đặt Internet FPT Sinh Viên', desc: 'Giảm ngay 50% phí hòa mạng.', details: 'Chương trình cực HOT dành cho Tân sinh viên! Tặng thêm 2 tháng cước khi đóng trước 6 tháng. Ưu tiên lắp đặt hỏa tốc trong 24h vòng quanh hệ thống nhà trọ. Liên hệ ngay SĐT: 0988.xxx.xxx', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80' },
      { title: '📦 Dịch vụ chuyển trọ Thành Hưng', desc: 'Chỉ từ 299k trọn gói xe tải nhỏ.', details: 'Bạn cần chuyển trọ cuối tháng? Đã có Thành Hưng! Xe tải nhỏ 500kg chạy nội ô. Hỗ trợ bọc lót chống trầy xước tủ lạnh, tivi, đệm. Gọi trước 1 ngày để nhận ngay chiết khấu 100k cho khách quen nhà trọ.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' }
    ]),
    buildings_list: JSON.stringify(['Cơ sở Cầu Giấy', 'Cơ sở Ba Đình'])
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
                            <label className="block text-sm font-bold text-gray-600 mb-1">Địa chỉ chính</label>
                            <input type="text" name="address" className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
                                value={settings.address} onChange={handleChange} placeholder="Số nhà, đường, phường, quận..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Số điện thoại Hotline</label>
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

                {/* Ghi chú */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-gray-300">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Ghi chú / Nội quy nhà trọ</h2>
                    <textarea name="note" rows={8} className="w-full border rounded p-2 focus:ring-2 focus:ring-gray-400"
                        value={settings.note} onChange={handleChange}
                        placeholder="Nhập nội quy, thông báo hiển thị trên cộng đồng..." />
                </div>

                {/* --- QUẢN LÝ NÚT CHATBOT ĐỘNG (CUSTOM QUICK REPLIES) --- */}
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-indigo-500">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">🤖 Quản lý Nút Hỏi Nhanh (Chatbot Quick Replies)</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Khách hàng có thể nhấn các nút Gợi ý bên dưới để Chatbot trả lời ngay lập tức theo kịch bản bạn soạn sẵn, 
                        thích hợp cho các mẫu câu hỏi thường gặp như: Địa chỉ, Báo giá Đa khu nhà, Giá điện nước...
                    </p>
                    
                    {(() => {
                        let qrList = [];
                        try {
                            if (settings.custom_quick_replies) {
                                qrList = JSON.parse(settings.custom_quick_replies);
                                if (!Array.isArray(qrList)) qrList = [];
                            }
                        } catch (e) {
                            qrList = [];
                        }

                        const handleQrChange = (index, field, value) => {
                            const newQrs = [...qrList];
                            newQrs[index][field] = value;
                            setSettings({ ...settings, custom_quick_replies: JSON.stringify(newQrs) });
                        };

                        const addQr = () => {
                            const newQrs = [...qrList, { title: '', answer: '' }];
                            setSettings({ ...settings, custom_quick_replies: JSON.stringify(newQrs) });
                        };

                        const removeQr = (index) => {
                            if (!window.confirm('Bạn có chắc muốn xóa nút hỏi nhanh này?')) return;
                            const newQrs = qrList.filter((_, i) => i !== index);
                            setSettings({ ...settings, custom_quick_replies: JSON.stringify(newQrs) });
                        };

                        return (
                            <div className="space-y-4">
                                {qrList.map((qr, idx) => (
                                    <div key={idx} className="border border-indigo-100 p-4 rounded-xl bg-indigo-50 relative">
                                        <button type="button" onClick={() => removeQr(idx)} 
                                            className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600 font-bold bg-white px-2 py-0.5 rounded shadow-sm text-xs">
                                            Xoá Nhóm
                                        </button>
                                        <h3 className="text-xs font-bold text-indigo-800 mb-3 uppercase tracking-wide">🏷️ Nút bấm Gợi Ý #{idx + 1}</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">Tên Nút Bấm (Hiển thị ngoài bot)</label>
                                                <input type="text" className="w-full border border-indigo-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                                    value={qr.title} onChange={(e) => handleQrChange(idx, 'title', e.target.value)} placeholder="VD: 🏢 Xem Thông tin Đa Khu Nhà" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">Câu Trả Lời Của Bot</label>
                                                <textarea rows={4} className="w-full border border-indigo-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-400"
                                                    value={qr.answer} onChange={(e) => handleQrChange(idx, 'answer', e.target.value)} placeholder="Khu Cầu Giấy : Điện 3.500đ/kWh, Nước..." />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <button type="button" onClick={addQr} 
                                    className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition">
                                    + THÊM NÚT HỎI NHANH MỚI
                                </button>
                            </div>
                        );
                    })()}
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
                                                                    handleAdChange(idx, 'image', 'Đang tải ảnh lên hệ thống...');
                                                                    const res = await axiosAuth.post('/settings/upload-banner', formData, {
                                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                                    });
                                                                    handleAdChange(idx, 'image', res.data.imageUrl);
                                                                } catch (err) {
                                                                    handleAdChange(idx, 'image', ad.image); 
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

                <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-3 rounded-xl shadow-lg transition text-lg mt-6">
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
