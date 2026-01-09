import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './Card.module.css';

interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'glass' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    className = '',
    onClick,
    hoverable = false
}: CardProps) {
    const isClickable = onClick || hoverable;

    return (
        <motion.div
            className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${isClickable ? styles.clickable : ''} ${className}`}
            onClick={onClick}
            whileHover={isClickable ? { y: -4, transition: { duration: 0.2 } } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
        >
            {children}
        </motion.div>
    );
}
