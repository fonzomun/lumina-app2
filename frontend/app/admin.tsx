import { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
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

    useEffect(() => { fetchAudios(); }, []);

    const fetchAudios = async () => {
        try {
            setLoadingAudios(true);
            const response = await fetch(`${BACKEND_URL}/api/admin/audios`);
            const data = await response.json();
            setAudios(data);
        } catch (error) { console.log(error); }
        finally { setLoadingAudios(false); }
    };

    const pickAudio = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
        if (!result.canceled) { setSelectedFile(result.assets[0]); setSuccessMessage(''); setErrorMessage(''); }
    };

    const uploadAudio = async () => {
        setSuccessMessage(''); setErrorMessage('');
        if (!title.trim()) { setErrorMessage('Escribe un título para el audio.'); return; }
        if (!selectedFile) { setErrorMessage('Selecciona un archivo MP3.'); return; }
        try {
            setUploading(true);
            const response = await fetch(selectedFile.uri);
            const blob = await response.blob();
            const fileName = `${Date.now()}-${selectedFile.name}`;
            const { error } = await supabase.storage.from('Audios').upload(fileName, blob, { contentType: 'audio/mpeg' });
            if (error) { setErrorMessage('Error: ' + error.message); return; }
            const audioUrl = supabase.storage.from('Audios').getPublicUrl(fileName).data.publicUrl;
            await fetch(`${BACKEND_URL}/api/admin/upload-audio`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, category, order, audio_url: audioUrl }),
            });
            setSuccessMessage(`"${title}" subido correctamente ✓`);
            setTitle(''); setOrder('1'); setSelectedFile(null);
            fetchAudios();
        } catch { setErrorMessage('Ocurrió un error. Intenta de nuevo.'); }
        finally { setUploading(false); }
    };

    const deleteAudio = async (id: string, t: string) => {
        Alert.alert('Eliminar', `¿Eliminar "${t}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: async () => {
                await fetch(`${BACKEND_URL}/api/admin/audio/${id}`, { method: 'DELETE' });
                fetchAudios();
            }}
        ]);
    };

    const grouped = audios.reduce((acc: any, a: any) => {
        if (!acc[a.category_id]) acc[a.category_id] = [];
        acc[a.category_id].push(a); return acc;
    }, {});

    const inputStyle = { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#1F2937', backgroundColor: '#FAFAFA', marginBottom: 16, width: '100%' } as any;
    const labelStyle = { fontSize: 14, fontWeight: '600' as any, color: '#374151', marginBottom: 8 };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F5F3FF' }} contentContainerStyle={{ padding: 24, paddingBottom: 60, alignItems: 'center' }}>
            <View style={{ width: '100%', maxWidth: 600 }}>

                <View style={{ marginBottom: 28, paddingTop: 20 }}>
                    <Text style={{ fontSize: 28, fontWeight: '800', color: '#1E3A5F' }}>Panel de Audios</Text>
                    <Text style={{ fontSize: 14, color: '#7B61FF', fontWeight: '600', marginTop: 2 }}>Lumina Admin</Text>
                </View>

                <View style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#7B61FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E3A5F', marginBottom: 20 }}>Subir nuevo audio</Text>

                    <Text style={labelStyle}>Título</Text>
                    <TextInput value={title} onChangeText={setTitle} placeholder="Ej. Meditación para comenzar el día" placeholderTextColor="#9CA3AF" style={inputStyle} />

                    <Text style={labelStyle}>Categoría</Text>
                    {Platform.OS === 'web' ? (
                        <select
                            value={category}
                            onChange={(e: any) => setCategory(e.target.value)}
                            style={{ borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#1F2937', backgroundColor: '#FAFAFA', marginBottom: 16, width: '100%', height: 52, outline: 'none', cursor: 'pointer' } as any}
                        >
                            {Object.entries(CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    ) : (
                        <View style={{ ...inputStyle, padding: 0 }}>
                            {/* Mobile picker here if needed */}
                        </View>
                    )}

                    <Text style={labelStyle}>Orden</Text>
                    <TextInput value={order} onChangeText={setOrder} keyboardType="numeric" placeholder="1" placeholderTextColor="#9CA3AF" style={{ ...inputStyle, width: 80 }} />

                    <TouchableOpacity onPress={pickAudio} style={{ borderWidth: 2, borderColor: '#7B61FF', borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ color: '#7B61FF', fontWeight: '600', fontSize: 15 }}>
                            {selectedFile ? `📁 ${selectedFile.name}` : '📁 Seleccionar MP3'}
                        </Text>
                    </TouchableOpacity>

                    {errorMessage ? <View style={{ marginTop: 8, backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12 }}><Text style={{ color: '#DC2626', fontSize: 14 }}>{errorMessage}</Text></View> : null}
                    {successMessage ? <View style={{ marginTop: 8, backgroundColor: '#D1FAE5', borderRadius: 10, padding: 12 }}><Text style={{ color: '#065F46', fontSize: 14, fontWeight: '600' }}>{successMessage}</Text></View> : null}

                    <TouchableOpacity onPress={uploadAudio} disabled={uploading}
                        style={{ marginTop: 16, backgroundColor: uploading ? '#A78BFA' : '#7B61FF', borderRadius: 14, padding: 16, alignItems: 'center' }}>
                        {uploading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Subir Audio</Text>}
                    </TouchableOpacity>
                </View>

                <View style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, shadowColor: '#7B61FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E3A5F', marginBottom: 20 }}>Audios existentes</Text>
                    {loadingAudios ? <ActivityIndicator color="#7B61FF" /> :
                     audios.length === 0 ? <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>No hay audios. Sube el primero arriba.</Text> :
                     Object.entries(grouped).map(([cat, items]: any) => (
                        <View key={cat} style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#7B61FF', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#EDE9FE' }}>
                                {CATEGORIES[cat] || cat}
                            </Text>
                            {items.map((audio: any, i: number) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#F9F8FF', borderRadius: 12, marginBottom: 8 }}>
                                    <View style={{ flex: 1, marginRight: 12 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E3A5F' }}>{audio.title}</Text>
                                        <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Orden: {audio.order}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => deleteAudio(audio.affirmation_id, audio.title)}
                                        style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}>
                                        <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '600' }}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

            </View>
        </ScrollView>
    );
}
