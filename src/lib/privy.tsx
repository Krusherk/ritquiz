import { PrivyProvider } from '@privy-io/react-auth';
import type { ReactNode } from 'react';

interface PrivyWrapperProps {
    children: ReactNode;
}

export function PrivyWrapper({ children }: PrivyWrapperProps) {
    return (
        <PrivyProvider
            appId={import.meta.env.VITE_PRIVY_APP_ID}
            config={{
                appearance: {
                    theme: 'dark',
                    accentColor: '#FFFFFF',
                    logo: '/logo.svg',
                },
                loginMethods: ['email', 'google', 'discord'],
                embeddedWallets: {
                    createOnLogin: 'off', // We don't need wallets for this app
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
