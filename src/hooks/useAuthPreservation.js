import { useCallback } from 'react';

/**
 * Hook to preserve authentication token during navigation
 * Prevents token loss during payment flows
 */
export const useAuthPreservation = () => {
  const preserveToken = useCallback(() => {
    try {
      // Get token from both localStorage and sessionStorage
      const localToken = localStorage.getItem('authToken');
      const sessionToken = sessionStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');
      
      // Use localStorage token as primary, sessionStorage as fallback
      const authToken = localToken || sessionToken;
      
      if (authToken) {
        // Always ensure token is in localStorage for persistence
        localStorage.setItem('authToken', authToken);
        console.log('🔐 Auth token preserved during navigation');
        
        // Also preserve in sessionStorage for compatibility
        sessionStorage.setItem('authToken', authToken);
        
        return authToken;
      } else {
        console.warn('⚠️ No auth token found to preserve');
        return null;
      }
    } catch (error) {
      console.error('❌ Error preserving auth token:', error);
      return null;
    }
  }, []);

  const restoreToken = useCallback(() => {
    try {
      const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (authToken) {
        // Ensure token is in both storages
        localStorage.setItem('authToken', authToken);
        sessionStorage.setItem('authToken', authToken);
        console.log('🔐 Auth token restored after navigation');
        return authToken;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error restoring auth token:', error);
      return null;
    }
  }, []);

  return { preserveToken, restoreToken };
};