import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Avatar } from '../../components/ui';
import styles from './Landing.module.css';

export function Landing() {
    const { authenticated, ready, login, logout } = usePrivy();
    const { user, isAuthenticated, needsUsername, isLoading } = useAuth();
    const navigate = useNavigate();

    // Only redirect if user needs to set username (don't auto-redirect authenticated users)
    useEffect(() => {
        if (ready && !isLoading && needsUsername) {
            navigate('/setup');
        }
    }, [ready, isLoading, needsUsername, navigate]);

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else if (needsUsername) {
            navigate('/setup');
        } else if (authenticated) {
            navigate('/setup');
        } else {
            login();
        }
    };

    return (
        <div className={styles.page}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={`container ${styles.navContainer}`}>
                    <Link to="/" className={styles.logo}>
                        <img src="/rit.svg" alt="RITQUIZ" width="32" height="32" />
                        <span className={styles.logoText}>RITQUIZ</span>
                    </Link>

                    <div className={styles.navLinks}>
                        <Link to="/leaderboard" className={styles.navLink}>Leaderboard</Link>

                        {authenticated ? (
                            <>
                                {isAuthenticated && (
                                    <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
                                )}
                                {needsUsername ? (
                                    <Button size="sm" onClick={() => navigate('/setup')}>
                                        Complete Setup
                                    </Button>
                                ) : isAuthenticated ? (
                                    <div className={styles.userMenu}>
                                        <Link to="/profile" className={styles.profileLink}>
                                            <Avatar
                                                src={user?.avatarUrl}
                                                name={user?.username || 'User'}
                                                size="sm"
                                            />
                                            <span>{user?.username}</span>
                                        </Link>
                                        <button onClick={logout} className={styles.logoutBtn}>
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <Button size="sm" onClick={() => navigate('/setup')}>
                                        Complete Setup
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Button size="sm" onClick={login}>
                                Login
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Background elements */}
            <div className={styles.bgGradient} />
            <div className={styles.bgGrid} />

            {/* Hero Section - Centered */}
            <section className={styles.hero}>
                <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className={styles.title}>
                        <span className={styles.titleGradient}>RITQUIZ</span>
                    </h1>

                    <p className={styles.subtitle}>
                        Test your knowledge. Compete with others.
                    </p>

                    <div className={styles.cta}>
                        <Button size="lg" onClick={handleGetStarted}>
                            {authenticated ? (needsUsername ? 'Complete Setup' : 'Go to Dashboard') : 'Get Started'}
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <div className={styles.footerContent}>
                        <p className={styles.footerText}>© 2025 RITQUIZ</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
