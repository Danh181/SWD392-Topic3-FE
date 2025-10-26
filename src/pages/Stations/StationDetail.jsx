import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStationById } from '../../services/station';
import { getStationStaff } from '../../services/stationStaff';

const StationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadStationDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load station details and staff in parallel
      const [stationData, staffData] = await Promise.all([
        getStationById(id),
        getStationStaff(id).catch(() => []) // If no staff, return empty array
      ]);
      
      setStation(stationData);
      setStaff(staffData);
    } catch (e) {
      console.error('Failed to load station details:', e);
      setError(e?.response?.data?.message || e?.message || 'Không thể tải thông tin trạm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadStationDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00b894] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!station) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Quay lại"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">Chi tiết trạm</h1>
          <p className="text-sm text-gray-500">Thông tin chi tiết và nhân viên của trạm</p>
        </div>
      </div>

      {/* Station Information Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {station.imageUrl && (
          <div className="relative h-64">
            <img 
              src={station.imageUrl} 
              alt={station.name}
              className="w-full h-full object-cover"
            />
            <span className={`absolute top-4 right-4 px-3 py-1 text-sm font-semibold rounded-full ${
              station.status === 'OPERATIONAL' 
                ? 'bg-green-100 text-green-700' 
                : station.status === 'MAINTENANCE' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {station.status}
            </span>
          </div>
        )}
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{station.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                <p className="text-gray-900">{station.address}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                <p className="text-gray-900">{station.description || 'Không có mô tả'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Giờ mở cửa</label>
                  <p className="text-gray-900">{station.openingTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Giờ đóng cửa</label>
                  <p className="text-gray-900">{station.closingTime}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng dung lượng</label>
                  <p className="text-gray-900 text-lg font-semibold">{station.totalCapacity} pin</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dung lượng hiện tại</label>
                  <p className="text-gray-900 text-lg font-semibold">{station.currentCapacity} pin</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng vị trí đổi</label>
                  <p className="text-gray-900 text-lg font-semibold">{station.totalSwapBays}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vị trí trống</label>
                  <p className="text-gray-900 text-lg font-semibold">{station.idleSwapBays}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                <p className="text-gray-900">{station.contactPhone || 'Chưa có'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email liên hệ</label>
                <p className="text-gray-900">{station.contactEmail || 'Chưa có'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">
          Nhân viên trạm ({staff.length})
        </h3>
        
        {staff.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Trạm này chưa có nhân viên
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((s) => (
              <div key={s.staffId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {s.firstName} {s.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">{s.staffEmail}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                    s.status === 'FULL_TIME' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {s.status === 'FULL_TIME' ? 'Toàn thời gian' : 'Bán thời gian'}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày bắt đầu:</span>
                    <span>{new Date(s.attachedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lương:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(s.salary)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StationDetail;
