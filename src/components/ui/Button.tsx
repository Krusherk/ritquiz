import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        variant = 'primary',
        size = 'md',
        isLoading = false,
        fullWidth = false,
        className = '',
        disabled,
        ...props
    }, ref) => {
        return (
            <motion.button
                ref={ref}
                className={`${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
                disabled={disabled || isLoading}
                whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
                {...props as any}
            >
                {isLoading ? (
                    <span className={styles.loader}>
                        <svg className={styles.spinner} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeLinecap="round" />
                        </svg>
                    </span>
                ) : children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
