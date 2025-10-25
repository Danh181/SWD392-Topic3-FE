import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  let displayName = null;
  if (user) {
    const given = user.firstName || user.username || user.email || '';
    const family = user.lastName ? ` ${user.lastName}` : '';
    displayName = (given + family).trim() || null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Header />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0028b8] mb-2">
              Chào mừng, {displayName || 'Nhân viên trạm'} 👋
            </h1>
            <p className="text-gray-600">
              Bảng điều khiển dành cho nhân viên trạm sạc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Lịch làm việc */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Lịch làm việc</h3>
              </div>
              <p className="text-gray-600 mb-4">Xem và quản lý ca trực của bạn</p>
              <button 
                onClick={() => navigate('/staff/schedule')}
                className="w-full bg-[#0028b8] text-white py-2 px-4 rounded-lg hover:bg-[#001a8b] transition-colors"
              >
                Xem lịch
              </button>
            </div>

            {/* Quản lý pin */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Quản lý pin</h3>
              </div>
              <p className="text-gray-600 mb-4">Theo dõi trạng thái pin trong trạm</p>
              <button 
                onClick={() => navigate('/staff/batteries')}
                className="w-full bg-[#0028b8] text-white py-2 px-4 rounded-lg hover:bg-[#001a8b] transition-colors"
              >
                Quản lý pin
              </button>
            </div>

            {/* Lịch sử giao dịch */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Lịch sử giao dịch</h3>
              </div>
              <p className="text-gray-600 mb-4">Xem lịch sử đổi pin của khách hàng</p>
              <button 
                onClick={() => navigate('/staff/transactions')}
                className="w-full bg-[#0028b8] text-white py-2 px-4 rounded-lg hover:bg-[#001a8b] transition-colors"
              >
                Xem lịch sử
              </button>
            </div>

            {/* Báo cáo */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Báo cáo</h3>
              </div>
              <p className="text-gray-600 mb-4">Xem báo cáo hoạt động trạm</p>
              <button 
                onClick={() => navigate('/staff/reports')}
                className="w-full bg-[#0028b8] text-white py-2 px-4 rounded-lg hover:bg-[#001a8b] transition-colors"
              >
                Xem báo cáo
              </button>
            </div>

            {/* Quản lý nhân viên */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Quản lý nhân viên</h3>
              </div>
              <p className="text-gray-600 mb-4">Xem và quản lý nhân viên trạm</p>
              <button 
                onClick={() => navigate('/staff/manage-staff')}
                className="w-full bg-[#0028b8] text-white py-2 px-4 rounded-lg hover:bg-[#001a8b] transition-colors"
              >
                Quản lý nhân viên
              </button>
            </div>

            {/* Hỗ trợ khách hàng */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Hỗ trợ khách hàng</h3>
              </div>
              <p className="text-gray-600 mb-4">Hỗ trợ khách hàng tại trạm</p>
              <button 
                onClick={() => navigate('/staff/support')}
                className="w-full bg-[#0028b8] text-white py-2 px-4 rounded-lg hover:bg-[#001a8b] transition-colors"
              >
                Hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
