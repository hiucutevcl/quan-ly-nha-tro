import React, { useState, useEffect } from 'react';

const adsList = [
  {
    type: 'banner',
    title: '🌐 Lắp đặt Internet FPT Sinh Viên',
    desc: 'Giảm ngay 50% phí hòa mạng. Tặng thêm 2 tháng cước khi đóng trước 6 tháng! Wifi 6 siêu tốc.',
    cta: 'Đăng ký ngay',
    color: 'from-orange-500 to-red-500',
    link: '#'
  },
  {
    type: 'sidebar',
    title: '🚚 Dịch Vụ Chuyển Trọ Trọn Gói Thành Hưng',
    desc: 'Di chuyển nhanh gọn, an toàn. Ưu đãi 20% cho sinh viên các trường đại học.',
    cta: 'Gọi Hotline: 1800.xxxx',
    color: 'from-blue-600 to-indigo-600',
    link: '#'
  },
  {
    type: 'banner',
    title: '🧺 Giặt Sấy Lấy Liền Gần Đây',
    desc: 'Giặt sấy quần áo, chăn mền khử khuẩn. Chỉ từ 15k/kg. Giao nhận tận phòng trọ!',
    cta: 'Xem Bảng Giá',
    color: 'from-teal-400 to-emerald-500',
    link: '#'
  }
];

export default function AdsBanner({ layout = 'banner' }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    // Lấy ngẫu nhiên quảng cáo theo layout
    const filteredAds = adsList.filter(a => a.type === layout || layout === 'any');
    if (filteredAds.length > 0) {
      const randomAd = filteredAds[Math.floor(Math.random() * filteredAds.length)];
      setAd(randomAd);
    }
  }, [layout]);

  if (!ad) return null;

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg p-6 bg-gradient-to-br ${ad.color} text-white my-6 group cursor-pointer transition-transform hover:-translate-y-1`}>
      {/* Nút Tag Quảng Cáo */}
      <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
        Tài trợ
      </div>
      
      {/* Nội dung */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <h3 className="text-xl font-black mb-2">{ad.title}</h3>
          <p className="text-white/90 text-sm leading-relaxed mb-4">
            {ad.desc}
          </p>
        </div>
        
        <a href={ad.link} className="inline-block self-start font-bold text-sm bg-white text-gray-900 px-5 py-2.5 rounded-xl shadow-md hover:bg-gray-50 transition-colors">
          {ad.cta}
        </a>
      </div>

      {/* Trang trí hiệu ứng ánh sáng */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-500" />
    </div>
  );
}
