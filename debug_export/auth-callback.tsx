import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
    const router = useRouter();
    const { loginWithGoogle } = useAuth();

    useEffect(() => {
        const handleAuth = async () => {
            try {

                const hash = window.location.hash;

                const sessionIdMatch = hash.match(/session_id=([^&]+)/);

                const sessionId = sessionIdMatch?.[1];

                if (sessionId) {

                    await loginWithGoogle(sessionId);

                    setTimeout(() => {
                        router.replace('/(tabs)/home');
                    }, 100);

                } else {

                    setTimeout(() => {
                        router.replace('/login');
                    }, 100);

                }

            } catch (error) {

                setTimeout(() => {
                    router.replace('/login');
                }, 100);

            }
        };

        handleAuth();
    }, []);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <ActivityIndicator size="large" />
        </View>
    );
}