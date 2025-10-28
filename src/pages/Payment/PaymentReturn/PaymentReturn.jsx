import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseVNPayReturn } from '../../../services/payment';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    const result = parseVNPayReturn(searchParams);
    setPaymentResult(result);
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  if (!paymentResult) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Đang xử lý...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        {paymentResult.success ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mb-6">
              {paymentResult.message}
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mb-6">
              {paymentResult.message}
            </p>
          </>
        )}

        {paymentResult.amount && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Số tiền</p>
            <p className="text-2xl font-bold text-gray-800">
              {paymentResult.amount.toLocaleString('vi-VN')} VND
            </p>
          </div>
        )}

        {paymentResult.transactionId && (
          <p className="text-sm text-gray-500 mb-6">
            Mã giao dịch: {paymentResult.transactionId}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleGoHome}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
