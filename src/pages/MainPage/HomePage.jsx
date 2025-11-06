import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.lastName?.trim() || "";

  // Danh sách mẫu xe có thêm loại pin tương thích
  const demoCars = [
    {
      id: 1,
      name: "VinFast VF e34",
      range: "285 km",
      battery: "42 kWh",
      compatibleBattery: "GenkiCell V-Series (42 kWh)",
      image:
        "https://tse1.mm.bing.net/th/id/OIP.riszdhdMzFup8hCkWcLhxwHaEK?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      id: 2,
      name: "Tesla Model 3",
      range: "491 km",
      battery: "57.5 kWh",
      compatibleBattery: "PowerPack T-57 (57.5 kWh)",
      image:
        "https://tse2.mm.bing.net/th/id/OIP.aS2_N7oIhYYI5R6IiQ2TbAFrCr?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      id: 3,
      name: "Hyundai Kona Electric",
      range: "305 km",
      battery: "39.2 kWh",
      compatibleBattery: "KonaCell Lite 39 (39.2 kWh)",
      image:
        "https://tse3.mm.bing.net/th/id/OIP.KIInOUjtxzsg-rBBV2oIAAHaE8?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      id: 4,
      name: "BYD Atto 3",
      range: "420 km",
      battery: "49.9 kWh",
      compatibleBattery: "BladePower A-50 (49.9 kWh)",
      image:
        "https://tse2.mm.bing.net/th/id/OIP.DyCIUZkszj97arJ_UeGqowHaE3?rs=1&pid=ImgDetMain&o=7&rm=3",
    },
  ];

  // hiệu ứng hiện dần khi scroll
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.2 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => reveals.forEach((el) => observer.unobserve(el));
  }, []);

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
    className="relative z-10 text-center text-white py-28 px-6"
    style={{ backgroundColor: "rgba(0, 40, 184, 0.7)" }} // xanh #0028b8 với độ mờ 70%
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


      {/* Section giới thiệu dịch vụ */}
      <section className="py-20 bg-white text-center reveal">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0d2e50] mb-6">
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
              className="bg-[#f8f9fb] border border-gray-200 shadow-md hover:shadow-xl transition rounded-2xl p-6 w-52"
            >
              <div className="text-5xl mb-3">⚡</div>
              <p className="text-[#0d2e50] font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Cars */}
      <section className="py-16 px-6 bg-[#eef3f8] reveal">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0d2e50] mb-3 uppercase tracking-wide">
            Các mẫu xe hỗ trợ đổi pin
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Danh sách những mẫu xe điện phổ biến có thể sử dụng dịch vụ đổi pin
            của chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {demoCars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-2 duration-300"
            >
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-52 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-[#0a1a2f] mb-2">
                  {car.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Quãng đường: {car.range}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Dung lượng pin: {car.battery}
                </p>
                <p className="text-sm text-[#0d2e50] font-medium mt-2">
                  🔋 Loại pin tương thích:{" "}
                  <span className="font-semibold">
                    {car.compatibleBattery}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d2e50] text-gray-300 text-center py-6 mt-auto">
        <p>© 2025 EV Battery Swapper. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
