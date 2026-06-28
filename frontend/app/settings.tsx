import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {

    const router = useRouter();

    return (
        <LinearGradient
            colors={['#FAF7F2', '#F4F6FF', '#EEF2FF']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>

                <View style={styles.header}>

                    <Text style={styles.title}>
                        Configuración
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

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/change-password')}
                    >
                        <View style={styles.leftSection}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={22}
                                color="#7B61FF"
                            />
                            <Text style={styles.menuText}>
                                Cambiar contraseña
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/delete-account')}
                    >
                        <View style={styles.leftSection}>
                            <Ionicons
                                name="trash-outline"
                                size={22}
                                color="#EF4444"
                            />
                            <Text style={styles.menuText}>
                                Eliminar cuenta
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>

                </View>

                <View style={styles.versionCard}>
                    <Text style={styles.versionTitle}>
                        Versión de la app
                    </Text>

                    <Text style={styles.versionText}>
                        v1.0.0 • 2026
                    </Text>
                </View>

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
    },

    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 54,
    },

    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    menuText: {
        fontSize: 16,
        color: '#1E3A5F',
        fontWeight: '600',
    },

    divider: {
        height: 1,
        backgroundColor: '#EEF2F7',
        marginVertical: 18,
    },

    versionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginTop: 20,
    },

    versionTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },

    versionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E3A5F',
    },

});