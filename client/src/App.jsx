import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import ContractorDashboard from './pages/ContractorDashboard';

// Styles
import './index.css';

const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    return (
        <Routes>
            <Route path="/" element={!user ? <Login /> : <Navigate to={user.role === 'contractor' ? '/contractor' : '/worker'} />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'contractor' ? '/contractor' : '/worker'} />} />

            <Route path="/worker" element={
                <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerDashboard />
                </ProtectedRoute>
            } />

            <Route path="/contractor" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                    <ContractorDashboard />
                </ProtectedRoute>
            } />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
