import * as Notifications from 'expo-notifications';

import * as Device from 'expo-device';

import {
    Platform
} from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {

    if (Platform.OS === 'web') {
        return;
    }

    if (!Device.isDevice) {
        return;
    }

    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {

        const { status } =
            await Notifications.requestPermissionsAsync();

        finalStatus = status;

    }

    if (finalStatus !== 'granted') {
        return;
    }

    if (Platform.OS === 'android') {

        Notifications.setNotificationChannelAsync(
            'default',
            {
                name: 'default',
                importance:
                    Notifications.AndroidImportance.MAX,
            }
        );

    }

}

export async function scheduleDailyReminder() {

    if (Platform.OS === 'web') {
        return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({

        content: {
            title: '✨ Momento para ti',
            body:
                'Tu mente y tu energía merecen unos minutos de calma.',
        },

        trigger: {
            hour: 9,
            minute: 0,
            repeats: true,
        },

    });

}

export async function scheduleMotivationalNotification() {

    if (Platform.OS === 'web') {
        return;
    }

    const messages = [

        '✨ Llevas luz dentro de ti.',

        '🌿 Respira profundo. Todo está acomodándose.',

        '🔥 Tu energía cambia cuando tú cambias.',

        '💫 Hoy también estás avanzando.',

        '🌙 Tu paz interior vale protegerla.',

    ];

    const randomMessage =
        messages[
        Math.floor(
            Math.random() * messages.length
        )
        ];

    await Notifications.scheduleNotificationAsync({

        content: {
            title: 'Lumina',
            body: randomMessage,
        },

        trigger: {
            seconds: 15,
        },

    });

}