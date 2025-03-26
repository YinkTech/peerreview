// src/App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ReviewProvider } from './contexts/ReviewContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Review from './pages/Review';
import NotFound from './pages/NotFound';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Profile from './pages/Profile';
import DashboardLayout from './components/layout/DashboardLayout';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-gray-900">Loading...</div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div>Something went wrong. Please refresh the page.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}

const StudentRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (userRole !== 'student') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <AuthProvider>
            <Router>
              <ReviewProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Dashboard />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/review"
                    element={
                      <StudentRoute>
                        <DashboardLayout>
                          <Review />
                        </DashboardLayout>
                      </StudentRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Profile />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ReviewProvider>
            </Router>
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;