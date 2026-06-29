import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuth = async () => {
            try {
                const url = await Linking.getInitialURL();
                const hash = url?.split('#')[1] || (typeof window !== 'undefined' ? window.location.hash.slice(1) : '');

                const params = new URLSearchParams(hash);
                const authType = params.get('type');
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (authType === 'recovery') {
                    router.replace('/reset-password');
                    return;
                }

                if (accessToken && refreshToken) {
                    await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    await AsyncStorage.setItem('access_token', accessToken);
                }

                const onboardingComplete = await AsyncStorage.getItem('lumina_onboarding_complete');

                setTimeout(() => {
                    if (onboardingComplete === 'true') {
                        router.replace('/(tabs)/home');
                    } else {
                        router.replace('/onboarding');
                    }
                }, 100);

            } catch (error) {
                router.replace('/(tabs)/home');
            }
        };

        handleAuth();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );
}