import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseVNPayReturn } from '../../../services/payment';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentReturn = () => {
      try {
        const currentUrl = window.location.href;
        console.log('🔍 Current URL:', currentUrl);
        console.log('🔍 Search Params:', window.location.search);
        console.log('🔍 All URL params:', Object.fromEntries(searchParams.entries()));
        
        // Get saved transaction info from sessionStorage
        const transactionId = sessionStorage.getItem('pendingPaymentTransaction');
        const orderCode = sessionStorage.getItem('pendingPaymentOrderCode');
        
        console.log('🔍 SessionStorage info:', { transactionId, orderCode });
        
        // Check if we have VNPay parameters (direct VNPay callback - rare case)
        const hasVnpayParams = searchParams.has('vnp_ResponseCode') || 
                              searchParams.has('vnp_TxnRef');
        
        if (hasVnpayParams) {
          console.log('✅ Direct VNPay callback with params - parsing normally');
          // Parse VNPay return parameters
          const result = parseVNPayReturn(searchParams);
          
          if (transactionId) result.savedTransactionId = transactionId;
          if (orderCode) result.savedOrderCode = orderCode;
          
          console.log('📦 Payment Return Result from VNPay:', result);
          
          // Navigate to appropriate page based on payment result
          if (result.success) {
            const successUrl = `/payment/success?${searchParams.toString()}`;
            navigate(successUrl, { replace: true });
          } else {
            const failureUrl = `/payment/failure?${searchParams.toString()}`;
            navigate(failureUrl, { replace: true });
          }
          return;
        }
        
        // Normal case: Backend redirect without params (payment already processed)
        if (transactionId && orderCode) {
          console.log('✅ Backend redirect detected - payment was processed in /vnpay-ipn');
          
          // Since backend already processed payment successfully in /vnpay-ipn
          // We assume success (user reached this point means payment went through)
          const successResult = {
            success: true,
            message: 'Thanh toán đã được xử lý thành công',
            transactionId: transactionId,
            savedTransactionId: transactionId,
            savedOrderCode: orderCode,
            backendProcessed: true,
            note: 'Payment processed by backend /vnpay-ipn endpoint'
          };
          
          console.log('📦 Assuming payment success:', successResult);
          
          // Navigate to success page with mock data
          navigate('/payment/success', { 
            state: successResult,
            replace: true 
          });
        } else {
          console.warn('⚠️ No transaction info found in sessionStorage');
          navigate('/payment/failure', { 
            state: { 
              message: 'Không tìm thấy thông tin giao dịch. Vui lòng kiểm tra đơn hàng của bạn.',
              noTransactionInfo: true
            } 
          });
        }
        
      } catch (error) {
        console.error('❌ Error processing payment return:', error);
        navigate('/payment/failure', { 
          state: { 
            message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng thử lại.',
            error: error.message
          } 
        });
      }
    };

    // Add small delay to ensure URL params are fully loaded
    const timer = setTimeout(() => {
      handlePaymentReturn();
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-xl text-gray-700">Đang xử lý kết quả thanh toán...</div>
        <div className="text-sm text-gray-500 mt-2">Vui lòng chờ trong giây lát</div>
      </div>
    </div>
  );
}
