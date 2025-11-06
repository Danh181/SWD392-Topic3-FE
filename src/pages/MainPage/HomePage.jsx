import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);

  const displayName = user?.lastName?.trim() || "";

  // Danh sách mẫu xe (đã thêm loại pin đổi được)
  const demoCars = [
    {
      id: 1,
      name: "VinFast Herio",
      model: "SUV",
      seats: "5 chỗ",
      range: "326 km",
      battery: "40.5 kWh",
      compatibleBattery: "Pin LFP - 40.5 kWh",
      image:
        "https://vinfastauto.com/themes/porto/img/homepage-v2/car/HerioGreen.webp",
    },
    {
      id: 2,
      name: "VinFast VF6",
      model: "Sedan",
      seats: "5 chỗ",
      range: "480 km",
      battery: "59.6 kWh",
      compatibleBattery: "Pin NMC - 59.6 kWh",
      image:
        "https://vinfastauto.com/themes/porto/img/homepage-v2/car/VF6.webp",
    },
    {
      id: 3,
      name: "VinFast VF7",
      model: "MiniCar",
      seats: "4 chỗ",
      range: "496 km",
      battery: "75.3 kWh",
      compatibleBattery: "Pin NMC - 75.3 kWh",
      image:
        "https://vinfastauto.com/themes/porto/img/homepage-v2/car/VF7.webp",
    },
    {
      id: 4,
      name: "VinFast VF8",
      model: "SUV",
      seats: "5 chỗ",
      range: "420 km",
      battery: "82 kWh",
      compatibleBattery: "Pin LFP - 82 kWh",
      image:
        "https://vinfastauto.com/themes/porto/img/homepage-v2/car/VF8.webp",
    },
    {
      id: 5,
      name: "VinFast VF9",
      model: "SUV",
      seats: "5 chỗ",
      range: "423 km",
      battery: "92 kWh",
      compatibleBattery: "Pin NMC - 92 kWh",
      image:
        "https://vinfastauto.com/themes/porto/img/homepage-v2/car/VF9.webp",
    },
  ];

  // Xử lý chuyển xe
  const nextCar = () => {
    setImageLoading(true);
    setTimeout(() => {
      setCurrentCarIndex((prev) => (prev + 1) % demoCars.length);
      setImageLoading(false);
    }, 150);
  };

  const prevCar = () => {
    setImageLoading(true);
    setTimeout(() => {
      setCurrentCarIndex(
        (prev) => (prev - 1 + demoCars.length) % demoCars.length
      );
      setImageLoading(false);
    }, 150);
  };

  const goToCar = (index) => {
    if (index !== currentCarIndex) {
      setImageLoading(true);
      setTimeout(() => {
        setCurrentCarIndex(index);
        setImageLoading(false);
      }, 150);
    }
  };

  const currentCar = demoCars[currentCarIndex];

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden mt-[72px]">
        <div className="absolute inset-0">
          <video
            src="/assets/reviewCar.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-90"
          ></video>
        </div>
        <div
          className="relative z-10 text-center text-white py-28 px-6 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 40, 184, 0.7)" }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-lg">
            {user
              ? `Xin chào, ${displayName} 👋`
              : "EV Battery Swapper – Dịch vụ đổi pin chuyên nghiệp"}
          </h1>
          <p className="text-base md:text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto">
            {user
              ? "Chào mừng bạn quay lại hệ thống EV Battery Swapper."
              : "Giải pháp nhanh chóng – an toàn – tiện lợi cho xe điện của bạn."}
          </p>
        </div>
      </section>

      {/* Dịch vụ năng lượng */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0028b8] mb-6">
          Dịch vụ năng lượng thông minh
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
          Cung cấp giải pháp sạc và đổi pin nhanh, an toàn, linh hoạt – đáp ứng
          mọi nhu cầu di chuyển xanh của bạn.
        </p>
        <div className="flex flex-wrap justify-center gap-10">
          {[
            "Power Swap Station",
            "Power Charger",
            "Destination Charging",
            "One Click for Power",
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#f8f9fb] border border-[#0028b8]/30 shadow-md hover:shadow-xl hover:border-[#0028b8] transition rounded-2xl p-6 w-52"
            >
              <div className="text-5xl mb-3">⚡</div>
              <p className="text-[#0028b8] font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carousel xe điện */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto text-center px-6 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0028b8] mb-3 uppercase tracking-wide">
            Các mẫu xe hỗ trợ đổi pin
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Danh sách những mẫu xe điện phổ biến có thể sử dụng dịch vụ đổi pin của chúng tôi.
          </p>
        </div>

        {/* Khung trình chiếu xe */}
        <div className="w-full">
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Nút điều hướng */}
            <button
              onClick={prevCar}
              className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-[#0028b8]/10 rounded-full p-4 shadow-lg transition"
              aria-label="Xe trước"
            >
              <svg
                className="w-8 h-8 text-[#0028b8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextCar}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-[#0028b8]/10 rounded-full p-4 shadow-lg transition"
              aria-label="Xe tiếp theo"
            >
              <svg
                className="w-8 h-8 text-[#0028b8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Hình xe */}
            <div className="h-[560px] flex items-center justify-center">
              <img
                src={currentCar.image}
                alt={currentCar.name}
                className={`object-contain max-h-[520px] transition-all duration-500 ${
                  imageLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
                onLoad={() => setImageLoading(false)}
              />
            </div>
          </div>

          {/* Thông tin xe */}
          <div className="bg-white py-8">
            <div className="max-w-6xl mx-auto px-6 text-center">
              <h3 className="text-4xl font-bold text-[#0028b8] mb-4">
                {currentCar.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div>
                  <p className="text-gray-500 mb-1">Dung lượng pin</p>
                  <p className="font-bold text-2xl text-gray-800">
                    {currentCar.battery}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Quãng đường đi được</p>
                  <p className="font-bold text-2xl text-gray-800">
                    {currentCar.range}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Loại pin đổi được</p>
                  <p className="font-bold text-2xl text-[#0028b8]">
                    {currentCar.compatibleBattery}
                  </p>
                </div>
              </div>
            </div>

            {/* Chỉ báo vòng tròn */}
            <div className="flex justify-center space-x-3 mt-8">
              {demoCars.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToCar(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentCarIndex
                      ? "bg-[#0028b8] scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Chuyển đến xe ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0028b8] text-gray-200 text-center py-6 mt-auto">
        <p>© 2025 EV Battery Swapper. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
