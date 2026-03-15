import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('heo_admin_token');
    const admin = localStorage.getItem('heo_admin_user');
    const location = useLocation();

    if (!token || !admin) {
        // Redirect to admin login page
        return <Navigate to="/adminlogin" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;
