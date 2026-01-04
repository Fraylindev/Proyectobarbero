/**
 * APLICACIÓN PRINCIPAL
 * Router y estructura general
 */
import ConfirmBooking from './pages/public/ConfirmBooking';
import RejectBooking from './pages/public/RejectBooking';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/auth_context';

// Pages
import Home from './pages/home_page';
import Login from './pages/login_page';
import Register from './pages/register';
import BookingFlow from './pages/booking_flow';
import BookingSuccess from './pages/booking_success';

// Dashboard
import DashboardLayout from './layouts/dashboard_layout';
import BookingsDashboard from './pages/dashboard/bookings_dashboard';
import AvailabilityDashboard from './pages/dashboard/availability_dashboard';
import PaymentsDashboard from './pages/dashboard/payments_dashboard';
import AdminDashboard from './pages/dashboard/admindashboard';

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isProfessional, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
   return <Navigate to="/login" replace />;
  }

  // Dashboard solo para profesionales
  if (!isProfessional) {
   //return <Navigate to="/" replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/booking" element={<BookingFlow />} />
      <Route path="/booking-success" element={<BookingSuccess />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirm/:token" element={<ConfirmBooking />} />
      <Route path="/reject/:token" element={<RejectBooking />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BookingsDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/availability"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AvailabilityDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/payments"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PaymentsDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#1a1a1a',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;