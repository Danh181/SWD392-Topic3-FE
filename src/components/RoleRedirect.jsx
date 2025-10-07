import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRedirect = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (user) {
      if (hasRole('ADMIN')) {
        navigate('/dashboard/admin');
      } else if (hasRole('STATION_STAFF')) {
        navigate('/staff/dashboard');
      } else {
        navigate('/mainpage/HomePage');
      }
    } else {
      navigate('/mainpage/HomePage');
    }
  }, [user, hasRole, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0028b8] mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
};

export default RoleRedirect;
