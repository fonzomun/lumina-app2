import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
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


export default function ChangePasswordScreen() {

    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSave = async () => {

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            Alert.alert('Completa todos los campos');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        const {
            data: { session }
        } = await supabase.auth.getSession();

        if (!session?.user?.email) {
            Alert.alert('Sesión no encontrada');
            return;
        }

        const { error: loginError } =
            await supabase.auth.signInWithPassword({
                email: session.user.email,
                password: currentPassword,
            });

        if (loginError) {
            Alert.alert('La contraseña actual es incorrecta');
            return;
        }

        const { error } =
            await supabase.auth.updateUser({
                password: newPassword,
            });

        if (error) {
            Alert.alert(error.message);
            return;
        }

        Alert.alert('Contraseña actualizada correctamente');

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

    };

    return (
        <LinearGradient
            colors={['#FAF7F2', '#F4F6FF', '#EEF2FF']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>

                <View style={styles.header}>

                    <Text style={styles.title}>
                        Contraseña
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

                    <Text style={styles.label}>
                        Contraseña actual
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputWithIcon}
                            secureTextEntry={!showCurrentPassword}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />

                        <TouchableOpacity
                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            <Ionicons
                                name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>
                        Nueva contraseña
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputWithIcon}
                            secureTextEntry={!showNewPassword}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />

                        <TouchableOpacity
                            onPress={() => setShowNewPassword(!showNewPassword)}
                        >
                            <Ionicons
                                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>
                        Confirmar contraseña
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputWithIcon}
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>

                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>
                        Guardar cambios
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

    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E3A5F',
        marginBottom: 8,
        marginTop: 12,
    },

    inputContainer: {
        height: 56,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
    },

    inputWithIcon: {
        flex: 1,
        height: '100%',
    },

    saveButton: {
        height: 58,
        backgroundColor: '#7B61FF',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

});