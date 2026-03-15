import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginView from "./pages/LoginView";
import AdminLoginView from "./pages/AdminLoginView";
import PaymentPage from "./pages/PaymentPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";

// Admin Imports
import { AdminLayout } from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import UsersPage from "./admin/pages/UsersPage";
import WithdrawalsPage from "./admin/pages/WithdrawalsPage";
import AutopoolPage from "./admin/pages/AutopoolPage";
import PinsPage from "./admin/pages/PinsPage";
import TransactionsPage from "./admin/pages/TransactionsPage";
import MarriageHelpPage from "./admin/pages/MarriageHelpPage";
import AuditLogsPage from "./admin/pages/AuditLogsPage";
import SettingsPage from "./admin/pages/SettingsPage";
import KYCPage from "./admin/pages/KYCPage";
import PaymentApprovalsPage from "./admin/pages/PaymentApprovalsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginView />} />
            <Route
              path="/payment"
              element={
                <ProtectedRoute skipPaymentCheck>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route path="/adminlogin" element={<AdminLoginView />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="withdrawals" element={<WithdrawalsPage />} />
              <Route path="autopool" element={<AutopoolPage />} />
              <Route path="pins" element={<PinsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="marriage-help" element={<MarriageHelpPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="kyc" element={<KYCPage />} />
              <Route path="payment-approvals" element={<PaymentApprovalsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
