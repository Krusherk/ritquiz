import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Timer.module.css';

interface TimerProps {
    seconds: number;
    onComplete?: () => void;
    isActive?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function Timer({ seconds, onComplete, isActive = true, size = 'md' }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
        setTimeLeft(seconds);
    }, [seconds]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) {
            if (timeLeft <= 0 && onComplete) {
                onComplete();
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    const progress = (timeLeft / seconds) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const isWarning = timeLeft <= 10 && timeLeft > 5;
    const isDanger = timeLeft <= 5;

    return (
        <div className={`${styles.timer} ${styles[size]}`}>
            <svg className={styles.svg} viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    className={styles.bgCircle}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="6"
                />
                {/* Progress circle */}
                <motion.circle
                    className={`${styles.progressCircle} ${isWarning ? styles.warning : ''} ${isDanger ? styles.danger : ''}`}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                    }}
                    initial={false}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5 }}
                />
            </svg>
            <div className={`${styles.time} ${isDanger ? styles.pulse : ''}`}>
                {timeLeft}
            </div>
        </div>
    );
}
