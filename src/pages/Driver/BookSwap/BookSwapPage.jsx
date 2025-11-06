import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../../components/Header';
import { getBatteryModels } from '../../../services/battery';
import { getOperationalStations } from '../../../services/station';
import { getUserVehicles } from '../../../services/vehicle';
import { createScheduledSwap } from '../../../services/swapTransaction';

const BookSwapPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Load vehicles when page loads
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        setError('');
        const vehiclesData = await getUserVehicles();
        setVehicles(vehiclesData || []);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
        setError('Không thể tải danh sách xe');
      } finally {
        setLoading(false);
      }
    };
    
    loadVehicles();
  }, []);

  // Step 2: Load stations when vehicle is selected
  useEffect(() => {
    if (step === 2 && selectedVehicle) {
      const loadStations = async () => {
        try {
          setLoading(true);
          setError('');
          const stationsData = await getOperationalStations();
          setFilteredStations(stationsData || []);
        } catch (err) {
          console.error('Failed to load stations:', err);
          setError('Không thể tải danh sách trạm');
        } finally {
          setLoading(false);
        }
      };
      
      loadStations();
    }
  }, [step, selectedVehicle]);

  // Step 3: Load models when station is selected
  useEffect(() => {
    if (step === 3 && selectedStation) {
      const loadModels = async () => {
        try {
          setLoading(true);
          setError('');
          const modelsData = await getBatteryModels();
          setModels(modelsData || []);
        } catch (err) {
          console.error('Failed to load battery models:', err);
          setError('Không thể tải danh sách model pin');
        } finally {
          setLoading(false);
        }
      };
      
      loadModels();
    }
  }, [step, selectedStation]);

  const handleScheduleBooking = async (scheduledTime) => {
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
      Swal.fire('Thành công', 'Đã đặt lịch đổi pin! Vui lòng chờ nhân viên xác nhận. Mời bạn vào trang cá nhân -> đơn hàng của tôi để xem chi tiết', 'success');
      navigate('/driver/my-orders');
    } catch (err) {
      console.error('Failed to create swap transaction:', err);
      Swal.fire('Lỗi', err?.response?.data?.message || 'Không thể đặt lịch', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-7 left-0 right-0 h-1 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-in-out"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
              </div>
              
              {/* Steps */}
              <div className="flex justify-between items-start">
                {[
                  { num: 1, label: 'Chọn xe', icon: '🚗' },
                  { num: 2, label: 'Chọn trạm', icon: '🔋' },
                  { num: 3, label: 'Chọn model', icon: '⚡' },
                  { num: 4, label: 'Đặt lịch', icon: '📅' }
                ].map((item) => (
                  <div key={item.num} className="flex flex-col items-center" style={{ width: '25%' }}>
                    {/* Circle */}
                    <div className={`
                      relative flex items-center justify-center w-14 h-14 rounded-full border-4 font-bold text-lg
                      transition-all duration-300 transform
                      ${step >= item.num 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-600 scale-110 shadow-lg' 
                        : 'bg-white text-gray-400 border-gray-300 hover:border-gray-400'
                      }
                      ${step === item.num ? 'ring-4 ring-blue-200 animate-pulse' : ''}
                    `}>
                      {step > item.num ? (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-2xl">{item.icon}</span>
                      )}
                    </div>
                    
                    {/* Label */}
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-semibold transition-colors ${
                        step >= item.num ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {item.label}
                      </div>
                      {step === item.num && (
                        <div className="mt-1 text-xs text-blue-600 font-medium">
                          ← Bước hiện tại
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 transition-all duration-300">{/* Form content will continue here */}

          {/* Content Area */}
          <div className="min-h-[400px]">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
              </div>
            )}
          
          {/* Step 1: Chọn xe */}
          {!loading && step === 1 && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn xe của bạn</h2>
                <p className="text-gray-600">Vui lòng chọn phương tiện cần đổi pin</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {vehicles.length > 0 ? (
                  vehicles.map(vehicle => {
                    const vehicleKey = vehicle.vehicleId || vehicle.id;
                    const selectedKey = selectedVehicle?.vehicleId || selectedVehicle?.id;
                    const isSelected = selectedVehicle && selectedKey === vehicleKey;
                    return (
                      <button
                        key={vehicleKey}
                        className={`group relative border-2 rounded-xl p-5 text-left transition-all duration-200 transform hover:scale-105 hover:shadow-xl ${
                          isSelected 
                            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 shadow-lg' 
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">🚗</div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-gray-900 mb-1">
                              {vehicle.make} {vehicle.model}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center text-gray-600">
                                <span className="font-medium mr-2">🔖</span>
                                <span>{vehicle.licensePlate}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <span className="font-medium mr-2">⚡</span>
                                <span className="font-medium text-blue-700">{vehicle.batteryType}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">🚗</div>
                    <p className="text-gray-600 text-lg mb-6">Bạn chưa đăng ký xe nào.</p>
                    <button
                      onClick={() => navigate('/profile/vehicles')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      📝 Đăng ký xe ngay
                    </button>
                  </div>
                )}
              </div>
              
              {vehicles.length > 0 && (
                <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-between items-center">
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
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
                    disabled={!selectedVehicle}
                    onClick={() => setStep(2)}
                  >
                    Tiếp tục
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Chọn trạm */}
          {!loading && step === 2 && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn trạm đổi pin</h2>
                <p className="text-gray-600">
                  Xe: <span className="font-semibold text-blue-700">{selectedVehicle?.make} {selectedVehicle?.model}</span>{' '}
                  <span className="mx-2">•</span>{' '}
                  Biển số: <span className="font-semibold">{selectedVehicle?.licensePlate}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStations.map(station => {
                  const stationKey = station.stationId || station.id;
                  const selectedKey = selectedStation?.stationId || selectedStation?.id;
                  const isSelected = selectedStation && selectedKey === stationKey;
                  return (
                    <button
                      key={stationKey}
                      className={`group relative border-2 rounded-xl p-5 text-left transition-all duration-200 transform hover:scale-105 hover:shadow-xl ${
                        isSelected 
                          ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 shadow-lg' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setSelectedStation(station)}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">🔋</div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-900 mb-1">
                            {station.name}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-start">
                              <span className="mr-2">📍</span>
                              <span className="flex-1">{station.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-between items-center">
                <button 
                  onClick={() => setStep(1)} 
                  className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
                </button>
                <button
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
                  disabled={!selectedStation}
                  onClick={() => setStep(3)}
                >
                  Tiếp tục
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Chọn model pin */}
          {!loading && step === 3 && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn loại model pin</h2>
                <p className="text-gray-600">
                  Xe: <span className="font-semibold text-blue-700">{selectedVehicle?.make} {selectedVehicle?.model}</span>{' '}
                  <span className="mx-2">•</span>{' '}
                  Loại pin cần: <span className="font-semibold text-blue-700">{selectedVehicle?.batteryType}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {models.map(model => {
                  const modelKey = model.modelId || model.batteryModelId || model.type;
                  const isCompatible = model.type === selectedVehicle?.batteryType;
                  const isSelected = selectedModel?.type === model.type;
                  
                  let cardStyle = 'bg-white hover:bg-gray-50 border-gray-200 hover:scale-105 hover:shadow-xl';
                  if (!isCompatible) {
                    cardStyle = 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed';
                  } else if (isSelected) {
                    cardStyle = 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 shadow-lg transform scale-105';
                  }
                  
                  return (
                    <button
                      key={modelKey}
                      className={`group relative border-2 rounded-xl p-5 text-left transition-all duration-200 ${cardStyle}`}
                      onClick={() => {
                        if (isCompatible) {
                          setSelectedModel(model);
                        } else {
                          Swal.fire({
                            icon: 'error',
                            title: 'Không tương thích',
                            text: `Model pin "${model.type}" không tương thích với loại pin "${selectedVehicle?.batteryType}" của xe ${selectedVehicle?.make} ${selectedVehicle?.model}!`,
                            confirmButtonColor: '#0028b8'
                          });
                        }
                      }}
                      disabled={!isCompatible}
                    >
                      {isSelected && isCompatible && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{isCompatible ? '⚡' : '🚫'}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-bold text-lg text-gray-900">
                              {model.type}
                            </div>
                            {isCompatible ? (
                              <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                ✓ Tương thích
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                                ✗ Không tương thích
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="mr-2">🏭</span>
                              <span>{model.manufacturer}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">🔬</span>
                              <span>{model.chemistry}</span>
                            </div>
                            {model.compatibleVehicles && model.compatibleVehicles.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-xs font-medium text-gray-700 mb-1">Xe tương thích:</div>
                                <div className="text-xs text-gray-600">{model.compatibleVehicles.join(', ')}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-between items-center">
                <button 
                  onClick={() => setStep(2)} 
                  className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
                </button>
                <button
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
                  disabled={!selectedModel}
                  onClick={() => setStep(4)}
                >
                  Tiếp tục
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Đặt lịch */}
          {!loading && step === 4 && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận đặt lịch</h2>
                <p className="text-gray-600">Kiểm tra lại thông tin trước khi xác nhận</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Thông tin đặt lịch
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🚗</div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">Phương tiện</div>
                        <div className="font-bold text-gray-900">{selectedVehicle?.make} {selectedVehicle?.model}</div>
                        <div className="text-sm text-gray-600">Biển số: {selectedVehicle?.licensePlate}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🔋</div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">Trạm đổi pin</div>
                        <div className="font-bold text-gray-900">{selectedStation?.name}</div>
                        <div className="text-sm text-gray-600">{selectedStation?.address}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⚡</div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">Model pin</div>
                        <div className="font-bold text-gray-900">{selectedModel?.type}</div>
                        <div className="text-sm text-gray-600">{selectedModel?.manufacturer} - {selectedModel?.chemistry}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold text-lg">Tổng chi phí dự kiến:</span>
                      <span className="text-green-600 font-bold text-2xl">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(100000)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      * Chi phí cuối cùng sẽ được xác nhận bởi nhân viên trạm
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
                <label htmlFor="scheduledTime" className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Chọn thời gian đổi pin <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="scheduledTime"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Vui lòng chọn thời gian trong tương lai
                </p>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-between items-center">
                <button 
                  onClick={() => setStep(3)} 
                  className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
                </button>
                <button
                  onClick={() => {
                    const scheduledTime = document.getElementById('scheduledTime').value;
                    if (!scheduledTime) {
                      Swal.fire({
                        icon: 'warning',
                        title: 'Thiếu thông tin',
                        text: 'Vui lòng chọn thời gian đổi pin',
                        confirmButtonColor: '#0028b8'
                      });
                      return;
                    }
                    handleScheduleBooking(scheduledTime);
                  }}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-lg"
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
    </div>
  );
};

export default BookSwapPage;
