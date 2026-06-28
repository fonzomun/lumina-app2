import AsyncStorage from
    '@react-native-async-storage/async-storage';

export async function updateMeditationStreak() {

    const today =
        new Date().toDateString();

    const lastDate =
        await AsyncStorage.getItem(
            'last_meditation_date'
        );

    const currentStreak =
        Number(
            await AsyncStorage.getItem(
                'meditation_streak'
            )
        ) || 0;

    if (lastDate === today) {
        return currentStreak;
    }

    let newStreak = 1;

    if (lastDate) {

        const yesterday =
            new Date();

        yesterday.setDate(
            yesterday.getDate() - 1
        );

        if (
            lastDate ===
            yesterday.toDateString()
        ) {

            newStreak =
                currentStreak + 1;

        }

    }

    await AsyncStorage.setItem(
        'last_meditation_date',
        today
    );

    await AsyncStorage.setItem(
        'meditation_streak',
        String(newStreak)
    );

    return newStreak;

}

export async function getMeditationStreak() {

    return (
        Number(
            await AsyncStorage.getItem(
                'meditation_streak'
            )
        ) || 0
    );

}