import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getUserVehicles, registerVehicle, updateVehicle } from '../../../services/vehicle';
import { getBatteryModels } from '../../../services/battery';

export default function VehicleManagement() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [batteryModels, setBatteryModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    batteryType: '',
    batteryCapacity: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, modelsData] = await Promise.all([
        getUserVehicles(),
        getBatteryModels(0)
      ]);
      setVehicles(vehiclesData);
      setBatteryModels(modelsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Swal.fire('Lỗi', 'Không thể tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'batteryCapacity' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id || editingVehicle.vehicleId, formData);
        Swal.fire('Thành công', 'Cập nhật xe thành công!', 'success');
      } else {
        await registerVehicle(formData);
        Swal.fire('Thành công', 'Đăng ký xe thành công!', 'success');
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vin: vehicle.vin?.value || vehicle.vin || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      licensePlate: vehicle.licensePlate || '',
      batteryType: vehicle.batteryType?.value || vehicle.batteryType || '',
      batteryCapacity: vehicle.batteryCapacity || 1
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      vin: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      batteryType: '',
      batteryCapacity: 1
    });
    setEditingVehicle(null);
    setShowForm(false);
  };

  const handleBookSwap = (vehicle) => {
    navigate('/driver/book-swap', { state: { vehicle } });
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Xe</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          {showForm ? 'Hủy' : '+ Đăng ký xe mới'}
        </button>
      </div>

      {/* Registration/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingVehicle ? 'Cập nhật xe' : 'Đăng ký xe mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Số VIN *</label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="VIN"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hãng xe *</label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="VD: VinFast, Tesla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="VD: VF8, Model 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Năm sản xuất *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                min="2000"
                max={new Date().getFullYear() + 1}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Biển số *</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="VD: 30A-12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Loại pin *</label>
              <select
                name="batteryType"
                value={formData.batteryType}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Chọn loại pin</option>
                {batteryModels.map((model) => (
                  <option key={model.id} value={model.type?.value || model.type}>
                    {model.type?.value || model.type} ({model.manufacturer})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng pin *</label>
              <input
                type="number"
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleInputChange}
                required
                min="1"
                max="10"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              >
                {editingVehicle ? 'Cập nhật' : 'Đăng ký'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Bạn chưa đăng ký xe nào. Nhấn "Đăng ký xe mới" để bắt đầu.
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.id || vehicle.vehicleId} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">
                {vehicle.make} {vehicle.model}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold">Biển số:</span> {vehicle.licensePlate}</p>
                <p><span className="font-semibold">Năm:</span> {vehicle.year}</p>
                <p><span className="font-semibold">VIN:</span> {vehicle.vin?.value || vehicle.vin}</p>
                <p><span className="font-semibold">Loại pin:</span> {vehicle.batteryType?.value || vehicle.batteryType}</p>
                <p><span className="font-semibold">Số pin:</span> {vehicle.batteryCapacity}</p>
                <p className={`font-semibold ${vehicle.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {vehicle.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleBookSwap(vehicle)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Đặt lịch
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
