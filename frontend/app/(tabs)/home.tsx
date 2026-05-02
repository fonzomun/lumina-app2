import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = "http://127.0.0.1:8001";
const { width } = Dimensions.get('window');

// Official Lumina logo
const LUMINA_LOGO_SMALL_COLOR = 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/vo6dtgtz_Lumina-app_small-logo-color.png';

// Home tagline image
const TAGLINE_IMAGE = 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/qeeqtysi_lumina-fondo-app-texto-trasciende.png';

// Promotional banner
const PROMO_BANNER_IMAGE = 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/hqnowwia_lumina-app-comunidad-curso-abundancia-banner.png';
const PROMO_BANNER_LINK = 'https://www.comunidadlumina.com/curso-landing-5';

// Category card background images
const CARD_IMAGES = {
  morning: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/3719nh7p_Lumina-app_large-card.png',
  night: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/3aud4ir5_Lumina-app_medium-card.png',
};

// Small category card images
const SMALL_CARD_IMAGES: { [key: string]: string } = {
  love: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/qly4gqng_Lumina%20App%20export-10.png', // Emocionales
  abundance: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/7xf36okz_Lumina%20App%20export-11.png', // Poder Personal
  spiritual: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/nzayjyfs_Lumina%20App%20export-12.png', // Espiritual
  confidence: 'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/s3vfnnj2_Lumina%20App%20export-13.png', // Sanación
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

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
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

  const getCategoryGradient = (imageUrl: string | null): string[] => {
    switch (imageUrl) {
      case 'morning': return ['#FFD89B', '#F5A962', '#E8926C'];
      case 'night': return ['#2C3E50', '#34495E', '#2C3E50'];
      case 'love': return ['#FF758C', '#FF7EB3', '#FF758C'];
      case 'abundance': return ['#56CCF2', '#2F80ED', '#56CCF2'];
      case 'spiritual': return ['#A770EF', '#CF8BF3', '#FDB99B'];
      case 'confidence': return ['#F857A6', '#FF5858', '#F857A6'];
      default: return ['#667EEA', '#764BA2', '#667EEA'];
    }
  };

  const getSmallCardImage = (imageUrl: string | null): string | null => {
    if (imageUrl && SMALL_CARD_IMAGES[imageUrl]) {
      return SMALL_CARD_IMAGES[imageUrl];
    }
    return null;
  };

  const handlePromoBannerPress = () => {
    Linking.openURL(PROMO_BANNER_LINK);
  };

  const largeCategories = categories.filter(c => c.priority === 1);
  const mediumCategories = categories.filter(c => c.priority === 2);
  const smallCategories = categories.filter(c => c.priority === 3);

  const firstName = user?.name?.split(' ')[0] || 'Usuario';

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
      colors={['#FFFFFF', '#FFF8F5', '#FFF5F0', '#FFF0F5', '#F5F0FF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: LUMINA_LOGO_SMALL_COLOR }}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* User Greeting */}
          <View style={styles.greetingContainer}>
            <View style={styles.avatarContainer}>
              {user?.picture ? (
                <Image source={{ uri: user.picture }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={['#FF9A6C', '#FF6B8A']}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
                </LinearGradient>
              )}
            </View>
            <Text style={styles.greeting}>Hola {firstName}</Text>
          </View>

          {/* Tagline Image */}
          <View style={styles.taglineContainer}>
            <Image
              source={{ uri: TAGLINE_IMAGE }}
              style={styles.taglineImage}
              resizeMode="contain"
            />
          </View>

          {/* Large Categories (Morning) */}
          {largeCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.largeCard}
              onPress={() => router.push(`/category/${category.id}`)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: CARD_IMAGES.morning }}
                style={styles.largeCardImage}
                resizeMode="cover"
              />
              <View style={styles.cardOverlay}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardSubtitle}>MEDITACIONES PARA</Text>
                  <Text style={styles.cardTitle}>
                    {category.name.includes('Mañana') ? 'LA MAÑANA' : category.name.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Medium Categories (Night) */}
          {mediumCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.mediumCard}
              onPress={() => router.push(`/category/${category.id}`)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: CARD_IMAGES.night }}
                style={styles.mediumCardImage}
                resizeMode="cover"
              />
              <View style={styles.cardOverlay}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="musical-notes" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardSubtitle}>MEDITACIONES PARA</Text>
                  <Text style={styles.mediumCardTitle}>
                    {category.name.includes('Dormir') ? 'ANTES DE DORMIR' : category.name.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Small Categories Grid */}
          <View style={styles.smallCategoriesGrid}>
            {smallCategories.map((category) => {
              const smallImage = getSmallCardImage(category.image_url);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.smallCard}
                  onPress={() => router.push(`/category/${category.id}`)}
                  activeOpacity={0.9}
                >
                  {smallImage ? (
                    <Image
                      source={{ uri: smallImage }}
                      style={styles.smallCardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={getCategoryGradient(category.image_url)}
                      style={styles.smallCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={getIconName(category.icon)} size={28} color="#FFFFFF" />
                      <Text style={styles.smallCardTitle} numberOfLines={2}>
                        {category.name.replace('Afirmaciones de ', '').replace('Afirmaciones ', '')}
                      </Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Promotional Banner */}
          <TouchableOpacity 
            style={styles.promoBanner}
            onPress={handlePromoBannerPress}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: PROMO_BANNER_IMAGE }}
              style={styles.promoBannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 16,
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 138, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  taglineContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  taglineImage: {
    width: '85%',
    height: 100,
  },
  tagline1: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  tagline2: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7B61FF',
  },
  largeCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    height: 160,
  },
  largeCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 20,
  },
  largeCardGradient: {
    height: 160,
    padding: 20,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  mediumCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    height: 120,
  },
  mediumCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 20,
  },
  mediumCardGradient: {
    height: 120,
    padding: 16,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  cardOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  cardIconContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mediumCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardDecoration: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  smallCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  smallCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  smallCardGradient: {
    height: 100,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCardImage: {
    width: '100%',
    height: 100,
    borderRadius: 16,
  },
  smallCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  promoBanner: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  promoBannerImage: {
    width: '100%',
    height: 160,
    borderRadius: 20,
  },
});
