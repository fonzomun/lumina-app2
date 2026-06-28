import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {

    const checkRoute = async () => {

      if (!loading) {

        if (user) {

          const onboardingComplete =
            await AsyncStorage.getItem(
              'lumina_onboarding_complete'
            );

          if (onboardingComplete === 'true') {

            router.replace('/(tabs)/home');

          } else {

            router.replace('/onboarding');

          }

        } else {

          router.replace('/(auth)/login');

        }
      }
    };

    checkRoute();

  }, [user, loading]);

  return (
    <LinearGradient
      colors={['#FF9A6C', '#FF6B8A', '#9B6BFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ActivityIndicator size="large" color="#FFFFFF" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
