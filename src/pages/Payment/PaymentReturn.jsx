import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handleReturn = async () => {
      try {
        // Get VNPay response code from URL
        const responseCode = searchParams.get('vnp_ResponseCode');
        const txnRef = searchParams.get('vnp_TxnRef');
        
        console.log('VNPay Return:', { responseCode, txnRef });

        // Extract transaction ID from txnRef (format: uuid-timestamp)
        let transactionId = sessionStorage.getItem('pendingPaymentTransaction');
        
        if (txnRef && txnRef.length >= 36) {
          transactionId = txnRef.substring(0, 36);
        }

        // Check if payment was successful based on response code
        if (responseCode === '00') {
          // Success - navigate to success page
          const paymentData = {
            transactionId,
            responseCode,
            success: true,
            message: 'Thanh toán thành công'
          };
          
          // Store for success page
          sessionStorage.setItem('paymentResult', JSON.stringify(paymentData));
          navigate('/payment/success', { state: paymentData, replace: true });
        } else {
          // Failure - navigate to failure page
          const paymentData = {
            transactionId,
            responseCode,
            success: false,
            message: getErrorMessage(responseCode)
          };
          
          navigate('/payment/failure', { state: paymentData, replace: true });
        }
      } catch (error) {
        console.error('Error processing payment return:', error);
        navigate('/payment/failure', { 
          state: { 
            message: 'Có lỗi xảy ra khi xử lý thanh toán',
            error: error.message 
          },
          replace: true
        });
      } finally {
        setChecking(false);
      }
    };

    handleReturn();
  }, [searchParams, navigate]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0028b8] mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Đang xử lý kết quả thanh toán...</div>
          <div className="text-sm text-gray-500 mt-2">Vui lòng không đóng trang</div>
        </div>
      </div>
    );
  }

  return null;
}

function getErrorMessage(responseCode) {
  const errorMessages = {
    '01': 'Giao dịch chưa hoàn tất',
    '02': 'Giao dịch bị lỗi',
    '04': 'Giao dịch đảo - Vui lòng liên hệ ngân hàng',
    '05': 'VNPAY đang xử lý giao dịch',
    '07': 'Giao dịch bị nghi ngờ gian lận',
    '09': 'Thẻ chưa đăng ký dịch vụ Internet Banking',
    '10': 'Xác thực thông tin thẻ không đúng quá 3 lần',
    '11': 'Đã hết hạn chờ thanh toán',
    '12': 'Thẻ/Tài khoản bị khóa',
    '13': 'Sai mật khẩu xác thực giao dịch (OTP)',
    '24': 'Khách hàng hủy giao dịch',
    '51': 'Tài khoản không đủ số dư',
    '65': 'Vượt quá hạn mức giao dịch trong ngày',
    '75': 'Ngân hàng đang bảo trì',
    '79': 'Nhập sai mật khẩu quá số lần quy định',
    '99': 'Lỗi không xác định'
  };
  
  return errorMessages[responseCode] || 'Giao dịch không thành công';
}
