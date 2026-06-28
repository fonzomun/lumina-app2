import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
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
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

const BACKEND_URL = 'http://192.168.1.78:8001';

// Official Lumina logo (white version for dark backgrounds)
const LUMINA_LOGO_SMALL_WHITE = 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/n1098pix_Lumina-app_small-logo-white.png';

// Category detail banner images
const BANNER_IMAGES: { [key: string]: string } = {
  morning: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/5f9okmcy_Lumina-app_morming-detail-banner.png',
  night: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/qjlywu4r_Lumina-app_night-detail-banner.png',
  love: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/54s3yal1_Lumina%20App%20export-14.png', // Emocionales - pink
  abundance: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/juwh2217_Lumina%20App%20export-15.png', // Poder Personal - yellow
  spiritual: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/7ayjq3y9_Lumina%20App%20export-16.png', // Espiritual - purple
  confidence: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/asvpktip_Lumina%20App%20export-17.png', // Sanación - teal
};

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  priority: number;
  icon: string | null;
  affirmation_count: number;
}

interface Affirmation {
  title?: string;
  text: string;
  category_id: string;
  duration: number;
  order: number;
  is_favorite: boolean;
  is_liked?: boolean;
  likes_count?: number;
  audio_url?: string;
  affirmation_id: string;
}


export default function CategoryDetailScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const router = useRouter();

  console.log(affirmations);

  const getCategoryGradient = (imageUrl: string | null): string[] => {
    switch (imageUrl) {
      case 'morning': return ['#FF9A6C', '#FFB88C', '#FFD89B'];
      case 'night': return ['#1E3A5F', '#2C5282', '#3B6AA0'];
      case 'love': return ['#FF758C', '#FF7EB3', '#FF85C0'];
      case 'abundance': return ['#56CCF2', '#2F80ED', '#4A90D9'];
      case 'spiritual': return ['#A770EF', '#CF8BF3', '#E8A4F8'];
      case 'confidence': return ['#F857A6', '#FF5858', '#FF7070'];
      default: return ['#667EEA', '#764BA2', '#8B5CF6'];
    }
  };

  const getBannerImage = (imageUrl: string | null): string | null => {
    if (imageUrl && BANNER_IMAGES[imageUrl]) {
      return BANNER_IMAGES[imageUrl];
    }
    return null;
  };

  const getIconName = (icon: string | null): keyof typeof Ionicons.glyphMap => {
    switch (icon) {
      case 'sun': return 'sunny';
      case 'moon': return 'moon';
      case 'heart': return 'heart';
      case 'star': return 'star';
      case 'sparkles': return 'sparkles';
      case 'flame': return 'flame';
      default: return 'musical-notes';
    }
  };

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      console.log("SOY EL ARCHIVO NUEVO");
      console.log("TOKEN EN FETCH:", token);
      console.log("TOKEN REAL:", token);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};


      const catResponse = await axios.get(
        `${BACKEND_URL}/api/categories/${id}`,
        { headers }
      );

      setCategory(catResponse.data);
      setAffirmations(catResponse.data.affirmations);

      console.log("AFFIRMATIONS COMPLETAS:");
      console.log(catResponse.data.affirmations);

      console.log(
        "PRIMERA AFF:",
        catResponse.data.affirmations[0]
      );

      console.log(
        "LIKED IDS:",
        catResponse.data.affirmations.filter((a: Affirmation) => a.is_liked)
      );

      setLikedIds(
        catResponse.data.affirmations
          .filter((a: any) => a.is_liked === true)
          .map((a: any) => a.affirmation_id)
      );

      const counts: Record<string, number> = {};

      catResponse.data.affirmations.forEach((a: any) => {
        counts[a.affirmation_id] = a.likes_count || 0;
      });

      setLikesCount(counts);

      setFavoriteIds(
        catResponse.data.affirmations
          .filter((a: any) => a.is_favorite === true)
          .map((a: any) => a.affirmation_id)
      );

      console.log(
        "FAVORITES CARGADOS:",
        catResponse.data.affirmations
          .filter((a: any) => a.is_favorite === true)
          .map((a: any) => a.affirmation_id)
      );

    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();

    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleToggleFavorite = async (affirmation: Affirmation) => {
    try {

      const token = await AsyncStorage.getItem('access_token');

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const isFavorite = favoriteIds.includes(
        affirmation.affirmation_id
      );

      if (isFavorite) {

        await axios.delete(
          `${BACKEND_URL}/api/favorites/${affirmation.affirmation_id}`,
          { headers }
        );

        setFavoriteIds(prev =>
          prev.filter(
            id => id !== affirmation.affirmation_id
          )
        );

      } else {

        await axios.post(
          `${BACKEND_URL}/api/favorites/${affirmation.affirmation_id}`,
          {},
          { headers }
        );

        setFavoriteIds(prev => [
          ...prev,
          affirmation.affirmation_id
        ]);

      }

    } catch (error) {

      console.error('Error toggling favorite:', error);

    }
  };

  const handlePlayAudio = async (affirmation: Affirmation) => {
    try {

      if (!affirmation.audio_url) return;

      // MISMO AUDIO
      if (
        playingId === affirmation.affirmation_id &&
        currentSound
      ) {

        const status = await currentSound.getStatusAsync();

        if (status.isLoaded && status.isPlaying) {

          await currentSound.pauseAsync();
          setIsPaused(true);

        } else {

          if (
            status.isLoaded &&
            status.positionMillis >= (status.durationMillis || 0) - 500
          ) {
            await currentSound.setPositionAsync(0);
          }

          await currentSound.playAsync();
          setIsPaused(false);
        }

        return;
      }

      // OTRO AUDIO
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({
        uri: affirmation.audio_url,
      });

      setCurrentSound(sound);
      setPlayingId(affirmation.affirmation_id);
      setIsPaused(false);

      sound.setOnPlaybackStatusUpdate((status) => {

        if (!status.isLoaded) return;

        setPlaybackPosition(status.positionMillis || 0);
        setPlaybackDuration(status.durationMillis || 1);

        if (status.didJustFinish) {

          setIsPaused(true);
        }
      });

      await sound.setRateAsync(playbackRate, true);
      await sound.playAsync();

    } catch (error) {
      console.log('Audio playback error:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryDisplayName = (name: string): string => {
    if (name.includes('Mañana')) return 'La Mañana';
    if (name.includes('Dormir')) return 'Antes de Dormir';
    if (name.includes('Amor')) return 'Amor';
    if (name.includes('Abundancia')) return 'Abundancia';
    if (name.includes('Espiritual')) return 'Espirituales';
    if (name.includes('Confianza')) return 'Confianza';
    return name;
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#FF9A6C', '#FF8A7A', '#E07AFF']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={category ? getCategoryGradient(category.image_url) : ['#FF9A6C', '#FF8A7A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: LUMINA_LOGO_SMALL_WHITE }}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

        </View>

        {/* Category Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerGradient}>
            {/* Banner Image */}
            {category && getBannerImage(category.image_url) ? (
              <Image
                source={{ uri: getBannerImage(category.image_url) || '' }}
                style={styles.bannerImageActual}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={category ? getCategoryGradient(category.image_url) : ['#FFD89B', '#F5A962']}
                style={styles.bannerImage}
              >
                <View style={styles.mountainsContainer}>
                  <View style={[styles.mountain, styles.mountain1]} />
                  <View style={[styles.mountain, styles.mountain2]} />
                  <View style={[styles.mountain, styles.mountain3]} />
                </View>
              </LinearGradient>
            )}

            <View style={styles.bannerContent}>
              <View style={styles.bannerTitleRow}>
                <Text style={styles.bannerSubtitle}>MEDITACIÓN PARA</Text>
                <Ionicons name="musical-notes" size={24} color="#1E3A5F" />
              </View>
              <Text style={styles.bannerTitle}>
                {category ? getCategoryDisplayName(category.name) : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Affirmations List */}
        <View style={styles.listContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.scrollContent}
          >
            {affirmations.map((affirmation, index) => (
              <View key={affirmation.affirmation_id} style={styles.affirmationCard}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => handlePlayAudio(affirmation)}
                >
                  <LinearGradient
                    colors={String(playingId) === String(affirmation.affirmation_id) ? ['#FF6B8A', '#FF9A6C'] : ['#F5A623', '#FF9500']}
                    style={styles.playButtonGradient}
                  >
                    {String(playingId) === String(affirmation.affirmation_id) ? (
                      <Ionicons
                        name={
                          String(playingId) === String(affirmation.affirmation_id) &&
                            !isPaused
                            ? "pause"
                            : "play"
                        }
                        size={12}
                      />
                    ) : (
                      <Text style={styles.playButtonNumber}>
                        {index + 1}.
                      </Text>
                    )}

                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.affirmationContent}>
                  <Text style={styles.affirmationText} numberOfLines={2}>
                    {affirmation.title || affirmation.text}
                  </Text>
                  <View style={styles.progressContainer}>

                    <Text style={styles.timeText}>
                      {String(playingId) === String(affirmation.affirmation_id)
                        ? formatDuration(Math.floor(playbackPosition / 1000))
                        : '0:00'}
                    </Text>
                    <View style={styles.progressBar}>
                      <Slider
                        style={{
                          flex: 1,
                          height: 20,
                          marginLeft: -10,
                          marginRight: -10,
                        }}
                        minimumValue={0}
                        maximumValue={playbackDuration}
                        value={
                          String(playingId) === String(affirmation.affirmation_id)
                            ? playbackPosition
                            : 0
                        }
                        minimumTrackTintColor="#1E3A5F"
                        maximumTrackTintColor="#E5E7EB"
                        thumbTintColor="#1E3A5F"
                        thumbStyle={{ width: 12, height: 12 }}
                        onValueChange={async (value) => {

                          if (
                            currentSound &&
                            String(playingId) === String(affirmation.affirmation_id)
                          ) {

                            await currentSound.setPositionAsync(value);
                            setPlaybackPosition(value);
                          }

                        }}
                      />
                    </View>
                    <Text style={styles.timeText}>
                      {String(playingId) === String(affirmation.affirmation_id)
                        ? formatDuration(Math.floor(playbackDuration / 1000))
                        : formatDuration(affirmation.duration)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleToggleFavorite(affirmation)}
                >
                  <Ionicons
                    name={
                      favoriteIds.includes(affirmation.affirmation_id)
                        ? 'bookmark'
                        : 'bookmark-outline'
                    }
                    size={22}
                    color={
                      favoriteIds.includes(affirmation.affirmation_id)
                        ? '#1E3A5F'
                        : '#9CA3AF'
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.likesContainer}
                  onPress={async () => {

                    try {

                      const token = await AsyncStorage.getItem('access_token');

                      const response = await axios.post(
                        `${BACKEND_URL}/api/likes/${affirmation.affirmation_id}`,
                        {},
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      console.log('LIKE RESPONSE', response.data);

                      if (response.data.liked) {

                        setLikedIds(prev => [
                          ...prev,
                          affirmation.affirmation_id
                        ]);

                      } else {

                        setLikedIds(
                          prev =>
                            prev.filter(
                              id => id !== affirmation.affirmation_id
                            )
                        );

                      }

                      setLikesCount({
                        ...likesCount,
                        [affirmation.affirmation_id]:
                          response.data.likes_count
                      });

                    } catch (error) {
                      console.log('Error toggling like:', error);
                    }

                  }}
                >

                  <Ionicons
                    name={
                      likedIds.includes(affirmation.affirmation_id)
                        ? 'heart'
                        : 'heart-outline'
                    }
                    size={22}
                    color={
                      likedIds.includes(affirmation.affirmation_id)
                        ? '#FF6B9D'
                        : '#D1A3B8'
                    }
                  />

                  <Text style={styles.likesText}>
                    {likesCount[affirmation.affirmation_id] || 0}
                  </Text>

                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView >
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'column',
  },
  logoImage: {
    width: 100,
    height: 36,
    marginBottom: 4,
  },
  logo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  backText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerImage: {
    height: 120,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bannerImageActual: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  mountainsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  mountain: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  mountain1: {
    left: '10%',
    width: 120,
    height: 60,
  },
  mountain2: {
    left: '30%',
    width: 180,
    height: 90,
  },
  mountain3: {
    right: '10%',
    width: 140,
    height: 70,
  },
  bannerContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  bannerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  affirmationCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  playButton: {
    marginRight: 12,
  },
  playButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  affirmationContent: {
    flex: 1,
  },
  affirmationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A5F',
    marginBottom: 8,
    lineHeight: 19,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
    width: 28,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
    marginHorizontal: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E3A5F',
    borderRadius: 1,
  },
  favoriteButton: {
    padding: 6,
    marginLeft: 8,
  },
  moreButton: {
    padding: 6,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
  },
  likesText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: -1,
  },

});
