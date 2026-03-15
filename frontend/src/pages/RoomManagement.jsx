import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MeterHistoryModal from '../components/MeterHistoryModal';
import ContractPDFGenerator from '../components/ContractPDFGenerator';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const amenityOptions = ['Máy lạnh', 'Tủ lạnh', 'Máy giặt', 'Nóng lạnh', 'Thang máy', 'Ban công/Cửa sổ'];

    // State Thêm phòng
    const [newRoom, setNewRoom] = useState({ room_name: '', price: '', amenities: '' });

    // State Gán hợp đồng
    const [assignData, setAssignData] = useState({ roomId: null, tenant_id: '', start_date: '', end_date: '' });

    // State Sửa phòng
    const [editData, setEditData] = useState({ roomId: null, price: '', amenities: '' });

    // State Ghi chỉ số đồng hồ
    const [meterData, setMeterData] = useState({ roomId: null, current_elec: '', current_water: '' });

    // State xem lịch sử chỉ số
    const [historyRoom, setHistoryRoom] = useState(null);

    // State in hợp đồng
    const [contractRoom, setContractRoom] = useState(null);

    // Upload ảnh phòng
    const handleUploadImage = async (roomId, file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axios.post(`https://api-quan-ly-nha-tro.onrender.com/api/rooms/upload-image/${roomId}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert('✅ Upload ảnh thành công!');
            fetchData();
        } catch (error) {
            alert('❌ Lỗi upload: ' + (error.response?.data?.message || error.message));
        }
    };

    const token = localStorage.getItem('token');
    const apiHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        try {
            const resRooms = await axios.get('https://api-quan-ly-nha-tro.onrender.com/api/rooms/all', apiHeaders);
            const resUsers = await axios.get('https://api-quan-ly-nha-tro.onrender.com/api/auth/users', apiHeaders);
            setRooms(resRooms.data);
            setUsers(resUsers.data);
            setLoading(false);
        } catch (error) {
            alert('Lỗi lấy dữ liệu: ' + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 1. Thêm phòng mới
    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://api-quan-ly-nha-tro.onrender.com/api/rooms/add', newRoom, apiHeaders);
            alert('Thêm phòng thành công!');
            setNewRoom({ room_name: '', price: '', amenities: '' });
            fetchData();
        } catch (error) {
            alert('Lỗi thêm phòng: ' + (error.response?.data?.message || error.message));
        }
    };

    // 2. Xóa phòng
    const handleDeleteRoom = async (id) => {
        if (!window.confirm('Chắc chắn muốn xóa phòng này?')) return;
        try {
            await axios.delete(`https://api-quan-ly-nha-tro.onrender.com/api/rooms/delete/${id}`, apiHeaders);
            alert('Đã xóa phòng!');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi khi xóa!');
        }
    };

    // 3. Gán Khách thuê vào phòng
    const handleAssignTenant = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`https://api-quan-ly-nha-tro.onrender.com/api/rooms/assign/${assignData.roomId}`, {
                tenant_id: assignData.tenant_id,
                start_date: assignData.start_date,
                end_date: assignData.end_date
            }, apiHeaders);
            alert('Cập nhật hợp đồng thành công!');
            setAssignData({ roomId: null, tenant_id: '', start_date: '', end_date: '' });
            fetchData();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    // 4. Cập nhật phòng (Giá, Tiện ích)
    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://api-quan-ly-nha-tro.onrender.com/api/rooms/update/${editData.roomId}`, {
                price: editData.price,
                amenities: editData.amenities
            }, apiHeaders);
            alert('Cập nhật phòng thành công!');
            setEditData({ roomId: null, price: '', amenities: '' });
            fetchData();
        } catch (error) {
            alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        }
    };

    // 5. Cập nhật chỉ số đồng hồ
    const handleUpdateMeter = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://api-quan-ly-nha-tro.onrender.com/api/rooms/meter/${meterData.roomId}`, {
                current_elec: meterData.current_elec,
                current_water: meterData.current_water
            }, apiHeaders);
            alert('✅ Đã ghi chỉ số đồng hồ thành công!');
            setMeterData({ roomId: null, current_elec: '', current_water: '' });
            fetchData();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const toggleAmenity = (currentStr, amenity) => {
        let arr = currentStr ? currentStr.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (arr.includes(amenity)) arr = arr.filter(a => a !== amenity);
        else arr.push(amenity);
        return arr.join(', ');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-green-700 mb-6 uppercase text-center">Quản Lý Phòng Trọ & Tiện Nghi</h1>

            {/* Khung Thêm Phòng */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto border-t-4 border-green-500">
                <h2 className="text-lg font-semibold mb-3">Tạo Phòng Mới</h2>
                <form onSubmit={handleAddRoom} className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tên phòng (vd: P.101)</label>
                            <input 
                                type="text" required
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                value={newRoom.room_name} onChange={e => setNewRoom({...newRoom, room_name: e.target.value})}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Giá thuê/tháng (VNĐ)</label>
                            <input 
                                type="number" required
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Đánh dấu những tiện nghi có trong phòng:</label>
                        <div className="flex flex-wrap gap-4">
                            {amenityOptions.map(item => (
                                <label key={item} className="flex items-center gap-1 cursor-pointer text-sm hover:text-green-600 transition">
                                    <input type="checkbox" 
                                        className="w-4 h-4 text-green-600 cursor-pointer"
                                        checked={(newRoom.amenities||'').includes(item)}
                                        onChange={() => setNewRoom({ ...newRoom, amenities: toggleAmenity(newRoom.amenities, item) })}
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition">Lưu Thông Tin</button>
                </form>
            </div>

            {/* Bảng Danh Sách Phòng */}
            {loading ? <p className="text-center">Đang tải...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {rooms.map(room => (
                        <div key={room.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition">
                            <div className={`p-4 text-white font-bold flex justify-between items-center ${room.status === 'Available' ? 'bg-gray-400' : 'bg-blue-600'}`}>
                                <span className="text-xl">{room.room_name}</span>
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    <button onClick={() => setHistoryRoom(room)}
                                        className="text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full transition font-normal">
                                        📈 Lịch sử
                                    </button>
                                    {room.status === 'Occupied' && (
                                        <button onClick={() => setContractRoom(room)}
                                            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full transition font-normal">
                                            📋 Hợp đồng
                                        </button>
                                    )}
                                    <span className="text-sm px-2 py-1 bg-white/20 rounded-full">
                                        {room.status === 'Available' ? 'Trống' : 'Đang thuê'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-4">
                                {/* Ảnh phòng */}
                                {room.image_url ? (
                                    <div className="relative mb-3">
                                        <img src={room.image_url.startsWith('http') ? room.image_url : `https://api-quan-ly-nha-tro.onrender.com${room.image_url}`}
                                            alt="Ảnh phòng"
                                            className="w-full h-32 object-cover rounded-lg border"
                                            onError={e => e.target.style.display='none'}
                                        />
                                        <label className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-black/70 transition">
                                            📷 Đổi ảnh
                                            <input type="file" accept="image/*" className="hidden"
                                                onChange={e => e.target.files[0] && handleUploadImage(room.id, e.target.files[0])} />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="mb-3 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                                        <span className="text-2xl">📷</span>
                                        <span className="text-sm text-gray-400">Click để upload ảnh phòng</span>
                                        <input type="file" accept="image/*" className="hidden"
                                            onChange={e => e.target.files[0] && handleUploadImage(room.id, e.target.files[0])} />
                                    </label>
                                )}

                                {/* Chế độ xem hoặc Chế độ Sửa */}
                                {editData.roomId === room.id ? (
                                    <form onSubmit={handleUpdateRoom} className="bg-blue-50 p-3 rounded border border-blue-200 mb-3">
                                        <label className="block text-xs font-bold mb-1">Giá Mới (VNĐ/tháng)</label>
                                        <input type="number" required className="w-full mb-3 p-1 border rounded"
                                            value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} />
                                        
                                        <label className="block text-xs font-bold mb-2">Cập nhật Tiện nghi:</label>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {amenityOptions.map(item => (
                                                <label key={item} className="flex items-center gap-1 cursor-pointer text-xs bg-white p-1 rounded border hover:bg-blue-50">
                                                    <input type="checkbox" className="w-3 h-3 text-blue-600"
                                                        checked={(editData.amenities||'').includes(item)}
                                                        onChange={() => setEditData({ ...editData, amenities: toggleAmenity(editData.amenities, item) })}
                                                    />
                                                    <span className="truncate">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                        
                                        <div className="flex justify-between gap-2 mt-2">
                                            <button type="button" onClick={() => setEditData({roomId: null})} className="w-1/2 bg-gray-300 py-1 rounded text-xs font-bold">Hủy</button>
                                            <button type="submit" className="w-1/2 bg-blue-600 text-white font-bold py-1 rounded text-xs">Lưu</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <p className="text-gray-600 mb-1">Giá thuê: <b className="text-red-500">{Number(room.price).toLocaleString()}đ/tháng</b></p>
                                        {room.amenities && (
                                            <div className="mb-2 mt-2">
                                                <span className="text-gray-500 text-xs">Phòng bao gồm:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {room.amenities.split(',').map(a => a.trim()).filter(Boolean).map(a => (
                                                        <span key={a} className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200 font-bold">{a}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Chỉ số đồng hồ */}
                                        {meterData.roomId === room.id ? (
                                            <form onSubmit={handleUpdateMeter} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3 mb-2">
                                                <p className="text-xs font-bold text-yellow-800 mb-2">⚡💧 Ghi chỉ số đồng hồ tháng này</p>
                                                <div className="flex gap-2 mb-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-500 block mb-1">⚡ Số điện (kWh)</label>
                                                        <input type="number" required min="0" placeholder="VD: 1250"
                                                            className="w-full border rounded p-1.5 text-sm"
                                                            value={meterData.current_elec}
                                                            onChange={e => setMeterData({...meterData, current_elec: e.target.value})} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-500 block mb-1">💧 Số nước (m³)</label>
                                                        <input type="number" required min="0" placeholder="VD: 85"
                                                            className="w-full border rounded p-1.5 text-sm"
                                                            value={meterData.current_water}
                                                            onChange={e => setMeterData({...meterData, current_water: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => setMeterData({roomId: null})} className="flex-1 bg-gray-200 py-1.5 rounded text-xs font-bold">Hủy</button>
                                                    <button type="submit" className="flex-1 bg-yellow-500 text-white py-1.5 rounded text-xs font-bold">✅ Lưu số</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="bg-gray-50 rounded-lg p-2.5 mt-3 mb-2 border border-gray-200 flex items-center justify-between">
                                                <div className="flex gap-4 text-sm">
                                                    <span>⚡ <b>{room.current_elec ?? 0}</b> <span className="text-xs text-gray-400">kWh</span></span>
                                                    <span>💧 <b>{room.current_water ?? 0}</b> <span className="text-xs text-gray-400">m³</span></span>
                                                </div>
                                                <button
                                                    onClick={() => setMeterData({roomId: room.id, current_elec: room.current_elec ?? '', current_water: room.current_water ?? ''})}
                                                    className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded font-bold hover:bg-yellow-200 transition"
                                                >
                                                    📝 Ghi số
                                                </button>
                                            </div>
                                        )}

                                        {room.status === 'Occupied' ? (
                                            <div className="bg-blue-50 p-3 rounded text-sm mb-3 border border-blue-100 mt-3">
                                                <p className="mb-1">👤 Khách: <b>{room.tenant_name}</b></p>
                                                <p className="mb-1">📅 Bắt đầu: <b>{room.start_date ? new Date(room.start_date).toLocaleDateString('vi-VN') : '?'}</b></p>
                                                <p>⏳ Kết thúc: <b className="text-red-600">{room.end_date ? new Date(room.end_date).toLocaleDateString('vi-VN') : '?'}</b></p>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-3 rounded text-sm mb-3 text-gray-500 italic mt-3">
                                                Đang chờ khách thuê...
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Form Gán khách nếu đang mở State Assign */}
                                {assignData.roomId === room.id ? (
                                    <form onSubmit={handleAssignTenant} className="mt-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                                        <select 
                                            required className="w-full mb-2 p-1 border rounded"
                                            value={assignData.tenant_id} onChange={e => setAssignData({...assignData, tenant_id: e.target.value})}
                                        >
                                            <option value="">-- Chọn khách thuê vào --</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>)}
                                        </select>
                                        <div className="flex gap-2 mb-2">
                                            <div className="w-1/2">
                                                <label className="text-xs text-gray-600 block mb-1">Ngày bắt đầu</label>
                                                <input 
                                                    type="date" required className="w-full p-1 border rounded text-sm"
                                                    value={assignData.start_date} onChange={e => setAssignData({...assignData, start_date: e.target.value})}
                                                />
                                            </div>
                                            <div className="w-1/2">
                                                <label className="text-xs text-gray-600 block mb-1">Ngày kết thúc</label>
                                                <input 
                                                    type="date" required className="w-full p-1 border rounded text-sm"
                                                    value={assignData.end_date} onChange={e => setAssignData({...assignData, end_date: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between gap-2 mt-2">
                                            <button type="button" onClick={() => setAssignData({roomId: null})} className="text-xs bg-gray-300 px-2 py-1 rounded">Hủy</button>
                                            <button type="submit" className="text-xs bg-yellow-500 text-white font-bold px-2 py-1 rounded">Chốt hợp đồng</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex mt-4 pt-4 border-t border-gray-100 justify-between items-center">
                                        {room.status === 'Available' ? (
                                            <button 
                                                onClick={() => setAssignData({roomId: room.id, tenant_id: '', start_date: '', end_date: ''})}
                                                className="text-yellow-600 hover:text-yellow-700 text-sm font-semibold"
                                            >+ Nhận khách mới</button>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm('Xác nhận khách trả phòng này?')){
                                                        setAssignData({roomId: room.id, tenant_id: null, start_date: null, end_date: null});
                                                        setTimeout(() => document.getElementById(`btn-assign-${room.id}`).click(), 100);
                                                    }
                                                }}
                                                className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1"
                                            > 🚪 Trả phòng</button>
                                        )}
                                        
                                        <form id={`form-assign-${room.id}`} onSubmit={handleAssignTenant} className="hidden">
                                            <button type="submit" id={`btn-assign-${room.id}`}>Ẩn</button>
                                        </form>

                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => setEditData({roomId: room.id, price: room.price, amenities: room.amenities || ''})}
                                                className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                                                title="Sửa phòng"
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                                                title="Xóa phòng"
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal lịch sử chỉ số điện nước */}
            {historyRoom && (
                <MeterHistoryModal room={historyRoom} onClose={() => setHistoryRoom(null)} />
            )}

            {/* Modal in hợp đồng */}
            {contractRoom && (
                <ContractPDFGenerator room={contractRoom} onClose={() => setContractRoom(null)} />
            )}
        </div>
    );
};

export default RoomManagement;
