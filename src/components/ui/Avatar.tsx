import styles from './Avatar.module.css';

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
    const initial = name.charAt(0).toUpperCase();

    // Generate a consistent color based on the name
    const colors = [
        '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
        '#EC4899', '#F43F5E', '#EF4444', '#F97316',
        '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
        '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9'
    ];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const bgColor = colors[colorIndex];

    return (
        <div
            className={`${styles.avatar} ${styles[size]} ${className}`}
            style={!src ? { backgroundColor: bgColor } : undefined}
        >
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={styles.image}
                    onError={(e) => {
                        // Fallback to initial if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            ) : (
                <span className={styles.initial}>{initial}</span>
            )}
        </div>
    );
}
