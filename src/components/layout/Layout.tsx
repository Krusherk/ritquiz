import type { ReactNode } from 'react';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
    children: ReactNode;
    showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
    return (
        <div className={styles.layout}>
            {showHeader && <Header />}
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
