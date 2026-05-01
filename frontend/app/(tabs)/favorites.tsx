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
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

const BACKEND_URL = "http://127.0.0.1:8001";

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
        Speech.stop();
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
    if (playingId === affirmation.id) {
      await Speech.stop();
      setPlayingId(null);
    } else {
      await Speech.stop();
      setPlayingId(affirmation.id);

      if (affirmation.audio_url) {
        const { sound } = await Audio.Sound.createAsync({
          uri: affirmation.audio_url,
        });
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status) => {
          if ((status as any).didJustFinish) {
            setPlayingId(null);
          }
        });
      } else {
        Speech.speak(affirmation.text, {
          language: 'es-ES',
          pitch: 1.0,
          rate: 0.9,
          onDone: () => setPlayingId(null),
          onError: () => setPlayingId(null),
        });
      }
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
          <Image source={{ uri: LUMINA_LOGO_SMALL_COLOR }} style={styles.logoImage} resizeMode="contain" />
        </View>

        <Text style={styles.pageTitle}>Mis Favoritos</Text>
        <Text style={styles.pageSubtitle}>
          {favorites.length} afirmaciones guardadas
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.scrollContent}
        >
          {favorites.map((affirmation, index) => (
            <View key={affirmation.id} style={styles.affirmationCard}>

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
                onPress={() => handleRemoveFavorite(affirmation.id)}
              >
                <Ionicons name="heart" size={22} color="#FF6B8A" />
              </TouchableOpacity>

            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
  scrollContent: { paddingHorizontal: 20 },
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
  favoriteButton: { padding: 8 }
});