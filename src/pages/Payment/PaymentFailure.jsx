import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Get payment data from navigation state
    const data = location.state;
    
    // If no data, show demo/placeholder instead of redirecting
    if (!data) {
      // Set demo data for testing - allows direct URL access
      setPaymentData({
        success: false,
        message: 'Thanh toán thất bại',
        transactionId: sessionStorage.getItem('pendingPaymentTransaction') || 'N/A',
        responseCode: '99',
        isDemo: true
      });
      return;
    }

    setPaymentData(data);
  }, [location, navigate]);

  const handleRetry = () => {
    // Clear failed payment data
    sessionStorage.removeItem('paymentResult');
    // Go back to orders to retry payment
    navigate('/driver/my-orders');
  };

  const handleBackToOrders = () => {
    sessionStorage.removeItem('paymentResult');
    sessionStorage.removeItem('pendingPaymentTransaction');
    sessionStorage.removeItem('pendingPaymentOrderCode');
    navigate('/driver/my-orders');
  };

  if (!paymentData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Failure Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Failure Title */}
        <h1 className="text-3xl font-bold text-red-600 mb-3">
          Thanh toán thất bại
        </h1>
        
        <p className="text-gray-600 mb-6">
          {paymentData.message || 'Giao dịch không thành công. Vui lòng thử lại.'}
        </p>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <div className="space-y-2 text-sm">
            {paymentData.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-mono text-gray-900 text-xs">
                  {paymentData.transactionId.substring(0, 8)}...
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="text-red-600 font-semibold">Thất bại</span>
            </div>
            
            {paymentData.responseCode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Mã lỗi:</span>
                <span className="font-mono text-red-600">{paymentData.responseCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Details */}
        {paymentData.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-800">
              ⚠️ {paymentData.error}
            </p>
          </div>
        )}

        {/* Help Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-800">
            💡 <strong>Lưu ý:</strong> Nếu tiền đã bị trừ nhưng giao dịch thất bại, vui lòng liên hệ với chúng tôi để được hỗ trợ.
          </p>
        </div>

        {/* Common Reasons */}
        <div className="text-left mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Nguyên nhân thường gặp:</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Số dư tài khoản không đủ</li>
            <li>Thẻ chưa đăng ký Internet Banking</li>
            <li>Nhập sai mã OTP hoặc hủy giao dịch</li>
            <li>Vượt quá hạn mức giao dịch</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full px-6 py-3 bg-[#0028b8] text-white rounded-lg hover:bg-[#001a8b] transition-colors font-medium"
          >
            Thử lại thanh toán
          </button>
          
          <button
            onClick={handleBackToOrders}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Quay lại đơn hàng
          </button>
          
          <button
            onClick={() => navigate('/mainpage')}
            className="w-full px-6 py-3 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
