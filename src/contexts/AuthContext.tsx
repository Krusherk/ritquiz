import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import type { User } from '../types';
import { getUserByPrivyId, createUser, updateUser } from '../services/firebase';

interface AuthContextType {
    user: User | null;
    privyUser: any;
    isLoading: boolean;
    isAuthenticated: boolean;
    needsUsername: boolean;
    login: () => void;
    logout: () => void;
    setUsername: (username: string) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { ready, authenticated, user: privyUser, login, logout } = usePrivy();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [needsUsername, setNeedsUsername] = useState(false);

    // Extract Discord avatar from linked accounts
    const getDiscordAvatar = (): string | null => {
        if (!privyUser?.linkedAccounts) return null;

        const discordAccount = privyUser.linkedAccounts.find(
            (account) => account.type === 'discord_oauth'
        ) as any;

        if (discordAccount) {
            // Log to debug what Privy gives us
            console.log('Discord account data:', discordAccount);

            // Check all possible avatar fields from Privy
            if (discordAccount.profile_picture_url) {
                return discordAccount.profile_picture_url;
            }
            if (discordAccount.avatarUrl) {
                return discordAccount.avatarUrl;
            }
            if (discordAccount.avatar_url) {
                return discordAccount.avatar_url;
            }

            // Construct Discord CDN URL using user ID and avatar hash
            // Discord format: https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png
            if (discordAccount.subject && discordAccount.avatar) {
                const userId = discordAccount.subject;
                const avatarHash = discordAccount.avatar;
                const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
                return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}`;
            }

            // Fallback: default Discord avatar
            if (discordAccount.subject) {
                return `https://cdn.discordapp.com/embed/avatars/${parseInt(discordAccount.subject) % 5}.png`;
            }
        }

        return null;
    };

    // Extract email from linked accounts
    const getEmail = (): string => {
        if (!privyUser?.linkedAccounts) return '';

        const emailAccount = privyUser.linkedAccounts.find(
            (account) => account.type === 'email' || account.type === 'google_oauth' || account.type === 'discord_oauth'
        ) as any;

        return emailAccount?.email || emailAccount?.address || '';
    };

    // Extract display name from linked accounts
    const getDisplayName = (): string => {
        if (!privyUser?.linkedAccounts) return '';

        for (const account of privyUser.linkedAccounts) {
            const acc = account as any;
            if (acc.name) return acc.name;
            if (acc.username) return acc.username;
        }

        return '';
    };

    // Check if user should be admin
    const getDiscordUsername = (): string => {
        if (!privyUser?.linkedAccounts) return '';
        const discordAccount = privyUser.linkedAccounts.find(
            (account) => account.type === 'discord_oauth'
        ) as any;
        return discordAccount?.username || '';
    };

    const isAdminUser = (): boolean => {
        const email = getEmail();
        const discordUsername = getDiscordUsername();

        // Admin email or Discord username
        if (email === 'kqowiy25@gmail.com') return true;
        if (discordUsername === 'qawiyy.0x') return true;

        return false;
    };

    const refreshUser = async () => {
        if (!privyUser?.id) {
            setUser(null);
            setNeedsUsername(false);
            setIsLoading(false);
            return;
        }

        try {
            const existingUser = await getUserByPrivyId(privyUser.id);

            if (existingUser) {
                // Check if admin status needs to be updated
                if (isAdminUser() && existingUser.role !== 'admin') {
                    await updateUser(privyUser.id, { role: 'admin' });
                    setUser({ ...existingUser, role: 'admin' });
                } else {
                    setUser(existingUser);
                }
                setNeedsUsername(false);

                // Update avatar if they logged in with Discord and avatar changed
                const discordAvatar = getDiscordAvatar();
                if (discordAvatar && discordAvatar !== existingUser.avatarUrl) {
                    await updateUser(privyUser.id, { avatarUrl: discordAvatar });
                    setUser(prev => prev ? { ...prev, avatarUrl: discordAvatar } : null);
                }
            } else {
                // New user - needs to set username
                setNeedsUsername(true);
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (ready) {
            if (authenticated && privyUser) {
                refreshUser();
            } else {
                setUser(null);
                setNeedsUsername(false);
                setIsLoading(false);
            }
        }
    }, [ready, authenticated, privyUser]);

    const setUsername = async (username: string) => {
        if (!privyUser?.id) throw new Error('Not authenticated');

        // Determine role based on email/discord username
        const role = isAdminUser() ? 'admin' : 'player';

        const newUser = await createUser({
            privyId: privyUser.id,
            username,
            displayName: getDisplayName() || username,
            email: getEmail(),
            avatarUrl: getDiscordAvatar(),
            role,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        setUser(newUser);
        setNeedsUsername(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                privyUser,
                isLoading: !ready || isLoading,
                isAuthenticated: authenticated && !!user,
                needsUsername,
                login,
                logout,
                setUsername,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
