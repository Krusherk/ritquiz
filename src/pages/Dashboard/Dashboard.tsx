import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/layout';
import { Card, Avatar } from '../../components/ui';
import { getGeneralQuizzes, getHostQuizzes } from '../../services/firebase';
import { Quiz } from '../../types';
import styles from './Dashboard.module.css';

export function Dashboard() {
    const { user } = useAuth();
    const [generalQuizzes, setGeneralQuizzes] = useState<Quiz[]>([]);
    const [hostQuizzes, setHostQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'general' | 'host'>('general');

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            const [general, host] = await Promise.all([
                getGeneralQuizzes(),
                getHostQuizzes()
            ]);
            setGeneralQuizzes(general);
            setHostQuizzes(host);
        } catch (error) {
            console.error('Error loading quizzes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const displayedQuizzes = activeTab === 'general' ? generalQuizzes : hostQuizzes;

    return (
        <Layout>
            <div className={styles.page}>
                <div className="container">
                    {/* Welcome Banner */}
                    <motion.div
                        className={styles.welcomeBanner}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className={styles.welcomeContent}>
                            <h1 className={styles.welcomeTitle}>
                                Welcome back, <span className={styles.highlight}>{user?.username}</span>
                            </h1>
                            <p className={styles.welcomeSubtitle}>
                                Ready to test your knowledge? Join a quiz and compete for the top spot!
                            </p>
                        </div>
                        <div className={styles.welcomeAvatar}>
                            <Avatar src={user?.avatarUrl} name={user?.username || 'User'} size="xl" />
                        </div>
                    </motion.div>

                    {/* Quick Stats */}
                    <div className={styles.quickStats}>
                        <Card variant="glass" padding="md">
                            <div className={styles.statContent}>
                                <span className={styles.statIcon}>🎯</span>
                                <div>
                                    <p className={styles.statValue}>{generalQuizzes.length + hostQuizzes.length}</p>
                                    <p className={styles.statLabel}>Available Quizzes</p>
                                </div>
                            </div>
                        </Card>
                        <Card variant="glass" padding="md">
                            <div className={styles.statContent}>
                                <span className={styles.statIcon}>🏆</span>
                                <div>
                                    <p className={styles.statValue}>0</p>
                                    <p className={styles.statLabel}>Quizzes Completed</p>
                                </div>
                            </div>
                        </Card>
                        <Card variant="glass" padding="md">
                            <div className={styles.statContent}>
                                <span className={styles.statIcon}>⭐</span>
                                <div>
                                    <p className={styles.statValue}>0</p>
                                    <p className={styles.statLabel}>Total Score</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quiz Tabs */}
                    <div className={styles.tabsContainer}>
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                General Quizzes
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'host' ? styles.active : ''}`}
                                onClick={() => setActiveTab('host')}
                            >
                                Host Quizzes
                            </button>
                        </div>
                    </div>

                    {/* Quiz Grid */}
                    {isLoading ? (
                        <div className={styles.loading}>
                            <div className={styles.loadingGrid}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`${styles.quizCardSkeleton} skeleton`} />
                                ))}
                            </div>
                        </div>
                    ) : displayedQuizzes.length === 0 ? (
                        <motion.div
                            className={styles.emptyState}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className={styles.emptyIcon}>📭</div>
                            <h3 className={styles.emptyTitle}>No quizzes available</h3>
                            <p className={styles.emptyText}>
                                {activeTab === 'general'
                                    ? 'Check back soon for new general quizzes!'
                                    : 'No host quizzes are currently available.'}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className={styles.quizGrid}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {displayedQuizzes.map((quiz, index) => (
                                <motion.div
                                    key={quiz.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link to={`/quiz/${quiz.id}`} className={styles.quizLink}>
                                        <Card variant="default" hoverable padding="lg">
                                            <div className={styles.quizCard}>
                                                <div className={styles.quizHeader}>
                                                    <span className={styles.quizStatus}>
                                                        {quiz.status === 'live' ? '🔴 Live' : quiz.status}
                                                    </span>
                                                    <span className={styles.quizQuestions}>
                                                        {quiz.questionCount} questions
                                                    </span>
                                                </div>
                                                <h3 className={styles.quizTitle}>{quiz.title}</h3>
                                                <p className={styles.quizDescription}>{quiz.description}</p>
                                                <div className={styles.quizFooter}>
                                                    <span className={styles.quizTimer}>
                                                        ⏱️ {quiz.timerSeconds}s per question
                                                    </span>
                                                    <span className={styles.quizCreator}>
                                                        by {quiz.creatorUsername}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
