import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getAllUnconfirmedSwaps, confirmScheduledSwap } from '../../../services/swapTransaction';
import { getBatteriesByStationAndStatus } from '../../../services/battery';
import { getSwapStatusText, getSwapTypeText } from '../../../services/swapTransaction';

export default function SwapConfirmation() {
  const [swaps, setSwaps] = useState([]);
  const [availableBatteries, setAvailableBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [selectedBatteryIds, setSelectedBatteryIds] = useState([]);

  useEffect(() => {
    loadSwaps();
  }, []);

  const loadSwaps = async () => {
    try {
      setLoading(true);
      const data = await getAllUnconfirmedSwaps();
      setSwaps(data);
    } catch (error) {
      console.error('Error loading swaps:', error);
      Swal.fire('Lỗi', 'Không thể tải danh sách đặt lịch', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSwap = async (swap) => {
    try {
      setSelectedSwap(swap);
      setSelectedBatteryIds([]);
      
      // Load available batteries at the station
      const batteries = await getBatteriesByStationAndStatus(swap.stationId, 'FULL', 0);
      setAvailableBatteries(batteries);
    } catch (error) {
      console.error('Error loading batteries:', error);
      Swal.fire('Lỗi', 'Không thể tải danh sách pin', 'error');
    }
  };

  const handleBatteryToggle = (batteryId) => {
    setSelectedBatteryIds(prev => {
      if (prev.includes(batteryId)) {
        return prev.filter(id => id !== batteryId);
      } else {
        return [...prev, batteryId];
      }
    });
  };

  const handleConfirm = async () => {
    if (!selectedSwap) return;

    // Validate battery count matches vehicle requirement
    const requiredCount = selectedSwap.vehicle?.batteryCapacity || 1;
    if (selectedBatteryIds.length !== requiredCount) {
      Swal.fire({
        icon: 'warning',
        title: 'Số lượng pin không đúng',
        text: `Xe này cần ${requiredCount} pin, bạn đã chọn ${selectedBatteryIds.length} pin.`
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Xác nhận đặt lịch',
        html: `
          <div class="text-left">
            <p><strong>Mã giao dịch:</strong> ${selectedSwap.code}</p>
            <p><strong>Khách hàng:</strong> ${selectedSwap.driver?.firstName} ${selectedSwap.driver?.lastName}</p>
            <p><strong>Xe:</strong> ${selectedSwap.vehicle?.make} ${selectedSwap.vehicle?.model}</p>
            <p><strong>Số pin:</strong> ${selectedBatteryIds.length}</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        await confirmScheduledSwap({
          transactionId: selectedSwap.transactionId,
          batteryIds: selectedBatteryIds
        });

        Swal.fire({
          icon: 'success',
          title: 'Xác nhận thành công!',
          text: 'Đã gán pin cho giao dịch. Chờ khách hàng đến.'
        });

        setSelectedSwap(null);
        setSelectedBatteryIds([]);
        loadSwaps();
      }
    } catch (error) {
      console.error('Error confirming swap:', error);
      Swal.fire('Lỗi', error.response?.data?.message || 'Không thể xác nhận', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Xác Nhận Đặt Lịch Thay Pin</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Swap List */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Danh sách chờ xác nhận ({swaps.length})
            </h2>

            {swaps.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Không có đặt lịch nào chờ xác nhận
              </p>
            ) : (
              <div className="space-y-3">
                {swaps.map((swap) => (
                  <div
                    key={swap.transactionId}
                    onClick={() => handleSelectSwap(swap)}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedSwap?.transactionId === swap.transactionId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">#{swap.code}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        swap.status === 'SCHEDULED' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200'
                      }`}>
                        {getSwapStatusText(swap.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Khách:</span>{' '}
                        {swap.driver?.firstName} {swap.driver?.lastName}
                      </p>
                      <p>
                        <span className="font-medium">Xe:</span>{' '}
                        {swap.vehicle?.make} {swap.vehicle?.model} ({swap.vehicle?.licensePlate})
                      </p>
                      <p>
                        <span className="font-medium">Loại pin:</span>{' '}
                        {swap.vehicle?.batteryType?.value || swap.vehicle?.batteryType}
                      </p>
                      <p>
                        <span className="font-medium">Số pin cần:</span>{' '}
                        {swap.vehicle?.batteryCapacity || 1}
                      </p>
                      <p>
                        <span className="font-medium">Thời gian:</span>{' '}
                        {new Date(swap.scheduledTime).toLocaleString('vi-VN')}
                      </p>
                      {swap.notes && (
                        <p className="text-xs italic text-gray-500">
                          Ghi chú: {swap.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Battery Selection */}
        <div>
          {selectedSwap ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Chọn pin cho giao dịch #{selectedSwap.code}
              </h2>

              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm">
                  <strong>Loại pin cần:</strong>{' '}
                  {selectedSwap.vehicle?.batteryType?.value || selectedSwap.vehicle?.batteryType}
                </p>
                <p className="text-sm">
                  <strong>Số lượng:</strong> {selectedSwap.vehicle?.batteryCapacity || 1} pin
                </p>
                <p className="text-sm">
                  <strong>Đã chọn:</strong> {selectedBatteryIds.length} pin
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableBatteries.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Không có pin sẵn sàng
                  </p>
                ) : (
                  availableBatteries
                    .filter(battery => {
                      const batteryType = battery.model?.type?.value || battery.model?.type || battery.batteryType;
                      const vehicleType = selectedSwap.vehicle?.batteryType?.value || selectedSwap.vehicle?.batteryType;
                      return batteryType === vehicleType;
                    })
                    .map((battery) => (
                      <div
                        key={battery.id}
                        onClick={() => handleBatteryToggle(battery.id)}
                        className={`border rounded-lg p-3 cursor-pointer transition ${
                          selectedBatteryIds.includes(battery.id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {battery.serialNumber || `Pin #${battery.id.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              SoH: {battery.stateOfHealth?.percentage || battery.stateOfHealth || 'N/A'}% | 
                              Charge: {battery.currentChargePercentage || 100}%
                            </p>
                          </div>
                          {selectedBatteryIds.includes(battery.id) && (
                            <span className="text-green-600 font-bold text-xl">✓</span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>

              <button
                onClick={handleConfirm}
                disabled={selectedBatteryIds.length !== (selectedSwap.vehicle?.batteryCapacity || 1)}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Xác nhận ({selectedBatteryIds.length}/{selectedSwap.vehicle?.batteryCapacity || 1})
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-12 text-center text-gray-500">
              <p>Chọn một đặt lịch để xem chi tiết và gán pin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
