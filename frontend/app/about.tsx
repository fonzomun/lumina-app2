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

export default function AboutScreen() {

    const router = useRouter();

    return (
        <LinearGradient
            colors={['#FAF7F2', '#F4F6FF', '#EEF2FF']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >

                    <View style={styles.header}>

                        <Text style={styles.title}>
                            Acerca de
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

                    <View style={styles.card}>

                        <Text style={styles.sectionTitle}>
                            ¿Qué es Lumina?
                        </Text>

                        <Text style={styles.text}>
                            Lumina es una comunidad enfocada en el crecimiento personal,
                            la espiritualidad práctica y el desarrollo de una vida más
                            consciente. Más que un podcast, buscamos crear un espacio
                            donde las personas puedan aprender, reflexionar y transformar
                            diferentes áreas de su vida a través del conocimiento,
                            herramientas prácticas y experiencias compartidas.
                        </Text>

                    </View>

                    <View style={styles.card}>

                        <Text style={styles.sectionTitle}>
                            Irene y Fonzo
                        </Text>

                        <Text style={styles.text}>
                            Lumina es guiado por Irene y Fonzo, quienes comparten una
                            visión complementaria de la vida: Irene desde la perspectiva
                            espiritual y Fonzo desde la aplicación práctica en la vida
                            cotidiana.
                        </Text>

                    </View>

                    <View style={styles.card}>

                        <Text style={styles.sectionTitle}>
                            La aplicación Lumina
                        </Text>

                        <Text style={styles.text}>
                            Esta aplicación reúne meditaciones, afirmaciones,
                            herramientas de crecimiento personal y recursos diseñados
                            para acompañarte en tu camino de transformación.
                        </Text>

                    </View>

                    <View style={styles.card}>

                        <Text style={styles.sectionTitle}>
                            Contacto y Comunidad
                        </Text>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() =>
                                Linking.openURL(
                                    'https://www.comunidadlumina.com'
                                )
                            }
                        >
                            <Ionicons
                                name="globe-outline"
                                size={20}
                                color="#7B61FF"
                            />

                            <Text style={styles.linkText}>
                                www.comunidadlumina.com
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() =>
                                Linking.openURL(
                                    'mailto:luminatransforma@gmail.com'
                                )
                            }
                        >
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color="#7B61FF"
                            />

                            <Text style={styles.linkText}>
                                luminatransforma@gmail.com
                            </Text>

                        </TouchableOpacity>

                        <View style={styles.linkButton}>

                            <Ionicons
                                name="share-social-outline"
                                size={20}
                                color="#7B61FF"
                            />

                            <Text style={styles.linkText}>
                                {'@comunidadlumina\n(en todas las redes sociales)'}
                            </Text>

                        </View>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() =>
                                Linking.openURL(
                                    'https://youtube.com/@comunidadlumina'
                                )
                            }
                        >
                            <Ionicons
                                name="logo-youtube"
                                size={20}
                                color="#7B61FF"
                            />

                            <Text style={styles.linkText}>
                                YouTube: Comunidad Lumina (canal principal)
                            </Text>

                        </TouchableOpacity>

                    </View>

                    <View style={styles.card}>

                        <Text style={styles.sectionTitle}>
                            Versión
                        </Text>

                        <Text style={styles.text}>
                            Lumina v1.0.0
                        </Text>

                    </View>

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
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E3A5F',
        marginBottom: 12,
    },

    text: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 24,
    },

    linkButton: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },

    linkText: {
        flex: 1,
        color: '#1E3A5F',
        fontSize: 15,
        lineHeight: 22,
    },

});