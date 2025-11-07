import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import Header from '../../../components/Header';
import { getBatteryModels } from '../../../services/battery';
import { getOperationalStations } from '../../../services/station';
import { getUserVehicles } from '../../../services/vehicle';
import { createScheduledSwap } from '../../../services/swapTransaction';

const BookSwapPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load all data when page loads
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError('');
        const [vehiclesData, stationsData, modelsData] = await Promise.all([
          getUserVehicles(),
          getOperationalStations(),
          getBatteryModels()
        ]);
        setVehicles(vehiclesData || []);
        setStations(stationsData || []);
        setModels(modelsData || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, []);

  // Calculate progress based on filled fields
  const getProgress = () => {
    let progress = 0;
    if (selectedVehicle) progress = 1;
    if (selectedStation) progress = 2;
    if (selectedModel) progress = 3;
    if (scheduledTime) progress = 4;
    return progress;
  };

  const currentStep = getProgress();

  const handleScheduleBooking = async () => {
    // Validation
    if (!selectedVehicle) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn xe',
        confirmButtonColor: '#0ea5e9'
      });
      return;
    }
    if (!selectedStation) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn trạm đổi pin',
        confirmButtonColor: '#0ea5e9'
      });
      return;
    }
    if (!selectedModel) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn model pin',
        confirmButtonColor: '#0ea5e9'
      });
      return;
    }
    if (!scheduledTime) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn thời gian đổi pin',
        confirmButtonColor: '#0ea5e9'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Convert datetime-local format (yyyy-MM-ddTHH:mm) to backend format (yyyy-MM-dd HH:mm:ss)
      const formattedTime = scheduledTime.replace('T', ' ') + ':00';
      
      const payload = {
        vehicleId: selectedVehicle.vehicleId || selectedVehicle.id,
        stationId: selectedStation.stationId || selectedStation.id,
        batteryModelType: selectedModel.type,
        scheduledTime: formattedTime,
        notes: `Đặt lịch đổi pin model ${selectedModel.type}`
      };
      
      await createScheduledSwap(payload);
      
      // 🎉 Confetti celebration!
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      Swal.fire({
        icon: 'success',
        title: '🎉 Thành công!',
        html: '<div style="font-size: 16px;">Đã đặt lịch đổi pin!<br/>Vui lòng chờ nhân viên xác nhận.<br/>Mời bạn vào <strong>Trang cá nhân → Đơn hàng của tôi</strong> để xem chi tiết</div>',
        confirmButtonColor: '#0ea5e9',
        confirmButtonText: 'Xem đơn hàng',
        showCancelButton: true,
        cancelButtonText: 'Đóng',
        customClass: {
          popup: 'animate-fadeIn'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/driver/my-orders');
        }
      });
      
    } catch (err) {
      console.error('Failed to create swap transaction:', err);
      Swal.fire('Lỗi', err?.response?.data?.message || 'Không thể đặt lịch', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header />
      
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Đặt lịch đổi pin</h1>
          <p className="text-gray-600 mt-2">Chọn xe, trạm và model pin để đặt lịch đổi pin</p>
        </div>

        {/* Progress Bar - Outside Form */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="relative">
              {/* Steps */}
              <div className="flex justify-between items-start relative">
                {[
                  { num: 1, label: 'Chọn xe', icon: '🚗' },
                  { num: 2, label: 'Chọn trạm', icon: '🔋' },
                  { num: 3, label: 'Chọn model', icon: '⚡' },
                  { num: 4, label: 'Đặt lịch', icon: '📅' }
                ].map((item, index) => (
                  <div key={item.num} className="flex flex-col items-center relative z-10" style={{ width: '25%' }}>
                    {/* Circle */}
                    <div className={`
                      relative flex items-center justify-center w-14 h-14 rounded-full border-4 font-bold text-lg
                      transition-all duration-300 transform bg-white
                      ${currentStep >= item.num 
                        ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white border-blue-600 scale-110 shadow-lg' 
                        : 'bg-white text-gray-400 border-gray-300 hover:border-gray-400'
                      }
                      ${currentStep === item.num ? 'ring-4 ring-blue-200 animate-pulseGlow' : ''}
                    `}>
                      {currentStep > item.num ? (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-2xl">{item.icon}</span>
                      )}
                    </div>
                    
                    {/* Connecting Line to Next Step */}
                    {index < 3 && (
                      <div className="absolute top-7 left-1/2 w-full h-1 -z-10">
                        <div className="h-full bg-gray-200 w-full"></div>
                        <div 
                          className={`h-full absolute top-0 left-0 bg-gradient-to-r from-blue-400 via-blue-600 to-purple-600 animate-gradient transition-all duration-500 ease-in-out ${
                            currentStep > item.num ? 'w-full' : 'w-0'
                          }`}
                        ></div>
                      </div>
                    )}
                    
                    {/* Label */}
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-semibold transition-colors ${
                        currentStep >= item.num ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 transition-all duration-300 animate-fadeIn">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <div className="absolute top-0 left-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-30"></div>
              </div>
              <p className="text-gray-600 text-lg font-medium animate-pulse">Đang tải dữ liệu...</p>
              <div className="mt-2 flex gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Section 1: Chọn xe */}
              <div className="animate-flyIn" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🚗</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Chọn xe của bạn</h3>
                    <p className="text-sm text-gray-600">Chọn phương tiện cần đổi pin</p>
                  </div>
                </div>
                
                {vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((vehicle, index) => {
                      const vehicleKey = vehicle.vehicleId || vehicle.id;
                      const selectedKey = selectedVehicle?.vehicleId || selectedVehicle?.id;
                      const isSelected = selectedVehicle && selectedKey === vehicleKey;
                      return (
                        <button
                          key={vehicleKey}
                          className={`relative border-2 rounded-xl p-4 text-left transition-all duration-200 animate-flyIn ${
                            isSelected 
                              ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 shadow-lg ring-2 ring-blue-300' 
                              : 'bg-white hover:bg-gray-50 border-gray-200 hover:shadow-lg hover:-translate-y-1'
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          
                          <div className="font-bold text-lg text-gray-900 mb-2">
                            {vehicle.make} {vehicle.model}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center text-gray-600">
                              <span className="mr-2">🔖</span>
                              <span>{vehicle.licensePlate}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="mr-2">⚡</span>
                              <span className="font-medium text-blue-700">{vehicle.batteryType}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-5xl mb-3">🚗</div>
                    <p className="text-gray-600 mb-4">Bạn chưa đăng ký xe nào</p>
                    <button
                      onClick={() => navigate('/profile/vehicles')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      📝 Đăng ký xe ngay
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-200"></div>

              {/* Section 2: Chọn trạm */}
              <div className="animate-flyIn" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🔋</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Chọn trạm đổi pin</h3>
                    <p className="text-sm text-gray-600">
                      {selectedVehicle ? (
                        <>Xe: <span className="font-semibold text-blue-700">{selectedVehicle.make} {selectedVehicle.model}</span></>
                      ) : (
                        <span className="text-gray-400">Vui lòng chọn xe trước</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stations.map((station, index) => {
                    const stationKey = station.stationId || station.id;
                    const selectedKey = selectedStation?.stationId || selectedStation?.id;
                    const isSelected = selectedStation && selectedKey === stationKey;
                    const isDisabled = !selectedVehicle;
                    
                    let cardStyle;
                    if (isDisabled) {
                      cardStyle = 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed';
                    } else if (isSelected) {
                      cardStyle = 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 shadow-lg ring-2 ring-blue-300';
                    } else {
                      cardStyle = 'bg-white hover:bg-gray-50 border-gray-200 hover:shadow-lg hover:-translate-y-1';
                    }
                    
                    return (
                      <button
                        key={stationKey}
                        disabled={isDisabled}
                        className={`relative border-2 rounded-xl p-4 text-left transition-all duration-200 animate-flyIn ${cardStyle}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => !isDisabled && setSelectedStation(station)}
                      >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          
                          <div className="font-bold text-base text-gray-900 mb-2">
                            {station.name}
                          </div>
                          <div className="flex items-start text-sm text-gray-600">
                            <span className="mr-2">📍</span>
                            <span className="flex-1 line-clamp-2">{station.address}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-200"></div>

              {/* Section 3: Chọn model pin */}
              <div className="animate-flyIn" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">⚡</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Chọn model pin</h3>
                    <p className="text-sm text-gray-600">
                      {selectedVehicle ? (
                        <>Loại pin cần: <span className="font-semibold text-blue-700">{selectedVehicle?.batteryType}</span></>
                      ) : (
                        <span className="text-gray-400">Vui lòng chọn xe trước</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.map((model, index) => {
                    const modelKey = model.modelId || model.batteryModelId || model.type;
                    const isCompatible = selectedVehicle && model.type === selectedVehicle?.batteryType;
                    const isSelected = selectedModel?.type === model.type;
                    const isDisabled = !selectedVehicle || !selectedStation;
                    
                    let cardStyle = 'bg-white hover:bg-gray-50 border-gray-200 hover:shadow-lg hover:-translate-y-1';
                    if (isDisabled) {
                      cardStyle = 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed';
                    } else if (!isCompatible) {
                      cardStyle = 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed';
                    } else if (isSelected) {
                      cardStyle = 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 shadow-lg ring-2 ring-blue-300';
                    }
                    
                    return (
                      <button
                        key={modelKey}
                        disabled={isDisabled || !isCompatible}
                        className={`relative border-2 rounded-xl p-4 text-left transition-all duration-200 animate-flyIn ${cardStyle}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => {
                            if (isCompatible && !isDisabled) {
                              setSelectedModel(model);
                            } else if (!isDisabled) {
                              Swal.fire({
                                icon: 'error',
                                title: 'Không tương thích',
                                text: `Model pin "${model.type}" không tương thích với xe của bạn!`,
                                confirmButtonColor: '#0ea5e9'
                              });
                            }
                          }}
                        >
                          {isSelected && isCompatible && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-bold text-base text-gray-900">{model.type}</div>
                            {isCompatible ? (
                              <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                ✓ Tương thích
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                                ✗ Không tương thích
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="mr-2">🏭</span>
                              <span className="text-xs">{model.manufacturer}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">🔬</span>
                              <span className="text-xs">{model.chemistry}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-200"></div>

              {/* Section 4: Chọn thời gian */}
              <div className="animate-flyIn" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">📅</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Chọn thời gian đổi pin</h3>
                    <p className="text-sm text-gray-600">Chọn ngày và giờ bạn muốn đổi pin</p>
                  </div>
                </div>
                
                <div className={`rounded-xl p-6 border-2 transition-all ${
                  selectedModel 
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}>
                  <label htmlFor="scheduledTime" className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Thời gian đổi pin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledTime"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={!selectedModel}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {selectedModel ? 'Vui lòng chọn thời gian trong tương lai' : 'Vui lòng chọn xe, trạm và model pin trước'}
                  </p>

                  {/* Summary */}
                  {scheduledTime && selectedVehicle && selectedStation && selectedModel && (
                    <div className="mt-6 p-4 bg-white rounded-lg border-2 border-green-200 animate-fadeIn">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Tóm tắt đặt lịch
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Xe:</span>
                          <span className="font-semibold text-gray-900">{selectedVehicle.make} {selectedVehicle.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trạm:</span>
                          <span className="font-semibold text-gray-900">{selectedStation.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Model pin:</span>
                          <span className="font-semibold text-gray-900">{selectedModel.type}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Chi phí dự kiến:</span>
                          <span className="font-bold text-green-600 text-lg">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(100000)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
                <button 
                  onClick={() => navigate(-1)} 
                  className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Hủy
                </button>
                <button
                  onClick={handleScheduleBooking}
                  disabled={!selectedVehicle || !selectedStation || !selectedModel || !scheduledTime || loading}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Xác nhận đặt lịch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookSwapPage;
