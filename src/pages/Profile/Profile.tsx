import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/layout';
import { Card, Button, Avatar } from '../../components/ui';
import styles from './Profile.module.css';

export function Profile() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <Layout>
                <div className={styles.notFound}>User not found</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.page}>
                <div className="container container-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card variant="default" padding="lg">
                            <div className={styles.profileHeader}>
                                <Avatar src={user.avatarUrl} name={user.username} size="xl" />
                                <div className={styles.userInfo}>
                                    <h1 className={styles.username}>{user.username}</h1>
                                    <span className={`${styles.role} ${styles[user.role]}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.details}>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>Email</span>
                                    <span className={styles.value}>{user.email}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>Member since</span>
                                    <span className={styles.value}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <Button variant="danger" onClick={logout}>
                                    Logout
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
