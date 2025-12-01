import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Departments from './pages/Departments';
import SuccessIndex from './pages/SuccessIndex';
import API from './pages/API';
import Settings from './pages/Settings';
import './App.css';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to appropriate page based on role
    if (user.role === 'admin') {
      return <Navigate to="/departments" replace />;
    } else if (user.role === 'hod') {
      return <Navigate to="/success-index" replace />;
    }
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Redirect based on user role
  const defaultRoute = user.role === 'admin' ? '/departments' : '/success-index';

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={defaultRoute} replace />} />
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />
      <Route
        path="/departments"
        element={
          <ProtectedRoute allowedRole="admin">
            <Layout>
              <Departments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/success-index"
        element={
          <ProtectedRoute allowedRole="hod">
            <Layout>
              <SuccessIndex />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/api"
        element={
          <ProtectedRoute>
            <Layout>
              <API />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}

const App = () => (
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
);

export default App;