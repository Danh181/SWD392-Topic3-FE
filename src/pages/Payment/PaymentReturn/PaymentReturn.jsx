import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseVNPayReturn } from '../../../services/payment';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        const currentUrl = window.location.href;
        console.log('🔍 Current URL:', currentUrl);
        
        // Check if we're on the backend domain with VNPay params
        if (currentUrl.includes('czf23bx8-8080.asse.devtunnels.ms') || 
            currentUrl.includes('localhost:8080')) {
          
          console.log('🔄 Detected backend domain, checking for redirect...');
          
          // Extract VNPay params from current URL
          const urlParams = new URLSearchParams(window.location.search);
          
          // Check if we have VNPay params
          if (urlParams.has('vnp_ResponseCode') || urlParams.has('vnp_TxnRef')) {
            const frontendBase = currentUrl.includes('czf23bx8-8080.asse.devtunnels.ms') 
              ? 'https://swd-392-topic3-fe.vercel.app'
              : 'http://localhost:5173';
              
            const frontendUrl = frontendBase + '/payment/return?' + urlParams.toString();
            console.log('🚀 Redirecting to frontend with params:', frontendUrl);
            
            // Preserve authentication state during redirect
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const user = localStorage.getItem('user');
            
            // Store temporarily in sessionStorage to survive redirect
            if (accessToken) sessionStorage.setItem('temp_accessToken', accessToken);
            if (refreshToken) sessionStorage.setItem('temp_refreshToken', refreshToken);
            if (user) sessionStorage.setItem('temp_user', user);
            
            window.location.href = frontendUrl;
            return;
          }
          
          // Check for JSON response with redirect text (wait a bit for content to load)
          setTimeout(() => {
            const pageText = document.body.textContent || '';
            console.log('📄 Page content:', pageText);
            
            if (pageText.includes('redirect:')) {
              const redirectMatch = pageText.match(/redirect:([^"\s]+)/);
              if (redirectMatch) {
                let redirectUrl = redirectMatch[1];
                
                // Fix redirect URL if it's pointing to localhost but we're on public domain
                if (redirectUrl.includes('localhost:5173') && currentUrl.includes('czf23bx8-8080.asse.devtunnels.ms')) {
                  redirectUrl = redirectUrl.replace('http://localhost:5173/mainpage/HomePage', 'https://swd-392-topic3-fe.vercel.app');
                }
                
                console.log('🚀 Found redirect URL in content:', redirectUrl);
                window.location.href = redirectUrl;
                return;
              }
            }
            
            // If no redirect found, redirect to failure page
            console.error('❌ No redirect URL found in backend response');
            navigate('/payment/failure', { 
              state: { 
                message: 'Lỗi xử lý kết quả thanh toán. Vui lòng liên hệ hỗ trợ.' 
              } 
            });
          }, 500);
          
          return;
        }

        // Normal frontend processing when on correct domain
        console.log('✅ Processing payment return on frontend domain');
        
        // Restore authentication state if available
        const tempAccessToken = sessionStorage.getItem('temp_accessToken');
        const tempRefreshToken = sessionStorage.getItem('temp_refreshToken');
        const tempUser = sessionStorage.getItem('temp_user');
        
        if (tempAccessToken && !localStorage.getItem('accessToken')) {
          console.log('🔄 Restoring authentication state from session storage');
          localStorage.setItem('accessToken', tempAccessToken);
          localStorage.setItem('refreshToken', tempRefreshToken || '');
          localStorage.setItem('user', tempUser || '');
          
          // Clean up temp storage
          sessionStorage.removeItem('temp_accessToken');
          sessionStorage.removeItem('temp_refreshToken');
          sessionStorage.removeItem('temp_user');
        }
        
        // Debug URL params
        console.log('🔍 Search Params from URL:', window.location.search);
        console.log('🔍 All URL params:', Object.fromEntries(searchParams.entries()));
        
        const result = parseVNPayReturn(searchParams);
        
        // Get saved transaction info from sessionStorage
        const transactionId = sessionStorage.getItem('pendingPaymentTransaction');
        const orderCode = sessionStorage.getItem('pendingPaymentOrderCode');
        
        if (transactionId) result.savedTransactionId = transactionId;
        if (orderCode) result.savedOrderCode = orderCode;
        
        console.log('📦 Payment Return Result:', result);
        
        // Navigate to appropriate page based on payment result
        if (result.success) {
          // Redirect to success page with query params
          const successUrl = `/payment/success?${searchParams.toString()}`;
          navigate(successUrl, { replace: true });
        } else {
          // Redirect to failure page with query params
          const failureUrl = `/payment/failure?${searchParams.toString()}`;
          navigate(failureUrl, { replace: true });
        }
        
      } catch (error) {
        console.error('❌ Error processing payment return:', error);
        navigate('/payment/failure', { 
          state: { 
            message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng thử lại.' 
          } 
        });
      }
    };

    handlePaymentReturn();
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
