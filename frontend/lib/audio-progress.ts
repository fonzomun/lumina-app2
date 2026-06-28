import AsyncStorage from '@react-native-async-storage/async-storage';

const AUDIO_PROGRESS_KEY = 'lumina_audio_progress';

export async function saveAudioProgress(

    affirmationId: number,
    position: number

) {

    try {

        const existing = await AsyncStorage.getItem(
            AUDIO_PROGRESS_KEY
        );

        const parsed = existing ? JSON.parse(existing) : {};

        parsed[affirmationId] = position;

        await AsyncStorage.setItem(
            AUDIO_PROGRESS_KEY,
            JSON.stringify(parsed)
        );

    } catch (error) {

        console.log('Error saving audio progress:', error);

    }

}

export async function getAudioProgress(
    affirmationId: number
) {

    try {

        const existing = await AsyncStorage.getItem(
            AUDIO_PROGRESS_KEY
        );

        const parsed = existing ? JSON.parse(existing) : {};

        return parsed[affirmationId] || 0;

    } catch (error) {

        console.log('Error getting audio progress:', error);

        return 0;

    }

}