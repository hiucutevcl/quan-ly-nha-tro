import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MeterHistoryModal from '../components/MeterHistoryModal';
import ContractPDFGenerator from '../components/ContractPDFGenerator';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const amenityOptions = ['Máy lạnh', 'Tủ lạnh', 'Máy giặt', 'Nóng lạnh', 'Thang máy', 'Ban công/Cửa sổ', 'Wifi', 'Giường', 'Tủ quần áo', 'Nhà vệ sinh riêng', 'Bếp riêng', 'Gác lửng'];

    // Danh sách khu nhà / cơ sở từ settings
    const [buildingsList, setBuildingsList] = useState([]);

    // State Thêm phòng
    const [newRoom, setNewRoom] = useState({ room_name: '', price: '', area: '', floor: '', amenities: '', building_name: '', room_address: '' });

    // State Gán hợp đồng
    const [assignData, setAssignData] = useState({ roomId: null, tenant_id: '', start_date: '', end_date: '' });

    // State Sửa phòng
    const [editData, setEditData] = useState({ roomId: null, price: '', area: '', floor: '', amenities: '', building_name: '', room_address: '' });

    // State Ghi chỉ số đồng hồ
    const [meterData, setMeterData] = useState({ roomId: null, current_elec: '', current_water: '' });

    // State xem lịch sử chỉ số
    const [historyRoom, setHistoryRoom] = useState(null);

    // State in hợp đồng
    const [contractRoom, setContractRoom] = useState(null);

    // States loading cho ảnh
    const [uploadingRoomId, setUploadingRoomId] = useState(null);
    const [deletingImage, setDeletingImage] = useState(null);

    // Upload ảnh phòng
    const handleUploadImages = async (roomId, files, currentCount = 0) => {
        if (!files || files.length === 0) return;
        if (files.length + currentCount > 5) {
            alert(`Chỉ được phép có tối đa 5 ảnh! (Phòng này chỉ còn trống ${5 - currentCount} ảnh)`);
            return;
        }

        setUploadingRoomId(roomId);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
        
        try {
            await axios.post(`https://api-quan-ly-nha-tro.onrender.com/api/rooms/upload-image/${roomId}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            fetchData();
        } catch (error) {
            alert('❌ Lỗi upload: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploadingRoomId(null);
        }
    };

    // Xóa ảnh đơn lẻ
    const handleDeleteImage = async (roomId, imageUrl) => {
        if (!window.confirm('Bạn có chắc muốn xóa ảnh này khỏi phòng?')) return;
        setDeletingImage(imageUrl);
        try {
            await axios.delete(`https://api-quan-ly-nha-tro.onrender.com/api/rooms/delete-image/${roomId}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { imageUrl }
            });
            fetchData();
        } catch (error) {
            alert('❌ Lỗi xóa ảnh: ' + (error.response?.data?.message || error.message));
        } finally {
            setDeletingImage(null);
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
        // Fetch danh sách khu nhà từ settings (admin API)
        axios.get('https://api-quan-ly-nha-tro.onrender.com/api/settings/public')
            .then(res => {
                let list = ['Cơ sở Cầu Giấy', 'Cơ sở Ba Đình']; // default
                if (res.data.buildings_list) {
                    try {
                        const parsed = JSON.parse(res.data.buildings_list);
                        if (Array.isArray(parsed) && parsed.length > 0) list = parsed.filter(Boolean);
                    } catch(e) {}
                }
                setBuildingsList(list);
            })
            .catch(() => setBuildingsList(['Cơ sở Cầu Giấy', 'Cơ sở Ba Đình']));
    }, []);

    const handleAddBuilding = async () => {}; // Gỡ bỏ vì đã chuyển sang Settings
    const handleRemoveBuilding = async (idx) => {};

    // 1. Thêm phòng mới
    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://api-quan-ly-nha-tro.onrender.com/api/rooms/add', newRoom, apiHeaders);
            alert('Thêm phòng thành công!');
            setNewRoom({ room_name: '', price: '', area: '', floor: '', amenities: '', building_name: '', room_address: '' });
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

    // 4. Cập nhật phòng (Giá, Tiện ích, Diện tích, Tầng, Khu nhà, Địa chỉ)
    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://api-quan-ly-nha-tro.onrender.com/api/rooms/update/${editData.roomId}`, {
                price: editData.price,
                area: editData.area,
                floor: editData.floor,
                amenities: editData.amenities,
                building_name: editData.building_name,
                room_address: editData.room_address
            }, apiHeaders);
            alert('Cập nhật phòng thành công!');
            setEditData({ roomId: null, price: '', area: '', floor: '', amenities: '', building_name: '', room_address: '' });
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
        <div className="min-h-screen bg-slate-50 p-6">
            <h1 className="text-2xl font-bold text-indigo-700 mb-6 uppercase text-center">Quản Lý Phòng Trọ & Tiện Nghi</h1>



            {/* Khung Thêm Phòng */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto border-t-4 border-indigo-500">
                <h2 className="text-lg font-semibold mb-3">Tạo Phòng Mới</h2>
                <form onSubmit={handleAddRoom} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tên phòng (vd: P.101)</label>
                            <input 
                                type="text" required
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={newRoom.room_name} onChange={e => setNewRoom({...newRoom, room_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Giá thuê/tháng (VNĐ)</label>
                            <input 
                                type="number" required
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Diện tích (m²)</label>
                            <input 
                                type="number" min="1"
                                placeholder="VD: 25"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={newRoom.area} onChange={e => setNewRoom({...newRoom, area: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Số tầng / Vị trí</label>
                            <input 
                                type="text"
                                placeholder="VD: Tầng 2, Góc trái"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Đánh dấu những tiện nghi có trong phòng:</label>
                        <div className="flex flex-wrap gap-3">
                            {amenityOptions.map(item => (
                                <label key={item} className="flex items-center gap-1 cursor-pointer text-sm hover:text-indigo-600 transition">
                                    <input type="checkbox" 
                                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                                        checked={(newRoom.amenities||'').includes(item)}
                                        onChange={() => setNewRoom({ ...newRoom, amenities: toggleAmenity(newRoom.amenities, item) })}
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Chọn Khu Nhà / Cơ sở - luôn hiển thị */}
                    <div className="bg-indigo-50/50 p-3 rounded border border-indigo-200/50">
                        <label className="block text-sm font-bold text-slate-700 mb-2">🏢 Chọn Cơ Sở / Khu Nhà:</label>
                        <div className="flex flex-wrap gap-3">
                            {buildingsList.map(b => (
                                <label key={b} className="flex items-center gap-1.5 cursor-pointer text-sm hover:text-indigo-700 transition">
                                    <input type="radio" name="new_building" className="w-4 h-4 text-indigo-600 cursor-pointer"
                                        checked={newRoom.building_name === b}
                                        onChange={() => setNewRoom({ ...newRoom, building_name: b })} />
                                    <span>{b}</span>
                                </label>
                            ))}
                            <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-400 hover:text-gray-600 transition">
                                <input type="radio" name="new_building" className="w-4 h-4"
                                    checked={newRoom.building_name === ''}
                                    onChange={() => setNewRoom({ ...newRoom, building_name: '' })} />
                                Không xác định
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">📍 Địa chỉ phòng (tùy chọn)</label>
                        <input
                            type="text"
                            placeholder="VD: 25 Xuân Thủy, Cầu Giấy, Hà Nội"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={newRoom.room_address} onChange={e => setNewRoom({...newRoom, room_address: e.target.value})}
                        />
                    </div>
                    
                    <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded hover:bg-indigo-700 transition">Lưu Thông Tin</button>
                </form>
            </div>

            {/* Bảng Danh Sách Phòng */}
            {loading ? <p className="text-center">Đang tải...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {rooms.map(room => (
                        <div key={room.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition">
                            <div className={`p-4 text-white font-bold flex justify-between items-center ${room.status === 'Available' ? 'bg-slate-400' : 'bg-indigo-600'}`}>
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
                                {(() => {
                                    let images = [];
                                    if (room.image_url) {
                                        if (room.image_url.startsWith('[')) {
                                            try { images = JSON.parse(room.image_url); } catch (e) {}
                                        } else {
                                            images = [room.image_url];
                                        }
                                    }

                                    return (
                                        <div className="relative mb-3">
                                            {images.length > 0 && (
                                                <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                                                    {images.map((imgUrl, idx) => (
                                                        <div key={idx} className="relative w-2/3 h-32 flex-shrink-0 snap-center group">
                                                            <img src={imgUrl.startsWith('http') ? imgUrl : `https://api-quan-ly-nha-tro.onrender.com${imgUrl}`}
                                                                alt={`Ảnh phòng ${idx + 1}`}
                                                                className={`w-full h-full object-cover rounded-lg border transition ${deletingImage === imgUrl ? 'opacity-50 grayscale' : ''}`}
                                                                onError={e => e.target.style.display='none'}
                                                            />
                                                            {/* Delete Button */}
                                                            {deletingImage === imgUrl ? (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    title="Xóa ảnh này"
                                                                    onClick={() => handleDeleteImage(room.id, imgUrl)}
                                                                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-600 z-10"
                                                                >
                                                                    ×
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-2 flex items-center gap-2">
                                                {images.length < 5 ? (
                                                    <label className={`flex-1 flex justify-center items-center gap-2 border-2 border-dashed ${uploadingRoomId === room.id ? 'border-gray-300 bg-slate-50' : 'border-indigo-200 hover:border-blue-400 hover:bg-indigo-50 cursor-pointer'} rounded-lg p-2 transition`}>
                                                        {uploadingRoomId === room.id ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                                                                <span className="text-sm text-indigo-500 font-medium">Đang tải ảnh...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-lg">📷</span>
                                                                <span className="text-sm font-medium text-indigo-600">
                                                                    {images.length === 0 ? 'Thêm ảnh cho phòng (Tối đa 5)' : `Thêm ảnh (Còn ${5 - images.length}/5)`}
                                                                </span>
                                                                <input type="file" accept="image/*" multiple className="hidden"
                                                                    onChange={e => handleUploadImages(room.id, e.target.files, images.length)} />
                                                            </>
                                                        )}
                                                    </label>
                                                ) : (
                                                    <div className="flex-1 bg-gray-100 border border-gray-200 text-gray-500 text-sm p-2 rounded-lg text-center">
                                                        ✅ Phòng đã đủ 5 ảnh tối đa
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Chế độ xem hoặc Chế độ Sửa */}
                                {editData.roomId === room.id ? (
                                    <form onSubmit={handleUpdateRoom} className="bg-indigo-50 p-3 rounded border border-indigo-200 mb-3">
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div>
                                                <label className="block text-xs font-bold mb-1">Giá Mới (VNĐ/tháng)</label>
                                                <input type="number" required className="w-full p-1 border rounded text-sm"
                                                    value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-1">Diện tích (m²)</label>
                                                <input type="number" min="1" placeholder="VD: 25" className="w-full p-1 border rounded text-sm"
                                                    value={editData.area} onChange={e => setEditData({...editData, area: e.target.value})} />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold mb-1">Số tầng / Vị trí</label>
                                                <input type="text" placeholder="VD: Tầng 2, Góc trái" className="w-full p-1 border rounded text-sm"
                                                    value={editData.floor} onChange={e => setEditData({...editData, floor: e.target.value})} />
                                            </div>
                                        </div>
                                        
                                        <label className="block text-xs font-bold mb-2">Cập nhật Tiện nghi:</label>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {amenityOptions.map(item => (
                                                <label key={item} className="flex items-center gap-1 cursor-pointer text-xs bg-white p-1 rounded border hover:bg-indigo-50">
                                                    <input type="checkbox" className="w-3 h-3 text-indigo-600"
                                                        checked={(editData.amenities||'').includes(item)}
                                                        onChange={() => setEditData({ ...editData, amenities: toggleAmenity(editData.amenities, item) })}
                                                    />
                                                    <span className="truncate">{item}</span>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Chọn Khu Nhà khi Sửa */}
                                        {buildingsList.length > 0 && (
                                            <div className="mb-3">
                                                <label className="block text-xs font-bold text-indigo-700 mb-1">🏢 Khu Nhà / Cơ Sở:</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {buildingsList.map(b => (
                                                        <label key={b} className="flex items-center gap-1 cursor-pointer text-xs bg-indigo-50/50 px-2 py-1 rounded border border-indigo-200/50 hover:bg-teal-100">
                                                            <input type="radio" name="edit_building" className="w-3 h-3 text-indigo-600"
                                                                checked={editData.building_name === b}
                                                                onChange={() => setEditData({ ...editData, building_name: b })} />
                                                            <span>{b}</span>
                                                        </label>
                                                    ))}
                                                    <label className="flex items-center gap-1 cursor-pointer text-xs bg-slate-50 px-2 py-1 rounded border hover:bg-gray-100">
                                                        <input type="radio" name="edit_building" className="w-3 h-3"
                                                            checked={!editData.building_name}
                                                            onChange={() => setEditData({ ...editData, building_name: '' })} />
                                                        Không xác định
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="block text-xs font-bold mb-1">📍 Địa chỉ phòng</label>
                                            <input type="text" placeholder="VD: 25 Xuân Thủy, Cầu Giấy" className="w-full p-1 border rounded text-sm"
                                                value={editData.room_address || ''} onChange={e => setEditData({...editData, room_address: e.target.value})} />
                                        </div>
                                        
                                        <div className="flex justify-between gap-2 mt-2">
                                            <button type="button" onClick={() => setEditData({roomId: null})} className="w-1/2 bg-gray-300 py-1 rounded text-xs font-bold">Hủy</button>
                                            <button type="submit" className="w-1/2 bg-indigo-600 text-white font-bold py-1 rounded text-xs">Lưu</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                                            <p className="text-gray-600">Giá thuê: <b className="text-red-500">{Number(room.price).toLocaleString()}đ/tháng</b></p>
                                            {room.area && <p className="text-gray-500 text-sm">📐 <b>{room.area} m²</b></p>}
                                            {room.floor && <p className="text-gray-500 text-sm">🏢 <b>{room.floor}</b></p>}
                                            {room.building_name && (
                                                <span className="inline-flex items-center gap-1 bg-teal-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-200/50">🏢 {room.building_name}</span>
                                            )}
                                            {room.room_address && (
                                                <p className="w-full text-gray-500 text-xs">📍 {room.room_address}</p>
                                            )}
                                        </div>
                                        {room.amenities && (
                                            <div className="mb-2 mt-1">
                                                <span className="text-gray-500 text-xs">Phòng bao gồm:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {room.amenities.split(',').map(a => a.trim()).filter(Boolean).map(a => (
                                                        <span key={a} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 font-bold">{a}</span>
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
                                            <div className="bg-slate-50 rounded-lg p-2.5 mt-3 mb-2 border border-gray-200 flex items-center justify-between">
                                                <div className="flex gap-4 text-sm">
                                                    <span>⚡ <b>{room.current_elec ?? 0}</b> <span className="text-xs text-slate-400">kWh</span></span>
                                                    <span>💧 <b>{room.current_water ?? 0}</b> <span className="text-xs text-slate-400">m³</span></span>
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
                                            <div className="bg-indigo-50 p-3 rounded text-sm mb-3 border border-blue-100 mt-3">
                                                <p className="mb-1">👤 Khách: <b>{room.tenant_name}</b></p>
                                                <p className="mb-1">📅 Bắt đầu: <b>{room.start_date ? new Date(room.start_date).toLocaleDateString('vi-VN') : '?'}</b></p>
                                                <p>⏳ Kết thúc: <b className="text-red-600">{room.end_date ? new Date(room.end_date).toLocaleDateString('vi-VN') : '?'}</b></p>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-3 rounded text-sm mb-3 text-gray-500 italic mt-3">
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
                                                onClick={() => setEditData({roomId: room.id, price: room.price, area: room.area || '', floor: room.floor || '', amenities: room.amenities || '', building_name: room.building_name || '', room_address: room.room_address || ''})}
                                                className="text-indigo-500 hover:text-indigo-700 text-sm flex items-center gap-1"
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
