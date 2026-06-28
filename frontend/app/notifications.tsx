import React, {
    useEffect,
    useState,
} from 'react';

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Switch,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import {
    LinearGradient
} from 'expo-linear-gradient';

import {
    registerForPushNotificationsAsync,
    scheduleDailyReminder,
    scheduleMotivationalNotification,
} from '@/lib/notifications';

export default function NotificationsScreen() {

    const router = useRouter();

    const [dailyReminder, setDailyReminder] =
        useState(true);

    const [newContentAlerts, setNewContentAlerts] =
        useState(true);

    const [motivationalMessages, setMotivationalMessages] =
        useState(true);

    useEffect(() => {

        loadNotificationSettings();

        registerForPushNotificationsAsync();

    }, []);

    const loadNotificationSettings = async () => {

        const daily =
            await AsyncStorage.getItem(
                'daily_reminder'
            );

        const content =
            await AsyncStorage.getItem(
                'new_content_alerts'
            );

        const motivation =
            await AsyncStorage.getItem(
                'motivational_messages'
            );

        if (daily !== null) {
            setDailyReminder(
                daily === 'true'
            );
        }

        if (content !== null) {
            setNewContentAlerts(
                content === 'true'
            );
        }

        if (motivation !== null) {
            setMotivationalMessages(
                motivation === 'true'
            );
        }

    };

    const saveSetting = async (
        key: string,
        value: boolean
    ) => {

        await AsyncStorage.setItem(
            key,
            String(value)
        );

    };

    return (

        <LinearGradient
            colors={[
                '#F4F7F2',
                '#F4F6FF',
                '#EEF2FF'
            ]}
            style={styles.container}
        >

            <SafeAreaView style={styles.safeArea}>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 24,
                        paddingHorizontal: 12,
                        justifyContent: 'space-between',
                    }}
                >

                    <Text
                        style={{
                            fontSize: 34,
                            fontWeight: '700',
                            color: '#1E3A5F',
                        }}
                    >
                        Notificaciones
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
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

                <View style={styles.card}>

                    <View style={styles.settingRow}>

                        <View>

                            <Text style={styles.settingTitle}>
                                Recordatorio diario
                            </Text>

                            <Text style={styles.settingDescription}>
                                Recibe un recordatorio
                                para tu meditación diaria.
                            </Text>

                        </View>

                        <Switch
                            value={dailyReminder}
                            onValueChange={async (value) => {

                                setDailyReminder(value);

                                saveSetting(
                                    'daily_reminder',
                                    value
                                );

                                if (value) {

                                    await scheduleDailyReminder();

                                }

                            }}
                        />

                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRow}>

                        <View>

                            <Text style={styles.settingTitle}>
                                Nuevo contenido
                            </Text>

                            <Text style={styles.settingDescription}>
                                Avisos cuando haya
                                nuevas meditaciones.
                            </Text>

                        </View>

                        <Switch
                            value={newContentAlerts}
                            onValueChange={(value) => {

                                setNewContentAlerts(
                                    value
                                );

                                saveSetting(
                                    'new_content_alerts',
                                    value
                                );

                            }}
                        />

                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRow}>

                        <View>

                            <Text style={styles.settingTitle}>
                                Mensajes motivacionales
                            </Text>

                            <Text style={styles.settingDescription}>
                                Frases positivas y
                                mensajes de apoyo.
                            </Text>

                        </View>

                        <Switch
                            value={motivationalMessages}
                            onValueChange={async (value) => {

                                setMotivationalMessages(
                                    value
                                );

                                saveSetting(
                                    'motivational_messages',
                                    value
                                );

                                if (value) {

                                    await scheduleMotivationalNotification();

                                }

                            }}
                        />

                    </View>

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

    card: {
        marginHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 22,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },

    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
    },

    settingTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1E3A5F',
        marginBottom: 6,
    },

    settingDescription: {
        fontSize: 13,
        color: '#6B7280',
        width: 220,
        lineHeight: 18,
    },

    divider: {
        height: 1,
        backgroundColor: '#EEF2FF',
    },

});