import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const FAVORITES_BANNER = require('../../assets/images/lumina-app-cat-favoritos.png');

const BACKEND_URL = "http://192.168.1.78:8001";

const LUMINA_LOGO_SMALL_COLOR = 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/vo6dtgtz_Lumina-app_small-logo-color.png';

interface Affirmation {
  id: string;
  text: string;
  category_id: string;
  duration: number;
  is_favorite: boolean;
  audio_url?: string;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
      return () => {
        setPlayingId(null);
      };
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleRemoveFavorite = async (affirmationId: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.delete(`${BACKEND_URL}/api/favorites/${affirmationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(favorites.filter(f => f.id !== affirmationId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handlePlayAudio = async (affirmation: Affirmation) => {
    try {

      if (affirmation.audio_url) {

        const { sound } = await Audio.Sound.createAsync({
          uri: affirmation.audio_url,
        });

        setPlayingId(affirmation.id);

        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status) => {
          if ('didJustFinish' in status && status.didJustFinish) {
            setPlayingId(null);
            sound.unloadAsync();
          }
        });
      }

    } catch (error) {
      console.log('Audio playback error:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FF9A6C', '#FF8A7A', '#E07AFF']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFF5F0', '#FFF0F5', '#F5F0FF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        <View style={styles.header}>
          <Image
            source={{ uri: LUMINA_LOGO_SMALL_COLOR }}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Ionicons name="arrow-back" size={24} color="#1C3354" />
          </TouchableOpacity>
        </View>
        <View style={styles.bannerCard}>
          <Image
            source={FAVORITES_BANNER}
            style={styles.bannerImage}
            resizeMode="cover"
          />

          <View style={styles.bannerContent}>
            <View>
              <Text style={styles.bannerLabel}>TUS MEDITACIONES</Text>
              <Text style={styles.bannerTitle}>Favoritas</Text>
            </View>

            <Ionicons
              name="bookmark"
              size={24}
              color="#1C3354"
              style={{ opacity: 0.95 }}
            />
          </View>
        </View>
        <Text style={styles.pageSubtitle}>
          {favorites.length} afirmaciones guardadas
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.scrollContent}
        >
          {favorites.map((affirmation, index) => (
            <View key={(affirmation as any).affirmation_id || affirmation.id} style={styles.affirmationCard}>

              <TouchableOpacity
                style={styles.playButton}
                onPress={() => handlePlayAudio(affirmation)}
              >
                <LinearGradient
                  colors={playingId === affirmation.id ? ['#FF6B8A', '#FF9A6C'] : ['#F5A623', '#FF9500']}
                  style={styles.playButtonGradient}
                >
                  <Text style={styles.playButtonNumber}>{index + 1}</Text>
                  {playingId === affirmation.id && (
                    <Ionicons name="pause" size={12} color="#FFF" style={styles.playIcon} />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.affirmationContent}>
                <Text style={styles.affirmationText}>
                  {affirmation.text}
                </Text>

                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>0:00</Text>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { width: playingId === affirmation.id ? '50%' : '0%' }
                    ]} />
                  </View>
                  <Text style={styles.timeText}>{formatDuration(affirmation.duration)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => handleRemoveFavorite((affirmation as any).affirmation_id || affirmation.id)}
              >
                <Ionicons name="bookmark" size={22} color="#1E3A5F" />
              </TouchableOpacity>

            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 8, marginBottom: 16 },
  logoImage: { width: 100, height: 36 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: '#1E3A5F', paddingHorizontal: 20 },
  pageSubtitle: { fontSize: 14, color: '#6B7280', paddingHorizontal: 20, marginBottom: 20 },
  scrollContent: {
    paddingHorizontal: 20,

    backgroundColor: '#FFF',

    flexGrow: 1,
    paddingBottom: 120,

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    marginTop: 8,
  },
  affirmationCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: { marginRight: 14 },
  playButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonNumber: { color: '#FFF', fontWeight: '700' },
  playIcon: { position: 'absolute', bottom: 4, right: 4 },
  affirmationContent: { flex: 1 },
  affirmationText: { fontSize: 15, color: '#1E3A5F' },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 11, color: '#9CA3AF' },
  progressBar: { flex: 1, height: 3, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
  progressFill: { height: '100%', backgroundColor: '#F5A623' },
  favoriteButton: { padding: 8 },

  bannerCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',

    marginHorizontal: 20,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 8,
  },

  bannerImage: {
    width: '100%',
    height: 220,
  },

  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,

    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  bannerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },

  bannerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1E3A5F',
    marginTop: 4,
  },

  backButton: {
    position: 'absolute',
    right: 20,
    top: 6,

    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor: 'rgba(28, 51, 84, 0.12)',

    alignItems: 'center',
    justifyContent: 'center',
  },
});