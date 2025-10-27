/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-nested-ternary */
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getBatteryStatesByStation, getBatteryStateById } from '../../../services/battery';
import { getOperationalStations } from '../../../services/station';
import { getAccessToken } from '../../../services/auth';
import { EventSourcePolyfill } from 'event-source-polyfill';
import Header from '../../../components/Header';

const BatteryMonitoring = () => {
  const navigate = useNavigate();
  const [batteryStates, setBatteryStates] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  // Load all stations on mount (no staff /me dependency)
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const stationsData = await getOperationalStations();
        setStations(stationsData);

        // Default to first station (staff có thể xem tất cả trạm)
        if (!selectedStationId && stationsData.length > 0) {
          setSelectedStationId(stationsData[0].id);
        }
      } catch (e) {
        console.error('Failed to load stations:', e);
        setError('Không thể tải danh sách trạm');
      } finally {
        setLoading(false);
      }
    };
    
    loadStations();
  }, []);

  // Load battery states and connect to stream when station changes
  useEffect(() => {
    if (!selectedStationId) return;

    // Clear previous station data to tránh lẫn dữ liệu giữa các trạm
    setBatteryStates([]);

    loadBatteryStates(selectedStationId);
    connectToStream(selectedStationId);

    // Cleanup on unmount or station change
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setConnected(false);
      }
    };
  }, [selectedStationId]);

  const loadBatteryStates = async (stationId) => {
    try {
      const states = await getBatteryStatesByStation(stationId);
      setBatteryStates(states);
    } catch (e) {
      console.error('Failed to load battery states:', e);
      setError(e?.response?.data?.message || e?.message || 'Không thể tải trạng thái pin');
    }
  };

  const connectToStream = (stationId) => {
    if (!stationId) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const token = getAccessToken();
      if (!token) {
        console.error('No token found');
        setError('Vui lòng đăng nhập lại');
        // Optional: redirect to login
        // navigate('/login');
        return;
      }

      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const url = `${baseURL}/api/battery-monitoring/stream/${stationId}`;

      console.log('Connecting to SSE with Authorization header:', `${url}?token=TOKEN_HIDDEN`);

      // Use polyfill to send Authorization header (native EventSource does not support headers)
      const eventSource = new EventSourcePolyfill(url, {
        headers: { Authorization: `Bearer ${token}` },
        heartbeatTimeout: 60000,
        withCredentials: false,
      });

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setConnected(true);
        setError('');
      };

      eventSource.addEventListener('connected', (event) => {
        console.log('Connected to battery monitoring:', event.data);
      });

      eventSource.addEventListener('battery-update', (event) => {
        try {
          const batteryState = JSON.parse(event.data);
          console.log('Battery update received:', batteryState);

          // Chỉ hiển thị pin thuộc trạm đang chọn.
          // Nếu pin chuyển sang trạm khác, loại khỏi danh sách hiện tại.
          setBatteryStates(prev => {
            const index = prev.findIndex(b => b.batteryId === batteryState.batteryId);
            const sameStation = String(batteryState.currentStationId) === String(stationId);

            if (index >= 0) {
              if (!sameStation) {
                // Remove if moved to another station
                const updated = [...prev];
                updated.splice(index, 1);
                return updated;
              }
              // Update in-place
              const updated = [...prev];
              updated[index] = batteryState;
              return updated;
            }

            // Not in list: add only if it belongs to current station
            return sameStation ? [...prev, batteryState] : prev;
          });
        } catch (e) {
          console.error('Failed to parse battery update:', e);
        }
      });

      eventSource.addEventListener('alert', (event) => {
        try {
          const alert = JSON.parse(event.data);
          console.log('Alert received:', alert);
          
          // Show toast notification
          const alertColor = alert.level === 'CRITICAL' ? 'error' : alert.level === 'WARNING' ? 'warning' : 'info';
          Swal.fire({
            icon: alertColor,
            title: alert.level,
            text: alert.message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
          });
        } catch (e) {
          console.error('Failed to parse alert:', e);
        }
      });

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setConnected(false);
        eventSource.close();
      };

      eventSourceRef.current = eventSource;
    } catch (e) {
      console.error('Failed to connect to SSE:', e);
      setError('Không thể kết nối realtime. Vui lòng làm mới trang.');
    }
  };

  // Old effects removed after refactor to selectedStationId

  const handleViewBatteryDetail = async (batteryState) => {
    try {
      // Fetch fresh state
      const freshState = await getBatteryStateById(batteryState.batteryId);
      
      Swal.fire({
        title: `Chi tiết pin: ${freshState.serialNumber}`,
        width: '800px',
        html: `
          <div class="space-y-4 text-left">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Số serial</label>
                <p class="text-gray-900 font-mono">${freshState.serialNumber}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Loại pin</label>
                <p class="text-gray-900">${freshState.batteryType}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <p class="text-gray-900">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                    freshState.status === 'FULL' ? 'bg-green-100 text-green-800' :
                    freshState.status === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
                    freshState.status === 'CHARGING' ? 'bg-yellow-100 text-yellow-800' :
                    freshState.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                    freshState.status === 'FAULTY' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }">
                    ${freshState.status}
                  </span>
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mức sạc</label>
                <p class="text-gray-900 font-semibold text-xl">${freshState.chargeLevel}%</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nhiệt độ</label>
                <p class="text-gray-900 font-semibold ${freshState.temperature > 50 ? 'text-red-600' : ''}">${freshState.temperature} °C</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Điện áp</label>
                <p class="text-gray-900 font-semibold">${freshState.voltage} V</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dòng điện</label>
                <p class="text-gray-900 font-semibold">${freshState.current} A</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Công suất</label>
                <p class="text-gray-900 font-semibold">${freshState.powerKwh} kWh</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sức khỏe pin (SoH)</label>
                <p class="text-gray-900 font-semibold ${freshState.stateOfHealth < 60 ? 'text-orange-600' : ''}">${freshState.stateOfHealth}%</p>
              </div>
            </div>

            ${freshState.status === 'CHARGING' && freshState.estimatedMinutesToFull ? `
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Thời gian sạc đầy dự kiến</label>
                <p class="text-gray-900 font-semibold">${freshState.estimatedMinutesToFull} phút</p>
              </div>
            ` : ''}

            ${freshState.abnormal ? `
              <div class="bg-red-50 border border-red-200 rounded p-3">
                <label class="block text-sm font-medium text-red-700 mb-1">⚠️ Cảnh báo</label>
                <p class="text-red-900 font-semibold">${freshState.alertLevel}: ${freshState.abnormalReason}</p>
              </div>
            ` : ''}
          </div>
        `,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#0028b8'
      });
    } catch (e) {
      console.error('Failed to get battery detail:', e);
      Swal.fire('Lỗi', 'Không thể tải chi tiết pin', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'FULL': return 'bg-green-100 text-green-800';
      case 'IN_USE': return 'bg-blue-100 text-blue-800';
      case 'CHARGING': return 'bg-yellow-100 text-yellow-800';
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-800';
      case 'FAULTY': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (alertLevel) => {
    switch (alertLevel) {
      case 'CRITICAL': return '🔴';
      case 'WARNING': return '⚠️';
      default: return '✅';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00b894] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Header />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Quay lại"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Giám sát pin realtime</h1>
              <p className="text-sm text-gray-500">
                {connected && <span className="text-green-600">● Đang kết nối</span>}
                {!connected && <span className="text-red-600">● Mất kết nối</span>}
              </p>
            </div>
          </div>
          <button
            onClick={() => selectedStationId && loadBatteryStates(selectedStationId)}
            className="px-4 py-2 bg-[#0028b8] text-white rounded-md hover:bg-[#001a8b] transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Station Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label htmlFor="station-select" className="block text-sm font-medium text-gray-700 mb-2">
            Chọn trạm để giám sát
          </label>
          <select
            id="station-select"
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0028b8]"
          >
            <option value="">-- Chọn trạm --</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name} - {station.address}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {/* Battery States Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">
            Pin đang giám sát ({batteryStates.length})
          </h3>

          {batteryStates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <p>Chưa có pin nào được giám sát</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batteryStates.map((state) => (
                <div 
                  key={state.batteryId} 
                  className={`border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                    state.abnormal ? 'border-red-300 bg-red-50' : 'hover:border-blue-300'
                  }`}
                  onClick={() => handleViewBatteryDetail(state)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{state.serialNumber}</h4>
                      <p className="text-sm text-gray-600">{state.batteryType}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusBadgeClass(state.status)}`}>
                        {state.status}
                      </span>
                      <span className="text-lg">{getAlertIcon(state.alertLevel)}</span>
                    </div>
                  </div>

                  {/* Charge Level Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Mức sạc</span>
                      <span className="font-semibold">{state.chargeLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          state.chargeLevel > 80 ? 'bg-green-500' :
                          state.chargeLevel > 50 ? 'bg-yellow-500' :
                          state.chargeLevel > 20 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${state.chargeLevel}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nhiệt độ:</span>
                      <span className={`font-medium ${state.temperature > 50 ? 'text-red-600' : ''}`}>
                        {state.temperature} °C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Điện áp:</span>
                      <span className="font-medium">{state.voltage} V</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Công suất:</span>
                      <span className="font-medium">{state.powerKwh} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SoH:</span>
                      <span className={`font-medium ${state.stateOfHealth < 60 ? 'text-orange-600' : ''}`}>
                        {state.stateOfHealth}%
                      </span>
                    </div>
                  </div>

                  {state.abnormal && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-xs text-red-700 font-medium">
                        ⚠️ {state.abnormalReason}
                      </p>
                    </div>
                  )}

                  {state.status === 'CHARGING' && state.estimatedMinutesToFull > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-600">
                        ⏱️ Đầy trong ~{state.estimatedMinutesToFull} phút
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatteryMonitoring;
