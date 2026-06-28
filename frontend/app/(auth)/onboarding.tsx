import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    Image,
    ImageBackground,
    Modal,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const LUMINA_LOGO_BIG_COLOR =
    'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/bmr6bqte_Lumina-app_big-logo-color.png';


const birthYears = Array.from(
    { length: 101 },
    (_, i) => String(1950 + i)
);

const countries = [
    'Afganistán',
    'Albania',
    'Alemania',
    'Andorra',
    'Angola',
    'Antigua y Barbuda',
    'Arabia Saudita',
    'Argelia',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaiyán',
    'Bahamas',
    'Bangladés',
    'Barbados',
    'Baréin',
    'Bélgica',
    'Belice',
    'Benín',
    'Bielorrusia',
    'Birmania',
    'Bolivia',
    'Bosnia y Herzegovina',
    'Botsuana',
    'Brasil',
    'Brunéi',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Bután',
    'Cabo Verde',
    'Camboya',
    'Camerún',
    'Canadá',
    'Catar',
    'Chad',
    'Chile',
    'China',
    'Chipre',
    'Colombia',
    'Comoras',
    'Corea del Norte',
    'Corea del Sur',
    'Costa de Marfil',
    'Costa Rica',
    'Croacia',
    'Cuba',
    'Dinamarca',
    'Dominica',
    'Ecuador',
    'Egipto',
    'El Salvador',
    'Emiratos Árabes Unidos',
    'Eritrea',
    'Eslovaquia',
    'Eslovenia',
    'España',
    'Estados Unidos',
    'Estonia',
    'Esuatini',
    'Etiopía',
    'Filipinas',
    'Finlandia',
    'Fiyi',
    'Francia',
    'Gabón',
    'Gambia',
    'Georgia',
    'Ghana',
    'Granada',
    'Grecia',
    'Guatemala',
    'Guyana',
    'Guinea',
    'Guinea-Bisáu',
    'Guinea Ecuatorial',
    'Haití',
    'Honduras',
    'Hungría',
    'India',
    'Indonesia',
    'Irak',
    'Irán',
    'Irlanda',
    'Islandia',
    'Islas Marshall',
    'Islas Salomón',
    'Israel',
    'Italia',
    'Jamaica',
    'Japón',
    'Jordania',
    'Kazajistán',
    'Kenia',
    'Kirguistán',
    'Kiribati',
    'Kuwait',
    'Laos',
    'Lesoto',
    'Letonia',
    'Líbano',
    'Liberia',
    'Libia',
    'Liechtenstein',
    'Lituania',
    'Luxemburgo',
    'Madagascar',
    'Malasia',
    'Malaui',
    'Maldivas',
    'Malí',
    'Malta',
    'Marruecos',
    'Mauricio',
    'Mauritania',
    'México',
    'Micronesia',
    'Moldavia',
    'Mónaco',
    'Mongolia',
    'Montenegro',
    'Mozambique',
    'Namibia',
    'Nauru',
    'Nepal',
    'Nicaragua',
    'Níger',
    'Nigeria',
    'Noruega',
    'Nueva Zelanda',
    'Omán',
    'Países Bajos',
    'Pakistán',
    'Palaos',
    'Panamá',
    'Papúa Nueva Guinea',
    'Paraguay',
    'Perú',
    'Polonia',
    'Portugal',
    'Reino Unido',
    'República Centroafricana',
    'República Checa',
    'República del Congo',
    'República Democrática del Congo',
    'República Dominicana',
    'Ruanda',
    'Rumania',
    'Rusia',
    'Samoa',
    'San Cristóbal y Nieves',
    'San Marino',
    'San Vicente y las Granadinas',
    'Santa Lucía',
    'Santo Tomé y Príncipe',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leona',
    'Singapur',
    'Siria',
    'Somalia',
    'Sri Lanka',
    'Sudáfrica',
    'Sudán',
    'Sudán del Sur',
    'Suecia',
    'Suiza',
    'Surinam',
    'Tailandia',
    'Tanzania',
    'Tayikistán',
    'Timor Oriental',
    'Togo',
    'Tonga',
    'Trinidad y Tobago',
    'Túnez',
    'Turkmenistán',
    'Turquía',
    'Tuvalu',
    'Ucrania',
    'Uganda',
    'Uruguay',
    'Uzbekistán',
    'Vanuatu',
    'Vaticano',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Yibuti',
    'Zambia',
    'Zimbabue',
];

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
]
export default function OnboardingScreen() {
    const router = useRouter();

    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)

    const [openDropdown, setOpenDropdown] =
        useState<string | null>(null);

    const [birthYear, setBirthYear] = useState('');
    const [gender, setGender] = useState('');
    const [country, setCountry] = useState('');
    const [displayName, setDisplayName] = useState('');

    const renderDropdown = (
        label: string,
        value: string,
        setValue: (value: string) => void,
        options: string[],
        keyName: string
    ) => {

        const isOpen = openDropdown === keyName;

        return (
            <View style={{ marginBottom: 22 }}>

                <Text style={styles.label}>
                    {label}
                </Text>

                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setOpenDropdown(keyName)}
                >

                    <Text
                        style={[
                            styles.dropdownButtonText,
                            !value && { color: '#9CA3AF' }
                        ]}
                    >
                        {value || `Selecciona ${label.toLowerCase()}`}
                    </Text>

                    <Ionicons
                        name="chevron-down"
                        size={20}
                        color="#6B7280"
                    />

                </TouchableOpacity>

                <Modal
                    visible={isOpen}
                    transparent
                    animationType="fade"
                >

                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setOpenDropdown(null)}
                    >

                        <View style={styles.modalContent}>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                            >

                                {options.map((option) => {

                                    const selected = value === option;

                                    return (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.dropdownItem,
                                                selected &&
                                                styles.dropdownItemSelected
                                            ]}
                                            onPress={() => {
                                                setValue(option);
                                                setOpenDropdown(null);
                                            }}
                                        >

                                            <Text
                                                style={[
                                                    styles.dropdownItemText,
                                                    selected &&
                                                    styles.dropdownItemTextSelected
                                                ]}
                                            >
                                                {option}
                                            </Text>

                                        </TouchableOpacity>
                                    );
                                })}

                            </ScrollView>

                        </View>

                    </TouchableOpacity>

                </Modal>

            </View>
        );
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

            await AsyncStorage.setItem(
                'lumina_profile_photo',
                imageUri
            );

        }

    };

    const handleContinue = async () => {

        try {

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user?.id) {
                return;
            }

            const userId = session.user.id;

            await AsyncStorage.setItem(
                'lumina_birth_year',
                birthYear
            );

            await AsyncStorage.setItem(
                'lumina_gender',
                gender
            );

            await AsyncStorage.setItem(
                'lumina_country',
                country
            );

            await AsyncStorage.setItem(
                'lumina_display_name',
                displayName
            );

            await AsyncStorage.setItem(
                'lumina_avatar',
                String(selectedAvatar)
            );

            await AsyncStorage.setItem(
                'lumina_onboarding_complete',
                'true'
            );

            await supabase
                .from('profiles')
                .update({
                    display_name: displayName,
                    avatar:
                        selectedAvatar !== null
                            ? String(selectedAvatar)
                            : null,
                    birth_year: birthYear,
                    gender,
                    country,
                })
                .eq('id', userId);

            router.replace('/(tabs)/home');

        } catch (error) {

            console.log('Error saving onboarding:', error);

        }

    };

    return (
        <ImageBackground
            source={require('../../assets/images/onboarding-bg.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <Image
                    source={{ uri: LUMINA_LOGO_BIG_COLOR }}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.contentWrapper}>
                    <View style={styles.contentContainer}>

                        <Text style={styles.title}>
                            Completa tu Perfil
                        </Text>

                        <Text style={styles.inputLabel}>Nombre de Usuario</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ej. Fonzo"
                            value={displayName}
                            onChangeText={setDisplayName}
                        />

                        {renderDropdown(
                            'Año de nacimiento',
                            birthYear,
                            setBirthYear,
                            birthYears,
                            'birthYear'
                        )}

                        {renderDropdown(
                            'Género',
                            gender,
                            setGender,
                            [
                                'Masculino',
                                'Femenino',
                                'Prefiero no responder'
                            ],
                            'gender'
                        )}

                        {renderDropdown(
                            'País',
                            country,
                            setCountry,
                            countries,
                            'country'
                        )}

                        <Text style={styles.avatarTitle}>
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
                                    onPress={() => setSelectedAvatar(index)}
                                >
                                    <Image
                                        source={avatar}
                                        style={styles.avatarImage}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.customPhotoButton}
                            onPress={handlePickImage}
                        >
                            <Ionicons
                                name="image-outline"
                                size={18}
                                color="#7B61FF"
                            />

                            <Text style={styles.customPhotoText}>
                                Usar mi foto
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleContinue}
                        >
                            <Text style={styles.continueButtonText}>
                                Continuar
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>

            </ScrollView>

        </ImageBackground>
    );
}

const styles = StyleSheet.create({

    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 95,
        paddingBottom: 40,
    },

    logo: {
        width: 220,
        height: 50,
        alignSelf: 'center',
        marginTop: 0,
        marginBottom: 10,
    },

    contentWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 34,
        marginTop: 10,
        marginHorizontal: 10,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 8,
    },

    contentContainer: {
        paddingHorizontal: 34,
        paddingTop: 40,
        paddingBottom: 50,
    },

    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#0B3B78',
        marginBottom: 34,
        lineHeight: 40,
    },

    inputLabel: {
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
        marginBottom: 10,
    },

    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 10,
    },

    dropdownButton: {
        height: 58,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ECECEC',
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    dropdownButtonText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 12,
        maxHeight: 320,
    },

    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 4,
    },

    dropdownItemSelected: {
        backgroundColor: '#F1EBFF',
    },

    dropdownItemText: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },

    dropdownItemTextSelected: {
        color: '#8B5CF6',
        fontWeight: '700',
    },

    customPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 2,
        borderColor: '#7B61FF',
        borderRadius: 24,

        paddingVertical: 14,

        marginTop: 6,
        marginBottom: 20,

        backgroundColor: '#FFFFFF',
    },

    customPhotoText: {
        color: '#7B61FF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },

    continueButton: {
        backgroundColor: '#7B61FF',
        borderRadius: 28,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 0,
    },

    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },

    avatarTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E3A5F',
        marginTop: 24,
        marginBottom: 16,
    },

    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    avatarItem: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 20,
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
});