import React, { useState, useEffect } from 'react';
import axios from 'axios';

const defaultAdsList = [
  {
    title: '🌐 Lắp đặt Internet FPT Sinh Viên',
    desc: 'Giảm ngay 50% phí hòa mạng. Tặng thêm 2 tháng cước khi đóng trước 6 tháng! Wifi 6 siêu tốc.',
    details: 'Chương trình cực HOT dành cho Tân sinh viên!\n\nTặng thêm 2 tháng cước khi đóng trước 6 tháng.\nƯu tiên lắp đặt hỏa tốc trong 24h vòng quanh hệ thống nhà trọ.\n\nLiên hệ ngay Zalo/SĐT: 0988.xxx.xxx',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
  }
];

export default function AdsBanner() {
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    // Gọi API để lấy cấu hình Ads từ Admin Settings
    axios.get('https://api-quan-ly-nha-tro.onrender.com/api/settings/public')
      .then(res => {
        let adsArray = [];
        if (res.data && res.data.ads_config) {
            try {
                adsArray = JSON.parse(res.data.ads_config);
            } catch (e) { console.error("Parse ads_config lỗi", e); }
        }
        
        if (!Array.isArray(adsArray) || adsArray.length === 0) {
            adsArray = defaultAdsList;
        }

        // Lấy tất cả quảng cáo để hiển thị
        setAds(adsArray);
      })
      .catch(err => {
        console.error("Lấy quảng cáo bị lỗi:", err);
        setAds(defaultAdsList);
      });
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className="space-y-6 lg:space-y-8 my-6">
        {ads.map((ad, idx) => (
            <div 
                key={idx}
                onClick={() => setSelectedAd(ad)}
                className="relative overflow-hidden rounded-2xl shadow-lg p-6 bg-gradient-to-br from-rose-500 to-orange-500 text-white group cursor-pointer transition-transform hover:-translate-y-1"
            >
              {/* Hình nền mờ phía sau nếu có ảnh */}
              {ad.image && (
                 <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                    <img src={ad.image} alt="ads bg" className="w-full h-full object-cover" />
                 </div>
              )}

              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider z-20">
                Tài trợ
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xl font-black mb-2 drop-shadow-md">{ad.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed mb-4 drop-shadow">
                    {ad.desc}
                  </p>
                </div>
                
                <button className="inline-block self-start font-bold text-sm bg-white text-rose-600 px-5 py-2.5 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                  Xem Chi Tiết &rarr;
                </button>
              </div>
            </div>
        ))}

        {/* Modal Chi tiết Quảng Cáo */}
        {selectedAd && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedAd(null)}>
                <div 
                    className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Image */}
                    {selectedAd.image ? (
                        <div className="w-full h-48 relative bg-gray-100">
                            <img src={selectedAd.image} alt={selectedAd.title} className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 bg-rose-500 text-white px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider shadow">
                                Tài trợ
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-12 bg-rose-500 relative">
                            <div className="absolute top-3 right-3 bg-rose-700 text-white px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider shadow">
                                Tài trợ
                            </div>
                        </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6">
                        <h2 className="text-2xl font-black text-gray-800 mb-3 leading-tight">{selectedAd.title}</h2>
                        
                        {selectedAd.desc && (
                            <div className="bg-rose-50 text-rose-700 p-3 rounded-lg text-sm font-medium mb-5 border border-rose-100">
                                🔊 {selectedAd.desc}
                            </div>
                        )}
                        
                        <div className="text-gray-700 text-sm leading-relaxed mb-8 whitespace-pre-wrap border-l-4 border-gray-200 pl-4">
                            {selectedAd.details || 'Đang cập nhật thông tin chi tiết quảng cáo...'}
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedAd(null)}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
