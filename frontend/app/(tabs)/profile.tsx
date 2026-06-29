import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

// Official Lumina logo
const LUMINA_LOGO_SMALL_COLOR = 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/vo6dtgtz_Lumina-app_small-logo-color.png';

const avatars = [
  require('@/assets/images/avatars/lumina-avatar-air-monk.png'),
  require('@/assets/images/avatars/lumina-avatar-alien.png'),
  require('@/assets/images/avatars/lumina-avatar-deer.png'),
  require('@/assets/images/avatars/lumina-avatar-fire-spirit.png'),
  require('@/assets/images/avatars/lumina-avatar-forest-spirit.png'),
  require('@/assets/images/avatars/lumina-avatar-lion.png'),
  require('@/assets/images/avatars/lumina-avatar-mystic-hood.png'),
  require('@/assets/images/avatars/lumina-avatar-owl.png'),
  require('@/assets/images/avatars/lumina-avatar-shadow-panther.png'),
  require('@/assets/images/avatars/lumina-avatar-water-spirit.png'),
  require('@/assets/images/avatars/lumina-avatar-wind-sage.png'),
  require('@/assets/images/avatars/lumina-avatar-fox.png'),
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedAvatar, setSelectedAvatar] =
    useState<number | null>(null);

  const [displayName, setDisplayName] =
    useState('');

  const [userEmail, setUserEmail] = useState('');

  const [profilePhoto, setProfilePhoto] =
    useState<string | null>(null);

  const handleLogout = async () => {

    console.log('LOGOUT PRESSED');

    await logout();

    router.replace('/login');
  };

  useFocusEffect(
    React.useCallback(() => {

      loadProfile();

    }, [])
  );

  const loadProfile = async () => {

    const avatar =
      await AsyncStorage.getItem(
        'lumina_avatar'
      );

    const savedName =
      await AsyncStorage.getItem(
        'lumina_display_name'
      );

    const savedPhoto =
      await AsyncStorage.getItem(
        'lumina_profile_photo'
      );

    if (avatar !== null) {

      setSelectedAvatar(Number(avatar));

    }

    setDisplayName(savedName || '');

    setProfilePhoto(savedPhoto || null);

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      setUserEmail(session.user.email);

    }

  }

  return (
    <LinearGradient
      colors={['#FAF7F2', '#F4F6FF', '#EEF2FF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: LUMINA_LOGO_SMALL_COLOR }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#FF9A6C', '#FF6B8A', '#9B6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHeader}
          >
            <View style={styles.avatarContainer}>
              {profilePhoto ? (

                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.avatar}
                />

              ) : selectedAvatar !== null ? (

                <Image
                  source={avatars[selectedAvatar]}
                  style={styles.avatar}
                />

              ) : user?.picture ? (

                <Image
                  source={{ uri: user.picture }}
                  style={styles.avatar}
                />

              ) : (

                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {displayName[0]?.toUpperCase()}
                  </Text>
                </View>

              )}
            </View>
            <Text style={styles.userName}>
              {displayName || 'Usuario'}
            </Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </LinearGradient>

          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#7B61FF"
                />
              </View>
              <Text style={styles.menuText}>Editar Perfil</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/notifications')}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#7B61FF"
                />
              </View>

              <Text style={styles.menuText}>
                Notificaciones
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings')}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="settings-outline" size={22} color="#7B61FF" />
              </View>
              <Text style={styles.menuText}>Configuración</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/help-support')}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="help-circle-outline" size={22} color="#7B61FF" />
              </View>
              <Text style={styles.menuText}>Ayuda y Soporte</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/about')}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="information-circle-outline" size={22} color="#7B61FF" />
              </View>
              <Text style={styles.menuText}>Acerca de</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
              <View style={[styles.menuIconContainer, styles.logoutIcon]}>
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              </View>
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 20,
  },
  logoImage: {
    width: 100,
    height: 36,
  },
  logo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 32,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#FF6B8A',
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeader: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  menuContainer: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  logoutItem: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 22,
  },
  logoutIcon: {
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
});
