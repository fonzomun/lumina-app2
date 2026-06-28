import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthCallback() {
    const router = useRouter();
    const { loginWithGoogle } = useAuth();

    useEffect(() => {
        const handleAuth = async () => {
            try {

                const hash = window.location.hash;
                const typeMatch = hash.match(/type=([^&]+)/);
                const authType = typeMatch?.[1];

                const sessionIdMatch = hash.match(/session_id=([^&]+)/);

                const sessionId = sessionIdMatch?.[1];
                if (authType === 'recovery') {
                    router.replace('/reset-password');
                    return;
                }

                if (sessionId) {

                    await loginWithGoogle(sessionId);

                    const onboardingComplete =
                        await AsyncStorage.getItem(
                            'lumina_onboarding_complete'
                        );

                    setTimeout(() => {

                        if (onboardingComplete === 'true') {

                            router.replace('/(tabs)/home');

                        } else {

                            router.replace('/onboarding');

                        }

                    }, 100);

                } else {

                    const onboardingComplete =
                        await AsyncStorage.getItem(
                            'lumina_onboarding_complete'
                        );

                    setTimeout(() => {

                        if (onboardingComplete === 'true') {

                            router.replace('/(tabs)/home');

                        } else {

                            router.replace('/onboarding');

                        }

                    }, 100);

                }
            } catch (error) {

                router.replace('/(tabs)/home');

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