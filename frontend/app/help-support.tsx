import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    ScrollView,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HelpSupportScreen() {

    const router = useRouter();

    const openEmail = () => {
        Linking.openURL(
            'mailto:luminatransforma@gmail.com?subject=Soporte Lumina'
        );
    };

    return (
        <LinearGradient
            colors={['#FAF7F2', '#F4F6FF', '#EEF2FF']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>

                <View style={styles.header}>

                    <Text style={styles.title}>
                        Ayuda y Soporte
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color="#F28C64"
                        />
                    </TouchableOpacity>

                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                >

                    <View style={styles.card}>

                        <Text style={styles.description}>
                            Estamos aquí para ayudarte. Si tienes algún problema con la aplicación o alguna duda sobre tu cuenta, contáctanos.
                        </Text>

                        <TouchableOpacity
                            style={styles.supportButton}
                            onPress={openEmail}
                        >
                            <Ionicons
                                name="mail-outline"
                                size={22}
                                color="#FFFFFF"
                            />

                            <Text style={styles.supportButtonText}>
                                Contactar soporte
                            </Text>

                        </TouchableOpacity>

                        <Text style={styles.email}>
                            luminatransforma@gmail.com
                        </Text>

                    </View>

                    <View style={styles.card}>

                        <Text style={styles.sectionTitle}>
                            Preguntas frecuentes
                        </Text>

                        <Text style={styles.question}>
                            • No puedo iniciar sesión
                        </Text>

                        <Text style={styles.answer}>
                            Verifica tu correo y contraseña. Si olvidaste tu contraseña, utiliza la opción de recuperación.
                        </Text>

                        <Text style={styles.question}>
                            • No recibí el correo de confirmación
                        </Text>

                        <Text style={styles.answer}>
                            Revisa tu carpeta de spam o correo no deseado.
                        </Text>

                        <Text style={styles.question}>
                            • Las meditaciones no reproducen audio
                        </Text>

                        <Text style={styles.answer}>
                            Comprueba tu conexión a internet y vuelve a abrir la aplicación.
                        </Text>

                        <Text style={styles.question}>
                            • No puedo recuperar mi contraseña
                        </Text>

                        <Text style={styles.answer}>
                            Escríbenos a soporte para ayudarte personalmente.
                        </Text>

                    </View>

                    <Text style={styles.footer}>
                        Respondemos normalmente en un plazo de 24 a 48 horas.
                    </Text>

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
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },

    title: {
        fontSize: 34,
        fontWeight: '700',
        color: '#1E3A5F',
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFE0D1',
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 22,
        marginBottom: 18,
    },

    description: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 24,
        marginBottom: 20,
    },

    supportButton: {
        height: 56,
        backgroundColor: '#7B61FF',
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },

    supportButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    email: {
        textAlign: 'center',
        marginTop: 16,
        color: '#6B7280',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E3A5F',
        marginBottom: 16,
    },

    question: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E3A5F',
        marginTop: 10,
    },

    answer: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
        marginTop: 6,
    },

    footer: {
        textAlign: 'center',
        color: '#9CA3AF',
        marginBottom: 30,
    },

});