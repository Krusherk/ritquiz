import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PrivyWrapper } from './lib/privy';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QuizProvider } from './contexts/QuizContext';
import {
    Landing,
    UsernameSetup,
    Dashboard,
    QuizPlay,
    Results,
    Leaderboard,
    HostDashboard,
    AdminDashboard,
    Profile
} from './pages';
import './styles/index.css';

// OAuth callback handler - cleans up URL after OAuth login
function OAuthHandler({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { needsUsername, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        // Check if URL has OAuth params
        const params = new URLSearchParams(location.search);
        if (params.has('privy_oauth_state') || params.has('privy_oauth_code')) {
            // Wait for auth to settle, then redirect
            if (!isLoading) {
                if (needsUsername) {
                    navigate('/setup', { replace: true });
                } else if (isAuthenticated) {
                    navigate('/dashboard', { replace: true });
                } else {
                    // Clean up URL params
                    navigate(location.pathname, { replace: true });
                }
            }
        }
    }, [location, isLoading, needsUsername, isAuthenticated, navigate]);

    return <>{children}</>;
}

// Protected Route Component
function ProtectedRoute({
    children,
    requiredRole
}: {
    children: React.ReactNode;
    requiredRole?: 'host' | 'admin';
}) {
    const { user, isLoading, isAuthenticated, needsUsername } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated && !needsUsername) {
        return <Navigate to="/" replace />;
    }

    if (needsUsername) {
        return <Navigate to="/setup" replace />;
    }

    if (requiredRole) {
        const hasAccess = user?.role === requiredRole || user?.role === 'admin';
        if (!hasAccess) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
}

// Username Route - requires auth but no username yet
function UsernameRoute({ children }: { children: React.ReactNode }) {
    const { isLoading, needsUsername, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                Loading...
            </div>
        );
    }

    if (!needsUsername && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    if (!needsUsername && !isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/leaderboard/:id" element={<Leaderboard />} />

            {/* Username Setup (needs auth, no username) */}
            <Route path="/setup" element={
                <UsernameRoute>
                    <UsernameSetup />
                </UsernameRoute>
            } />

            {/* Protected Routes (needs auth + username) */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            <Route path="/quiz/:id" element={
                <ProtectedRoute>
                    <QuizPlay />
                </ProtectedRoute>
            } />

            <Route path="/quiz/:id/results" element={
                <ProtectedRoute>
                    <Results />
                </ProtectedRoute>
            } />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            } />

            {/* Host Routes */}
            <Route path="/host" element={
                <ProtectedRoute requiredRole="host">
                    <HostDashboard />
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <PrivyWrapper>
                <AuthProvider>
                    <QuizProvider>
                        <OAuthHandler>
                            <AppRoutes />
                        </OAuthHandler>
                    </QuizProvider>
                </AuthProvider>
            </PrivyWrapper>
        </BrowserRouter>
    );
}

export default App;
