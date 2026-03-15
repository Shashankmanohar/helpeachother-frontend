import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    skipPaymentCheck?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, skipPaymentCheck = false }) => {
    const token = localStorage.getItem('heo_token');
    const userJson = localStorage.getItem('heo_user');
    const location = useLocation();

    if (!token || !userJson) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Check payment status unless explicitly skipped (e.g., for the PaymentPage itself)
    if (!skipPaymentCheck) {
        try {
            const user = JSON.parse(userJson);
            if (user.paymentStatus && user.paymentStatus !== 'approved') {
                return <Navigate to="/payment" replace />;
            }
        } catch (e) { }
    }

    return <>{children}</>;
};

export default ProtectedRoute;

