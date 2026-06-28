import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function DeleteAccountScreen() {

    const router = useRouter();

    const [confirmation, setConfirmation] = useState('');

    const canDelete = confirmation === 'ELIMINAR';
    const handleDeleteAccount = async () => {

        const { data: { session } } =
            await supabase.auth.getSession();

        if (!session?.access_token) {
            Alert.alert('Sesión no encontrada');
            return;
        }

        const response = await fetch(
            'https://dahnssobfwceutnshvdj.supabase.co/functions/v1/delete-user',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            }
        );

        if (!response.ok) {
            Alert.alert('Error al eliminar la cuenta');
            return;
        }

        Alert.alert('Cuenta eliminada');

        await supabase.auth.signOut();

        router.replace('/');
    };

    return (
        <LinearGradient
            colors={['#FAF7F2', '#F4F6FF', '#EEF2FF']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>

                <View style={styles.header}>

                    <Text style={styles.title}>
                        Eliminar cuenta
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
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

                    <Text style={styles.warningTitle}>
                        Esta acción es permanente
                    </Text>

                    <Text style={styles.description}>
                        Se eliminarán tu perfil, favoritos y preferencias guardadas.
                    </Text>

                    <Text style={styles.label}>
                        Escribe ELIMINAR para continuar
                    </Text>

                    <TextInput
                        style={styles.input}
                        value={confirmation}
                        onChangeText={setConfirmation}
                        autoCapitalize="characters"
                    />

                </View>

                <TouchableOpacity
                    disabled={!canDelete}
                    onPress={handleDeleteAccount}
                    style={[
                        styles.deleteButton,
                        !canDelete && styles.deleteButtonDisabled
                    ]}
                >
                    <Text style={styles.deleteButtonText}>
                        Eliminar cuenta
                    </Text>
                </TouchableOpacity>

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

    warningTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#DC2626',
        marginBottom: 12,
    },

    description: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
        marginBottom: 24,
    },

    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E3A5F',
        marginBottom: 8,
    },

    input: {
        height: 56,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    deleteButton: {
        height: 58,
        backgroundColor: '#DC2626',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },

    deleteButtonDisabled: {
        opacity: 0.4,
    },

    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

});