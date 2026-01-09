import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/ui';
import { checkUsernameExists } from '../../services/firebase';
import styles from './UsernameSetup.module.css';

export function UsernameSetup() {
    const { setUsername, privyUser } = useAuth();
    const navigate = useNavigate();
    const [username, setUsernameValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const validateUsername = (value: string): string | null => {
        if (value.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (value.length > 20) {
            return 'Username must be 20 characters or less';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Username can only contain letters, numbers, and underscores';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Check if username is already taken
            const exists = await checkUsernameExists(username);
            if (exists) {
                setError('This username is already taken');
                setIsLoading(false);
                return;
            }

            await setUsername(username);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to set username. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Get suggested display name from linked accounts
    const getSuggestedName = () => {
        if (!privyUser?.linkedAccounts) return '';
        for (const account of privyUser.linkedAccounts) {
            if (account.username) return account.username.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
            if (account.name) return account.name.split(' ')[0].replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
        }
        return '';
    };

    return (
        <div className={styles.page}>
            <div className={styles.bgGradient} />

            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className={styles.header}>
                    <div className={styles.icon}>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="14" r="8" stroke="currentColor" strokeWidth="2" />
                            <path d="M6 36C6 28.268 12.268 22 20 22C27.732 22 34 28.268 34 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Choose Your Username</h1>
                    <p className={styles.subtitle}>
                        This is how other players will see you on leaderboards and in quizzes.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => {
                            setUsernameValue(e.target.value);
                            setError('');
                        }}
                        error={error}
                        helperText="3-20 characters, letters, numbers, and underscores only"
                        autoFocus
                    />

                    {getSuggestedName() && !username && (
                        <button
                            type="button"
                            className={styles.suggestion}
                            onClick={() => setUsernameValue(getSuggestedName())}
                        >
                            Suggested: <strong>{getSuggestedName()}</strong>
                        </button>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isLoading}
                        disabled={!username.trim()}
                    >
                        Continue
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}
