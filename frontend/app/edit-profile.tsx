import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

import { supabase } from '../lib/supabase';

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

const genders = [
    'Masculino',
    'Femenino',
    'Prefiero no decirlo',
];

const countries = [
    'Afganistán',
    'Albania',
    'Alemania',
    'Andorra',
    'Angola',
    'Arabia Saudita',
    'Argentina',
    'Australia',
    'Austria',
    'Bélgica',
    'Bolivia',
    'Brasil',
    'Canadá',
    'Chile',
    'China',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Dinamarca',
    'Ecuador',
    'Egipto',
    'El Salvador',
    'España',
    'Estados Unidos',
    'Filipinas',
    'Finlandia',
    'Francia',
    'Grecia',
    'Guatemala',
    'Honduras',
    'India',
    'Irlanda',
    'Israel',
    'Italia',
    'Japón',
    'México',
    'Nicaragua',
    'Noruega',
    'Nueva Zelanda',
    'Panamá',
    'Paraguay',
    'Perú',
    'Portugal',
    'Reino Unido',
    'República Dominicana',
    'Suecia',
    'Suiza',
    'Uruguay',
    'Venezuela',
];

export default function EditProfileScreen() {

    const [displayName, setDisplayName] = useState('');

    const router = useRouter();

    const [country, setCountry] = useState('');
    const [gender, setGender] = useState('');

    const [profilePhoto, setProfilePhoto] =
        useState<string | null>(null);

    const [selectedAvatar, setSelectedAvatar] =
        useState<number | null>(null);

    useEffect(() => {

        loadProfile();

    }, []);

    const loadProfile = async () => {

        const { data: { session } } =
            await supabase.auth.getSession();

        if (!session?.user?.id) {
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profile) {

            setDisplayName(profile.display_name || '');
            setCountry(profile.country || '');
            setGender(profile.gender || '');

            if (profile.avatar !== null) {
                setSelectedAvatar(Number(profile.avatar));
            }

        }

        const savedPhoto =
            await AsyncStorage.getItem(
                'lumina_profile_photo'
            );

        if (savedPhoto) {
            setProfilePhoto(savedPhoto);
        }

    };

    const handlePickImage = async () => {

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

        if (!result.canceled) {

            const imageUri = result.assets[0].uri;

            setProfilePhoto(imageUri);

            await AsyncStorage.setItem(
                'lumina_profile_photo',
                imageUri
            );

        }

    };

    const handleSave = async () => {

        const { data: { session } } =
            await supabase.auth.getSession();

        if (!session?.user?.id) {
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                display_name: displayName,
                country,
                gender,
                avatar:
                    selectedAvatar !== null
                        ? String(selectedAvatar)
                        : null,
            })
            .eq('id', session.user.id);
        console.log("SAVE ERROR:", error);

        if (error) {
            Alert.alert(error.message);
            return;
        }

        await AsyncStorage.setItem(
            'lumina_display_name',
            displayName
        );
        if (selectedAvatar !== null) {

            await AsyncStorage.setItem(
                'lumina_avatar',
                String(selectedAvatar)
            );

        }

        Alert.alert(
            'Perfil actualizado'
        );

        router.back();

    };

    return (
        <LinearGradient
            colors={['#FAF7F2', '#F4F6FF', '#EEF2FF']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 24,
                        }}
                    >

                        <Text style={styles.title}>
                            Editar Perfil
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.replace('/(tabs)/profile')}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: '#FFE0D1',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={22}
                                color="#F28C64"
                            />
                        </TouchableOpacity>

                    </View>

                    <View style={styles.avatarSection}>

                        {profilePhoto ? (

                            <Image
                                source={{ uri: profilePhoto }}
                                style={styles.mainAvatar}
                            />

                        ) : selectedAvatar !== null ? (

                            <Image
                                source={avatars[selectedAvatar]}
                                style={styles.mainAvatar}
                            />

                        ) : null}

                        <TouchableOpacity
                            style={styles.photoButton}
                            onPress={handlePickImage}
                        >
                            <Text style={styles.photoButtonText}>
                                Usar mi foto
                            </Text>
                        </TouchableOpacity>

                    </View>

                    <Text style={styles.label}>
                        Nombre de Usuario
                    </Text>

                    <TextInput
                        style={styles.input}
                        value={displayName}
                        onChangeText={setDisplayName}
                    />

                    <Text style={styles.label}>
                        País
                    </Text>

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={country}
                            onValueChange={(itemValue) =>
                                setCountry(itemValue)
                            }
                        >
                            <Picker.Item
                                label="Selecciona tu país"
                                value=""
                            />

                            {countries.map((item) => (
                                <Picker.Item
                                    key={item}
                                    label={item}
                                    value={item}
                                />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>
                        Género
                    </Text>

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={gender}
                            onValueChange={(itemValue) =>
                                setGender(itemValue)
                            }
                        >
                            <Picker.Item
                                label="Selecciona tu género"
                                value=""
                            />

                            {genders.map((item) => (
                                <Picker.Item
                                    key={item}
                                    label={item}
                                    value={item}
                                />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>
                        Elige tu energía
                    </Text>

                    <View style={styles.avatarGrid}>

                        {avatars.map((avatar, index) => (

                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.avatarItem,
                                    selectedAvatar === index &&
                                    styles.avatarSelected,
                                ]}
                                onPress={() =>
                                    setSelectedAvatar(index)
                                }
                            >
                                <Image
                                    source={avatar}
                                    style={styles.avatarImage}
                                />
                            </TouchableOpacity>

                        ))}

                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>
                            Guardar cambios
                        </Text>
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

    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },

    title: {
        fontSize: 34,
        fontWeight: '700',
        color: '#1E3A5F',
    },

    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },

    mainAvatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 14,
    },

    photoButton: {
        borderWidth: 1,
        borderColor: '#7B61FF',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },

    photoButtonText: {
        color: '#7B61FF',
        fontWeight: '600',
    },

    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E3A5F',
        marginBottom: 8,
        marginTop: 12,
    },

    input: {
        width: '100%',
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 18,
        fontSize: 16,
        color: '#1E3A5F',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 14,
    },

    avatarItem: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 14,
        borderWidth: 3,
        borderColor: 'transparent',
    },

    avatarSelected: {
        borderColor: '#7B61FF',
    },

    avatarImage: {
        width: '100%',
        height: '100%',
    },

    saveButton: {
        height: 58,
        backgroundColor: '#7B61FF',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },

    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },

});