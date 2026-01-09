import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '../../components/layout';
import { Card, Avatar } from '../../components/ui';
import { getLeaderboard, getGlobalLeaderboard, getQuiz } from '../../services/firebase';
import { LeaderboardEntry, Quiz } from '../../types';
import styles from './Leaderboard.module.css';

export function Leaderboard() {
    const { id } = useParams<{ id: string }>();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, [id]);

    const loadLeaderboard = async () => {
        try {
            if (id) {
                const [quizData, entries] = await Promise.all([
                    getQuiz(id),
                    getLeaderboard(id, 50)
                ]);
                setQuiz(quizData);
                setLeaderboard(entries);
            } else {
                const entries = await getGlobalLeaderboard(50);
                setLeaderboard(entries);
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMedal = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return null;
        }
    };

    return (
        <Layout>
            <div className={styles.page}>
                <div className="container container-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className={styles.header}>
                            <h1 className={styles.title}>
                                {quiz ? quiz.title : 'Global'} Leaderboard
                            </h1>
                            {quiz && (
                                <p className={styles.subtitle}>{quiz.description}</p>
                            )}
                        </div>

                        {isLoading ? (
                            <div className={styles.loading}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className={`${styles.skeletonRow} skeleton`} />
                                ))}
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className={styles.empty}>
                                <div className={styles.emptyIcon}>🏆</div>
                                <h3>No scores yet</h3>
                                <p>Be the first to complete this quiz!</p>
                            </div>
                        ) : (
                            <>
                                {/* Top 3 Podium */}
                                {leaderboard.length >= 3 && (
                                    <div className={styles.podium}>
                                        {/* 2nd Place */}
                                        <motion.div
                                            className={`${styles.podiumItem} ${styles.second}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Avatar src={leaderboard[1].avatarUrl} name={leaderboard[1].username} size="lg" />
                                            <span className={styles.podiumName}>{leaderboard[1].username}</span>
                                            <span className={styles.podiumScore}>{leaderboard[1].score} pts</span>
                                            <div className={styles.podiumRank}>🥈</div>
                                        </motion.div>

                                        {/* 1st Place */}
                                        <motion.div
                                            className={`${styles.podiumItem} ${styles.first}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Avatar src={leaderboard[0].avatarUrl} name={leaderboard[0].username} size="xl" />
                                            <span className={styles.podiumName}>{leaderboard[0].username}</span>
                                            <span className={styles.podiumScore}>{leaderboard[0].score} pts</span>
                                            <div className={styles.podiumRank}>🥇</div>
                                        </motion.div>

                                        {/* 3rd Place */}
                                        <motion.div
                                            className={`${styles.podiumItem} ${styles.third}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Avatar src={leaderboard[2].avatarUrl} name={leaderboard[2].username} size="lg" />
                                            <span className={styles.podiumName}>{leaderboard[2].username}</span>
                                            <span className={styles.podiumScore}>{leaderboard[2].score} pts</span>
                                            <div className={styles.podiumRank}>🥉</div>
                                        </motion.div>
                                    </div>
                                )}

                                {/* Full List */}
                                <Card variant="default" padding="none">
                                    <div className={styles.list}>
                                        {leaderboard.map((entry, index) => (
                                            <motion.div
                                                key={entry.userId}
                                                className={styles.listItem}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <span className={styles.rank}>
                                                    {getMedal(entry.rank) || `#${entry.rank}`}
                                                </span>
                                                <Avatar src={entry.avatarUrl} name={entry.username} size="sm" />
                                                <div className={styles.userInfo}>
                                                    <span className={styles.username}>{entry.username}</span>
                                                    <span className={styles.accuracy}>
                                                        {entry.correctAnswers}/{entry.totalQuestions} correct
                                                    </span>
                                                </div>
                                                <span className={styles.score}>{entry.score}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
