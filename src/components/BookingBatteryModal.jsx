import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getAllBatteryModels } from '../services/battery';
import { getOperationalStations, getStationById } from '../services/station';
import { getUserVehicles } from '../services/vehicle';
import { createScheduledSwap } from '../services/swapTransaction';

const BookingBatteryModal = ({ open, onClose, onBooked }) => {
  const [step, setStep] = useState(1);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [availableBatteries, setAvailableBatteries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Load battery models and user vehicles
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedModel(null);
      setSelectedStation(null);
      setSelectedVehicle(null);
      setAvailableBatteries([]);
      setError('');
      setLoading(true);
      
      Promise.all([
        getAllBatteryModels(1, 50),
        getUserVehicles()
      ])
        .then(([modelsData, vehiclesData]) => {
          setModels(modelsData);
          setVehicles(vehiclesData);
        })
        .catch(() => setError('Không thể tải dữ liệu'))
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Step 2: Load stations when model selected
  useEffect(() => {
    if (step === 2 && selectedModel) {
      setSelectedStation(null); // Reset selected station khi vào step 2
      setLoading(true);
      setError('');
      getOperationalStations(1, 50)
        .then(data => {
          setStations(data);
          // Filter stations that have batteries of selected model type
          // Tạm thời cho phép chọn tất cả trạm, step 3 sẽ check pin thực tế
          const filtered = data.filter(station => {
            return true;
          });
          setFilteredStations(filtered);
        })
        .catch(() => setError('Không thể tải danh sách trạm'))
        .finally(() => setLoading(false));
    }
  }, [step, selectedModel]);

  // Step 3: Load station details when selected
  useEffect(() => {
    if (step === 3 && selectedStation && selectedModel) {
      setLoading(true);
      setError('');
      const stationId = selectedStation.stationId || selectedStation.id;
      
      // Gọi API getStationById để lấy thông tin chi tiết trạm
      getStationById(stationId)
        .then(stationDetail => {
          // Backend sẽ validate pin khi đặt lịch, FE không cần check trước
          // Hiện tại chỉ hiển thị thông báo chung
          setAvailableBatteries([{ available: true }]); // Giả định có pin
        })
        .catch((err) => {
          console.error('Failed to get station details:', err);
          // Vẫn cho phép đặt lịch, nhân viên sẽ xác nhận sau
          setAvailableBatteries([{ available: true }]);
        })
        .finally(() => setLoading(false));
    }
  }, [step, selectedStation, selectedModel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-10 relative border border-gray-200">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">✕</button>
        <h2 className="text-2xl font-bold mb-6 text-center">Đặt lịch đổi/thuê pin</h2>
        {error && <div className="text-red-600 mb-3 text-center">{error}</div>}
        {loading && <div className="text-gray-500 text-center">Đang tải...</div>}
        {/* Step 1: Chọn model pin */}
        {!loading && step === 1 && (
          <div>
            <div className="mb-3 font-semibold">Chọn loại model pin:</div>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              {models.map(model => (
                <button
                  key={model.modelId || model.batteryModelId || model.type}
                  className={`border rounded-lg px-5 py-3 text-left transition-all duration-150 ${selectedModel?.type === model.type ? 'bg-blue-100 border-blue-500' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="font-semibold text-base">{model.type}</div>
                  <div className="text-xs text-gray-500">{model.manufacturer} - {model.chemistry}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-medium">Hủy</button>
              <button
                className="px-5 py-2 rounded-lg bg-[#0028b8] text-white font-medium hover:bg-[#335cff] transition-colors disabled:opacity-50"
                disabled={!selectedModel}
                onClick={() => setStep(2)}
              >Tiếp tục</button>
            </div>
          </div>
        )}
        {/* Step 2: Chọn trạm */}
        {!loading && step === 2 && (
          <div>
            <div className="mb-3 font-semibold">Chọn trạm có model pin <span className="text-blue-700">{selectedModel?.type}</span>:</div>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              {filteredStations.map(station => {
                const stationKey = station.stationId || station.id;
                const selectedKey = selectedStation?.stationId || selectedStation?.id;
                const isSelected = selectedStation && selectedKey === stationKey;
                return (
                  <button
                    key={stationKey}
                    className={`border rounded-lg px-5 py-3 text-left transition-all duration-150 ${isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                    onClick={() => setSelectedStation(station)}
                  >
                    <div className="font-semibold text-base">{station.name}</div>
                    <div className="text-xs text-gray-500">{station.address}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-between gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-medium">Quay lại</button>
              <button
                className="px-5 py-2 rounded-lg bg-[#0028b8] text-white font-medium hover:bg-[#335cff] transition-colors disabled:opacity-50"
                disabled={!selectedStation}
                onClick={() => setStep(3)}
              >Tiếp tục</button>
            </div>
          </div>
        )}
        {/* Step 3: Xác nhận trạm và chọn hình thức */}
        {!loading && step === 3 && (
          <div>
            <div className="mb-3 font-semibold">Xác nhận trạm <span className="text-blue-700">{selectedStation?.name}</span> có pin model <span className="text-blue-700">{selectedModel?.type}</span></div>
            
            {availableBatteries.length > 0 ? (
              <div className="mb-4 text-blue-700">
                <svg className="inline w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Nhân viên trạm sẽ xác nhận pin sẵn sàng sau khi bạn đặt lịch
              </div>
            ) : (
              <div className="mb-4 text-gray-600">Đang kiểm tra tình trạng trạm...</div>
            )}

            <div className="mb-2 font-semibold">Chọn xe của bạn:</div>
            <div className="grid grid-cols-1 gap-3 mb-4 max-h-40 overflow-y-auto">
              {vehicles.length > 0 ? (
                vehicles.map(vehicle => {
                  const vehicleKey = vehicle.vehicleId || vehicle.id;
                  const selectedKey = selectedVehicle?.vehicleId || selectedVehicle?.id;
                  const isSelected = selectedVehicle && selectedKey === vehicleKey;
                  return (
                    <button
                      key={vehicleKey}
                      className={`border rounded-lg px-5 py-3 text-left transition-all duration-150 ${isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <div className="font-semibold text-base">{vehicle.make} {vehicle.model}</div>
                      <div className="text-xs text-gray-500">Biển số: {vehicle.licensePlate} | Pin: {vehicle.batteryType}</div>
                    </button>
                  );
                })
              ) : (
                <div className="text-gray-500 text-center py-3">Bạn chưa đăng ký xe nào. Vui lòng đăng ký xe trước khi đặt lịch.</div>
              )}
            </div>

            {vehicles.length > 0 && (
              <>
                <div className="mb-2 font-semibold">Chọn hình thức:</div>
                <div className="flex gap-4 mb-4">
                  <button 
                    className="px-5 py-2 rounded-lg bg-[#0028b8] text-white font-medium hover:bg-[#335cff] transition-colors disabled:opacity-50" 
                    onClick={() => setStep(4)}
                    disabled={!selectedVehicle}
                  >
                    Đặt lịch
                  </button>
                  <button 
                    className="px-5 py-2 rounded-lg bg-gray-200 font-medium hover:bg-gray-300 transition-colors disabled:opacity-50" 
                    onClick={() => setStep(5)}
                    disabled={!selectedVehicle}
                  >
                    Tới trực tiếp
                  </button>
                </div>
              </>
            )}

            <div className="mt-6 flex justify-between gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-medium">Quay lại</button>
            </div>
          </div>
        )}
        {/* Step 4: Đặt lịch */}
        {!loading && step === 4 && (
          <BookingScheduleStep
            station={selectedStation}
            model={selectedModel}
            vehicle={selectedVehicle}
            onBack={() => setStep(3)}
            onBooked={onBooked}
            onClose={onClose}
          />
        )}
        {/* Step 5: Tới trực tiếp */}
        {!loading && step === 5 && (
          <WalkInStep
            station={selectedStation}
            model={selectedModel}
            vehicle={selectedVehicle}
            onBack={() => setStep(3)}
            onBooked={onBooked}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

// Step 4: Đặt lịch (chọn ngày giờ, gửi API)
const BookingScheduleStep = ({ station, model, vehicle, onBack, onBooked, onClose }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBook = async () => {
    if (!date || !time) {
      setError('Vui lòng chọn ngày và giờ');
      return;
    }

    if (!vehicle) {
      setError('Vui lòng chọn xe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Combine date and time into format backend expects: "yyyy-MM-dd HH:mm:ss"
      const scheduledTime = `${date} ${time}:00`;
      const stationId = station.stationId || station.id;
      const vehicleId = vehicle.vehicleId || vehicle.id;

      const payload = {
        vehicleId,
        stationId,
        scheduledTime,
        notes: `Đặt lịch đổi pin model ${model.type}`
      };

      await createScheduledSwap(payload);
      
      setLoading(false);
      Swal.fire('Thành công', 'Đã đặt lịch đổi/thuê pin! Vui lòng chờ nhân viên xác nhận.', 'success');
      onBooked();
      onClose();
    } catch (err) {
      setLoading(false);
      const errorMsg = err?.response?.data?.message || err?.message || 'Đặt lịch thất bại';
      setError(errorMsg);
      Swal.fire('Lỗi', errorMsg, 'error');
    }
  };

  return (
    <div>
      <div className="mb-3 font-semibold">Chọn ngày giờ đặt lịch tại <span className="text-blue-700">{station?.name}</span></div>
      <div className="mb-3 text-sm text-gray-600">Xe: <span className="font-medium">{vehicle?.make} {vehicle?.model}</span> ({vehicle?.licensePlate})</div>
      <div className="flex gap-3 mb-4">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-lg px-4 py-2 text-base" min={new Date().toISOString().split('T')[0]} />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="border rounded-lg px-4 py-2 text-base" />
      </div>
      {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
      <div className="mt-6 flex justify-between gap-3">
        <button onClick={onBack} className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-medium" disabled={loading}>Quay lại</button>
        <button className="px-5 py-2 rounded-lg bg-[#0028b8] text-white font-medium hover:bg-[#335cff] transition-colors" onClick={handleBook} disabled={loading}>
          {loading ? 'Đang đặt lịch...' : 'Đặt lịch'}
        </button>
      </div>
    </div>
  );
};

// Step 5: Tới trực tiếp (tạo scheduled swap với thời gian hiện tại)
const WalkInStep = ({ station, model, vehicle, onBack, onBooked, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWalkIn = async () => {
    if (!vehicle) {
      setError('Vui lòng chọn xe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Tạo scheduled swap với thời gian hiện tại (trong vòng 5 phút tới)
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5); // Thêm 5 phút để driver kịp tới
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const scheduledTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      const stationId = station.stationId || station.id;
      const vehicleId = vehicle.vehicleId || vehicle.id;

      const payload = {
        vehicleId,
        stationId,
        scheduledTime,
        notes: `Walk-in - Tới trực tiếp trạm để đổi pin model ${model.type}`
      };

      await createScheduledSwap(payload);
      
      setLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        html: `
          <p>Bạn đã đăng ký tới trực tiếp trạm <b>${station.name}</b></p>
          <p class="text-sm text-gray-600 mt-2">Vui lòng tới trạm trong vòng 15 phút và thông báo cho nhân viên.</p>
          <p class="text-sm text-gray-600">Nhân viên sẽ kiểm tra và xác nhận pin cho bạn.</p>
        `,
        confirmButtonText: 'Đồng ý'
      });
      onBooked();
      onClose();
    } catch (err) {
      setLoading(false);
      const errorMsg = err?.response?.data?.message || err?.message || 'Đăng ký thất bại';
      setError(errorMsg);
      
      // Check nếu lỗi do không có pin
      if (errorMsg.includes('pin') || errorMsg.includes('battery') || errorMsg.includes('available')) {
        Swal.fire({
          icon: 'error',
          title: 'Trạm không còn pin!',
          text: `Trạm ${station.name} hiện không có pin model ${model.type} sẵn sàng. Vui lòng chọn trạm khác hoặc đặt lịch trước.`,
          confirmButtonText: 'Đồng ý'
        });
      } else {
        Swal.fire('Lỗi', errorMsg, 'error');
      }
    }
  };

  return (
    <div>
      <div className="mb-3 font-semibold text-center">Xác nhận tới trực tiếp trạm</div>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm mb-2"><span className="font-semibold">Trạm:</span> <span className="text-blue-700">{station?.name}</span></div>
        <div className="text-sm mb-2"><span className="font-semibold">Địa chỉ:</span> {station?.address}</div>
        <div className="text-sm mb-2"><span className="font-semibold">Model pin:</span> <span className="text-blue-700">{model?.type}</span></div>
        <div className="text-sm"><span className="font-semibold">Xe:</span> {vehicle?.make} {vehicle?.model} ({vehicle?.licensePlate})</div>
      </div>
      <div className="mb-4 text-gray-700 text-sm">
        <div className="flex items-start gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Vui lòng tới trạm trong vòng <b>15 phút</b> và thông báo cho nhân viên</span>
        </div>
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Nhân viên sẽ kiểm tra pin sẵn sàng và hỗ trợ đổi/thuê pin cho bạn</span>
        </div>
      </div>
      {error && <div className="text-red-600 mb-3 text-center text-sm">{error}</div>}
      <div className="mt-6 flex justify-between gap-3">
        <button onClick={onBack} className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-medium" disabled={loading}>
          Quay lại
        </button>
        <button 
          className="px-5 py-2 rounded-lg bg-[#00b894] text-white font-medium hover:bg-[#00a07a] transition-colors" 
          onClick={handleWalkIn} 
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận tới trạm'}
        </button>
      </div>
    </div>
  );
};

export default BookingBatteryModal;
