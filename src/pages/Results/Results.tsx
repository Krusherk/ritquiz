import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../../contexts/QuizContext';
import { Layout } from '../../components/layout';
import { Button, Card, Avatar } from '../../components/ui';
import { getLeaderboard } from '../../services/firebase';
import { LeaderboardEntry } from '../../types';
import styles from './Results.module.css';

export function Results() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state } = useQuiz();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        if (id) {
            getLeaderboard(id, 10).then(setLeaderboard);
        }
    }, [id]);

    if (!state.result) {
        return (
            <Layout>
                <div className={styles.errorPage}>
                    <h2>No results found</h2>
                    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>
            </Layout>
        );
    }

    const percentage = Math.round((state.result.correctAnswers / state.result.totalQuestions) * 100);
    const userRank = leaderboard.findIndex(entry => entry.userId === state.result?.userId) + 1;

    return (
        <Layout>
            <div className={styles.page}>
                <div className="container container-md">
                    {/* Result Card */}
                    <motion.div
                        className={styles.resultCard}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className={styles.confetti}>
                            {percentage >= 70 ? '🎉' : percentage >= 50 ? '👏' : '💪'}
                        </div>

                        <h1 className={styles.title}>
                            {percentage >= 70 ? 'Excellent!' : percentage >= 50 ? 'Good Job!' : 'Keep Practicing!'}
                        </h1>

                        <div className={styles.scoreCircle}>
                            <svg viewBox="0 0 100 100" className={styles.scoreRing}>
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-gray-800)" strokeWidth="8" />
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="var(--color-white)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 45}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - percentage / 100) }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                />
                            </svg>
                            <div className={styles.scoreValue}>
                                <span className={styles.scoreNumber}>{state.result.score}</span>
                                <span className={styles.scoreLabel}>points</span>
                            </div>
                        </div>

                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{state.result.correctAnswers}</span>
                                <span className={styles.statLabel}>Correct</span>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{state.result.totalQuestions - state.result.correctAnswers}</span>
                                <span className={styles.statLabel}>Wrong</span>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{percentage}%</span>
                                <span className={styles.statLabel}>Accuracy</span>
                            </div>
                        </div>

                        {userRank > 0 && (
                            <div className={styles.rank}>
                                You ranked <strong>#{userRank}</strong> on the leaderboard!
                            </div>
                        )}

                        <div className={styles.actions}>
                            <Button onClick={() => navigate('/dashboard')}>
                                Back to Dashboard
                            </Button>
                            <Button variant="secondary" onClick={() => navigate(`/leaderboard/${id}`)}>
                                View Leaderboard
                            </Button>
                        </div>
                    </motion.div>

                    {/* Mini Leaderboard */}
                    {leaderboard.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h2 className={styles.leaderboardTitle}>Top Players</h2>
                            <Card variant="glass" padding="none">
                                <div className={styles.leaderboardList}>
                                    {leaderboard.slice(0, 5).map((entry) => (
                                        <div
                                            key={entry.userId}
                                            className={`${styles.leaderboardItem} ${entry.userId === state.result?.userId ? styles.currentUser : ''}`}
                                        >
                                            <span className={styles.leaderboardRank}>#{entry.rank}</span>
                                            <Avatar src={entry.avatarUrl} name={entry.username} size="sm" />
                                            <span className={styles.leaderboardName}>{entry.username}</span>
                                            <span className={styles.leaderboardScore}>{entry.score} pts</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
