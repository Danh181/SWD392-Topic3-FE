import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { logout as apiLogout, default as API } from '../services/auth';

const Header = () => {
  const navigate = useNavigate();
  const { logout: contextLogout } = useAuth();

  const handleLogout = async () => {
    const res = await Swal.fire({
      title: 'Đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
    });
    if (!res.isConfirmed) return;

    // Immediately clear client auth state and remove Authorization header
    try {
      contextLogout();
    } catch (e) {
      console.warn('contextLogout failed, clearing localStorage', e);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    try { delete API.defaults.headers.common.Authorization; } catch (e) { console.warn('failed to delete default auth header', e); }

    // Fire-and-forget backend logout (server may need a token; this is best-effort)
    (async () => {
      try { await apiLogout(); } catch (e) { console.warn('apiLogout failed', e); }
    })();

    await Swal.fire({ icon: 'success', title: 'Đã đăng xuất', showConfirmButton: false, timer: 900 });
    navigate('/login');
  };

  return (
    <header className="w-full bg-white shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-[#00b894]">EV Battery Swapper</h1>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} aria-label="Profile" className="p-2 rounded-full bg-white shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#00b894]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A10.97 10.97 0 0112 15c2.21 0 4.26.7 5.879 1.904M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button onClick={handleLogout} className="bg-[#00b894] text-white px-3 py-1 rounded-md">Đăng xuất</button>
      </div>
    </header>
  );
};

export default Header;
