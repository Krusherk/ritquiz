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

    // Auto-redirect when logged in
    useEffect(() => {
        if (ready && !isLoading) {
            if (isAuthenticated) {
                navigate('/dashboard');
            } else if (needsUsername) {
                navigate('/setup');
            }
        }
    }, [ready, isLoading, isAuthenticated, needsUsername, navigate]);

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else if (needsUsername) {
            navigate('/setup');
        } else if (authenticated) {
            // Privy says logged in but we're still loading - go to setup
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

            {/* Hero Section */}
            <section className={styles.hero}>
                <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className={styles.badge}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className={styles.badgeDot} />
                        Live Quiz Platform
                    </motion.div>

                    <h1 className={styles.title}>
                        <span className={styles.titleGradient}>Challenge</span> Your Knowledge
                        <br />with <span className={styles.titleGradient}>Live Quizzes</span>
                    </h1>

                    <p className={styles.subtitle}>
                        Join thousands of players in real-time quiz battles.
                        Host your own events, climb the leaderboard, and prove you're the smartest in the room.
                    </p>

                    <div className={styles.cta}>
                        <Button size="lg" onClick={handleGetStarted}>
                            {authenticated ? (needsUsername ? 'Complete Setup' : 'Go to Dashboard') : 'Get Started'}
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Button>
                        <Button variant="secondary" size="lg" onClick={() => navigate('/leaderboard')}>
                            View Leaderboard
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>10K+</span>
                            <span className={styles.statLabel}>Players</span>
                        </div>
                        <div className={styles.statDivider} />
                        <div className={styles.stat}>
                            <span className={styles.statValue}>500+</span>
                            <span className={styles.statLabel}>Quizzes</span>
                        </div>
                        <div className={styles.statDivider} />
                        <div className={styles.stat}>
                            <span className={styles.statValue}>1M+</span>
                            <span className={styles.statLabel}>Questions Answered</span>
                        </div>
                    </div>
                </motion.div>

                {/* Floating cards animation */}
                <motion.div
                    className={styles.heroVisual}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className={styles.floatingCard} style={{ '--delay': '0s' } as any}>
                        <div className={styles.cardIcon}>🎯</div>
                        <div className={styles.cardText}>General Knowledge</div>
                    </div>
                    <div className={styles.floatingCard} style={{ '--delay': '0.5s' } as any}>
                        <div className={styles.cardIcon}>🏆</div>
                        <div className={styles.cardText}>Compete & Win</div>
                    </div>
                    <div className={styles.floatingCard} style={{ '--delay': '1s' } as any}>
                        <div className={styles.cardIcon}>⚡</div>
                        <div className={styles.cardText}>Real-time Quiz</div>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className="container">
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Everything you need for epic quiz battles
                    </motion.h2>

                    <div className={styles.featureGrid}>
                        {[
                            {
                                icon: '🎮',
                                title: 'Live Competitions',
                                description: 'Compete against players in real-time with timed questions and instant scoring.'
                            },
                            {
                                icon: '🎪',
                                title: 'Host Your Own',
                                description: 'Create custom quizzes for your events, schools, or communities.'
                            },
                            {
                                icon: '📊',
                                title: 'Leaderboards',
                                description: 'Track your progress and see how you rank against other players.'
                            },
                            {
                                icon: '🔗',
                                title: 'Easy Login',
                                description: 'Sign in with Discord, Google, or email in seconds.'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className={styles.featureCard}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={styles.featureIcon}>{feature.icon}</div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDescription}>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <motion.div
                        className={styles.ctaCard}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className={styles.ctaTitle}>Ready to prove yourself?</h2>
                        <p className={styles.ctaText}>Join now and start competing in live quizzes.</p>
                        <Button size="lg" onClick={handleGetStarted}>
                            Start Playing Now
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <div className={styles.footerContent}>
                        <div className={styles.footerLogo}>
                            <img src="/rit.svg" alt="RITQUIZ" width="24" height="24" />
                            <span>RITQUIZ</span>
                        </div>
                        <p className={styles.footerText}>© 2025 RITQUIZ. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
