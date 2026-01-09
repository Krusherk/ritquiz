import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui';
import styles from './Header.module.css';

export function Header() {
    const { user, isAuthenticated, login, logout } = useAuth();
    const location = useLocation();

    return (
        <motion.header
            className={styles.header}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`container ${styles.container}`}>
                <Link to="/" className={styles.logo}>
                    <img src="/rit.svg" alt="RITQUIZ" width="32" height="32" />
                    <span className={styles.logoText}>RITQUIZ</span>
                </Link>

                <nav className={styles.nav}>
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`${styles.navLink} ${location.pathname === '/dashboard' ? styles.active : ''}`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/leaderboard"
                                className={`${styles.navLink} ${location.pathname === '/leaderboard' ? styles.active : ''}`}
                            >
                                Leaderboard
                            </Link>
                            {user?.role === 'host' && (
                                <Link
                                    to="/host"
                                    className={`${styles.navLink} ${location.pathname === '/host' ? styles.active : ''}`}
                                >
                                    Host
                                </Link>
                            )}
                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className={`${styles.navLink} ${location.pathname === '/admin' ? styles.active : ''}`}
                                >
                                    Admin
                                </Link>
                            )}
                            <div className={styles.userMenu}>
                                <Link to="/profile" className={styles.profile}>
                                    <Avatar
                                        src={user?.avatarUrl}
                                        name={user?.username || 'User'}
                                        size="sm"
                                    />
                                    <span className={styles.username}>{user?.username}</span>
                                </Link>
                                <button onClick={logout} className={styles.logoutBtn}>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <button onClick={login} className={styles.loginBtn}>
                            Login
                        </button>
                    )}
                </nav>
            </div>
        </motion.header>
    );
}
