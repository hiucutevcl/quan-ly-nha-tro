import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportDashboard = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [debtList, setDebtList] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const apiHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const resRev = await axios.get('http://localhost:5000/api/statistics/revenue', apiHeaders);
                const resDebt = await axios.get('http://localhost:5000/api/statistics/debts', apiHeaders);
                
                // Format lại dữ liệu cho Chart
                const chartData = resRev.data.map(item => ({
                    name: 'T' + item.month_year.split('-')[1] + '/' + item.month_year.split('-')[0].slice(2),
                    Doanh_Thu: Number(item.revenue)
                })).reverse(); // Đảo ngược để xếp từ tháng cũ đến mới

                setRevenueData(chartData);
                setDebtList(resDebt.data);
                setLoading(false);
            } catch (error) {
                alert('Lỗi tải Báo cáo Thống kê: ' + (error.response?.data?.message || error.message));
            }
        };

        fetchReports();
    }, []);

    // Format Tiền tệ
    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    // Tính tổng nợ
    const totalDebt = debtList.reduce((sum, item) => sum + Number(item.total_amount), 0);

    if (loading) return <div className="text-center mt-10 p-5 font-bold">Đang tổng hợp số liệu báo cáo...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-black text-blue-900 mb-6 uppercase text-center tracking-wide">
                BÁO CÁO KINH DOANH & CÔNG NỢ
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                {/* Phần 1: Biểu đồ Doanh Thu */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">📊</span> BIỂU ĐỒ DOANH THU THỰC TẾ
                    </h2>
                    
                    {revenueData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-400 italic">Chưa có dữ liệu doanh thu phát sinh</div>
                    ) : (
                        <div className="h-80 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fill: '#4B5563'}} />
                                    <YAxis tickFormatter={(val) => (val/1000000).toFixed(1) + 'Tr'} tick={{fill: '#4B5563'}} />
                                    <Tooltip 
                                        formatter={(value) => [formatCurrency(value), 'Thực thu']}
                                        cursor={{fill: '#F3F4F6'}}
                                    />
                                    <Legend />
                                    <Bar dataKey="Doanh_Thu" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Phần 2: Danh sách Khách đang Nợ */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-500">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="text-2xl mr-2">⚠️</span> DANH SÁCH CẦN THU HỒI NỢ
                        </h2>
                        <span className="bg-red-100 text-red-800 px-3 py-1 font-black rounded-lg text-lg">
                            Tổng nợ: {formatCurrency(totalDebt)}
                        </span>
                    </div>

                    <div className="overflow-y-auto max-h-[400px] pr-2">
                        {debtList.length === 0 ? (
                            <div className="text-center py-10">
                                <span className="text-4xl block mb-2">🎉</span>
                                <p className="text-green-600 font-bold text-lg">Tuyệt vời! Tất cả các phòng đều đã đóng tiền đầy đủ.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {debtList.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-100 hover:shadow-md transition">
                                        <div>
                                            <p className="font-bold text-red-700 text-lg">{item.room_name} <span className="text-sm text-gray-500 font-normal">({item.month_year})</span></p>
                                            <p className="text-sm text-gray-800 mt-1">👤 Khách: <b className="text-gray-900">{item.tenant_name || 'Không rõ'}</b></p>
                                            <p className="text-sm text-gray-800">📞 SĐT (Username): {item.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-red-600 text-xl">{formatCurrency(item.total_amount)}</p>
                                            <button 
                                                className="mt-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                                                onClick={() => alert(`Tính năng tự động gửi SMS nhắc nợ đến ${item.phone} sẽ ra mắt ở phiên bản sau!`)}
                                            >
                                                🔔 Nhắc nhở
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDashboard;
