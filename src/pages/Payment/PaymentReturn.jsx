import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseVNPayReturn } from '../../services/payment';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const result = parseVNPayReturn(searchParams);
    
    // Get saved transaction info from sessionStorage
    const transactionId = sessionStorage.getItem('pendingPaymentTransaction');
    const orderCode = sessionStorage.getItem('pendingPaymentOrderCode');
    
    if (transactionId) result.savedTransactionId = transactionId;
    if (orderCode) result.savedOrderCode = orderCode;
    
    console.log('📦 Payment Return Result:', result);
    
    // Save to sessionStorage for success/failure pages
    sessionStorage.setItem('paymentResult', JSON.stringify(result));
    
    // Navigate to appropriate page based on success/failure
    if (result.success) {
      navigate('/payment/success', { state: result, replace: true });
    } else {
      navigate('/payment/failure', { state: result, replace: true });
    }
  }, [searchParams, navigate]);

  // Show loading while processing
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-xl text-gray-700">Đang xử lý kết quả thanh toán...</div>
      </div>
    </div>
  );
}