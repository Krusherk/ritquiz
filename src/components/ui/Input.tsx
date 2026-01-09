import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className={`${styles.wrapper} ${className}`}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`${styles.input} ${error ? styles.error : ''}`}
                    {...props}
                />
                {error && <p className={styles.errorText}>{error}</p>}
                {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
