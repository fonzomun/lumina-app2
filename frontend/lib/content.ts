import AsyncStorage from
    '@react-native-async-storage/async-storage';

export async function markContentAsSeen() {

    const now = new Date().toISOString();

    await AsyncStorage.setItem(
        'last_seen_content',
        now
    );

}

export async function getLastSeenContent() {

    return await AsyncStorage.getItem(
        'last_seen_content'
    );

}