import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  LayoutDashboard,
  Users,
  Battery,
  FileBarChart,
  LogOut,
  Menu,
} from "lucide-react"; // icon đẹp (npm install lucide-react)
import { useAuth } from '../../context/AuthContext';
import { logout as apiLogout, default as API } from '../../services/auth';

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { logout: contextLogout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      
      <aside
        className={`bg-[#00b894] text-white p-4 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-xl font-bold transition-all ${
              isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
            }`}
          >
            EV Swapper
          </h2>
          <button onClick={toggleSidebar} className="text-white">
            <Menu />
          </button>
        </div>

        <nav>
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => Swal.fire({ icon: 'info', title: 'Chức năng đang phát triển', text: 'Dashboard sẽ có sớm!' })}
                className="flex items-center gap-3 p-2 rounded hover:bg-[#009e7d] w-full text-left"
              >
                <LayoutDashboard /> {isSidebarOpen && "Dashboard"}
              </button>
            </li>
            <li>
              <button
                onClick={() => Swal.fire({ icon: 'info', title: 'Chức năng đang phát triển', text: 'Quản lý Users sẽ có sớm!' })}
                className="flex items-center gap-3 p-2 rounded hover:bg-[#009e7d] w-full text-left"
              >
                <Users /> {isSidebarOpen && "Quản lý Users"}
              </button>
            </li>
            <li>
              <button
                onClick={() => Swal.fire({ icon: 'info', title: 'Chức năng đang phát triển', text: 'Quản lý trạm sẽ có sớm!' })}
                className="flex items-center gap-3 p-2 rounded hover:bg-[#009e7d] w-full text-left"
              >
                <Battery /> {isSidebarOpen && "Trạm sạc/đổi pin"}
              </button>
            </li>
            <li>
              <button
                onClick={() => Swal.fire({ icon: 'info', title: 'Chức năng đang phát triển', text: 'Báo cáo sẽ có sớm!' })}
                className="flex items-center gap-3 p-2 rounded hover:bg-[#009e7d] w-full text-left"
              >
                <FileBarChart /> {isSidebarOpen && "Báo cáo"}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/mainpage/HomePage')}
                className="flex items-center gap-3 p-2 rounded hover:bg-[#009e7d] w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isSidebarOpen && "Về trang chủ"}
              </button>
            </li>
            <li>
              <button
                onClick={async () => {
                  
                  const result = await Swal.fire({
                    title: 'Đăng xuất',
                    text: 'Bạn có chắc chắn muốn đăng xuất không?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Đăng xuất',
                    cancelButtonText: 'Hủy',
                  });
                  if (!result.isConfirmed) return;

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

                  // Fire-and-forget backend logout
                  (async () => {
                    try { await apiLogout(); } catch (e) { console.warn('apiLogout failed', e); }
                  })();

                  await Swal.fire({ icon: 'success', title: 'Đã đăng xuất' , showConfirmButton: false, timer: 1000 });
                  navigate('/mainpage/HomePage');
                }}
                className="flex items-center gap-3 p-2 rounded hover:bg-red-500 w-full"
              >
                <LogOut /> {isSidebarOpen && "Đăng xuất"}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">
          Trang Quản Trị EV Battery Swapper 🚀
        </h1>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Tổng số User</h3>
            <p className="text-3xl font-bold text-[#00b894]">1,245</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Trạm hoạt động</h3>
            <p className="text-3xl font-bold text-[#00b894]">32</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Giao dịch hôm nay</h3>
            <p className="text-3xl font-bold text-[#00b894]">412</p>
          </div>
        </div>

        
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Danh sách trạm gần đây</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3">Tên trạm</th>
                <th className="p-3">Địa chỉ</th>
                <th className="p-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3">Trạm EV01</td>
                <td className="p-3">Hà Nội</td>
                <td className="p-3 text-green-600 font-semibold">Hoạt động</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">Trạm EV02</td>
                <td className="p-3">TP.HCM</td>
                <td className="p-3 text-yellow-600 font-semibold">Bảo trì</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">Trạm EV03</td>
                <td className="p-3">Đà Nẵng</td>
                <td className="p-3 text-green-600 font-semibold">Hoạt động</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Admin;
