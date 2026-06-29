import { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabase';

const BACKEND_URL = 'https://lumina-app2.onrender.com';

const CATEGORIES: Record<string, string> = {
    cat_morning: '🌅 Mañana',
    cat_night: '🌙 Antes de Dormir',
    cat_love: '💜 Amor',
    cat_abundance: '✨ Abundancia',
    cat_spiritual: '🔮 Espirituales',
    cat_confidence: '🔥 Confianza',
};

export default function AdminScreen() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('cat_morning');
    const [order, setOrder] = useState('1');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [audios, setAudios] = useState<any[]>([]);
    const [loadingAudios, setLoadingAudios] = useState(true);

    useEffect(() => {
        fetchAudios();
    }, []);

    const fetchAudios = async () => {
        try {
            setLoadingAudios(true);
            const response = await fetch(`${BACKEND_URL}/api/admin/audios`);
            const data = await response.json();
            setAudios(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingAudios(false);
        }
    };

    const pickAudio = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
            copyToCacheDirectory: true
        });
        if (!result.canceled) {
            setSelectedFile(result.assets[0]);
            setSuccessMessage('');
            setErrorMessage('');
        }
    };

    const uploadAudio = async () => {
        setSuccessMessage('');
        setErrorMessage('');

        if (!title.trim()) {
            setErrorMessage('Escribe un título para el audio.');
            return;
        }
        if (!selectedFile) {
            setErrorMessage('Selecciona un archivo MP3.');
            return;
        }

        try {
            setUploading(true);

            const response = await fetch(selectedFile.uri);
            const blob = await response.blob();
            const fileName = `${Date.now()}-${selectedFile.name}`;

            const { data, error } = await supabase.storage
                .from('Audios')
                .upload(fileName, blob, { contentType: 'audio/mpeg' });

            if (error) {
                setErrorMessage('Error subiendo el archivo: ' + error.message);
                return;
            }

            const audioUrl = supabase.storage
                .from('Audios')
                .getPublicUrl(fileName).data.publicUrl;

            await fetch(`${BACKEND_URL}/api/admin/upload-audio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, category, order, audio_url: audioUrl }),
            });

            setSuccessMessage(`"${title}" subido correctamente ✓`);
            setTitle('');
            setOrder('1');
            setSelectedFile(null);
            fetchAudios();

        } catch (error: any) {
            setErrorMessage('Ocurrió un error. Intenta de nuevo.');
            console.log(error);
        } finally {
            setUploading(false);
        }
    };

    const deleteAudio = async (affirmationId: string, audioTitle: string) => {
        Alert.alert(
            'Eliminar audio',
            `¿Eliminar "${audioTitle}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await fetch(`${BACKEND_URL}/api/admin/audio/${affirmationId}`, {
                                method: 'DELETE'
                            });
                            fetchAudios();
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            ]
        );
    };

    const grouped = audios.reduce((acc: any, audio: any) => {
        const cat = audio.category_id;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(audio);
        return acc;
    }, {});

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Panel de Audios</Text>
                <Text style={styles.headerSubtitle}>Lumina Admin</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Subir nuevo audio</Text>

                <Text style={styles.label}>Título</Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Ej. Meditación para comenzar el día"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                />

                <Text style={styles.label}>Categoría</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(value) => setCategory(value)}
                        style={styles.picker}
                    >
                        {Object.entries(CATEGORIES).map(([value, label]) => (
                            <Picker.Item key={value} label={label} value={value} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Orden</Text>
                <TextInput
                    value={order}
                    onChangeText={setOrder}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, { width: 80 }]}
                />

                <TouchableOpacity style={styles.fileButton} onPress={pickAudio}>
                    <Text style={styles.fileButtonText}>
                        {selectedFile ? `📁 ${selectedFile.name}` : '📁 Seleccionar MP3'}
                    </Text>
                </TouchableOpacity>

                {errorMessage ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                {successMessage ? (
                    <View style={styles.successBox}>
                        <Text style={styles.successText}>{successMessage}</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                    onPress={uploadAudio}
                    disabled={uploading}
                >
                    {uploading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <ActivityIndicator color="#FFF" size="small" />
                            <Text style={styles.uploadButtonText}>Subiendo...</Text>
                        </View>
                    ) : (
                        <Text style={styles.uploadButtonText}>Subir Audio</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Audios existentes</Text>

                {loadingAudios ? (
                    <ActivityIndicator color="#7B61FF" style={{ marginTop: 20 }} />
                ) : audios.length === 0 ? (
                    <Text style={styles.emptyText}>No hay audios aún. Sube el primero arriba.</Text>
                ) : (
                    Object.entries(grouped).map(([cat, items]: any) => (
                        <View key={cat} style={styles.categorySection}>
                            <Text style={styles.categoryLabel}>
                                {CATEGORIES[cat] || cat}
                            </Text>
                            {items.map((audio: any, index: number) => (
                                <View key={index} style={styles.audioItem}>
                                    <View style={styles.audioInfo}>
                                        <Text style={styles.audioTitle}>{audio.title}</Text>
                                        <Text style={styles.audioOrder}>Orden: {audio.order}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => deleteAudio(audio.affirmation_id, audio.title)}
                                    >
                                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles: any = {
    container: { flex: 1, backgroundColor: '#F5F3FF' },
    content: { padding: 20, paddingBottom: 60 },
    header: { marginBottom: 24, paddingTop: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#1E3A5F' },
    headerSubtitle: { fontSize: 14, color: '#7B61FF', fontWeight: '600', marginTop: 2 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#7B61FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#1E3A5F', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 14 },
    input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#1F2937', backgroundColor: '#FAFAFA' },
    pickerContainer: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FAFAFA', overflow: 'hidden' },
    picker: { height: 52, color: '#1F2937' },
    fileButton: { marginTop: 20, borderWidth: 2, borderColor: '#7B61FF', borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center' },
    fileButtonText: { color: '#7B61FF', fontWeight: '600', fontSize: 15 },
    errorBox: { marginTop: 12, backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12 },
    errorText: { color: '#DC2626', fontSize: 14, fontWeight: '500' },
    successBox: { marginTop: 12, backgroundColor: '#D1FAE5', borderRadius: 10, padding: 12 },
    successText: { color: '#065F46', fontSize: 14, fontWeight: '600' },
    uploadButton: { marginTop: 20, backgroundColor: '#7B61FF', borderRadius: 14, padding: 16, alignItems: 'center' },
    uploadButtonDisabled: { backgroundColor: '#A78BFA' },
    uploadButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    categorySection: { marginBottom: 20 },
    categoryLabel: { fontSize: 15, fontWeight: '700', color: '#7B61FF', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#EDE9FE' },
    audioItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#F9F8FF', borderRadius: 12, marginBottom: 8 },
    audioInfo: { flex: 1, marginRight: 12 },
    audioTitle: { fontSize: 14, fontWeight: '600', color: '#1E3A5F' },
    audioOrder: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    deleteButton: { backgroundColor: '#FEE2E2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    deleteButtonText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
    emptyText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 10, marginBottom: 10 },
};
