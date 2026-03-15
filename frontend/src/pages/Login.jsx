import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            const response = await axios.post('https://api-quan-ly-nha-tro.onrender.com/api/auth/login', { username, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            localStorage.setItem('user', JSON.stringify({ full_name: decoded.full_name || decoded.username, role: decoded.role }));
            if (decoded.role === 'Admin') navigate('/admin-dashboard');
            else navigate('/my-invoices');
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
            <div className="w-full max-w-md px-4">
                {/* Logo & Tiêu đề */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-3">🏠</div>
                    <h1 className="text-3xl font-black text-white tracking-wide">QUẢN LÝ NHÀ TRỌ</h1>
                    <p className="text-blue-300 mt-1 text-sm">Hệ thống quản lý phòng trọ thông minh</p>
                </div>

                {/* Form đăng nhập */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-6 text-center">Đăng nhập vào hệ thống</h2>

                    {errorMsg && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-5 flex items-start gap-2">
                            <span className="text-lg">⚠️</span>
                            <span className="text-sm font-medium">{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1.5">
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-blue-500 transition text-gray-800"
                                placeholder="Nhập tên đăng nhập hoặc số điện thoại..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1.5">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-blue-500 transition text-gray-800 pr-12"
                                    placeholder="Nhập mật khẩu..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-xl text-white font-bold text-lg flex justify-center items-center gap-2 transition
                                ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                        >
                            {isLoading ? (
                                <><span className="animate-spin inline-block">⭮</span> Đang xử lý...</>
                            ) : (
                                '🔐 ĐĂNG NHẬP'
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Login;
