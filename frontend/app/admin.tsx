import { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    Alert
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabase';

export default function AdminScreen() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('cat_morning');
    const [order, setOrder] = useState('1');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [audios, setAudios] = useState<any[]>([]);

    useEffect(() => {
        fetchAudios();
    }, []);

    const fetchAudios = async () => {
        try {
            const response = await fetch(
                'http://192.168.1.78:8001/api/admin/audios'
            );

            const data = await response.json();

            setAudios(data);
        } catch (error) {
            console.log(error);
        }
    };

    const pickAudio = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
            copyToCacheDirectory: true
        });

        if (!result.canceled) {
            setSelectedFile(result.assets[0]);
        }
    };

    const uploadAudio = async () => {
        try {
            if (!selectedFile) {
                Alert.alert('Selecciona un archivo');
                return;
            }

            setUploading(true);

            const response = await fetch(selectedFile.uri);
            const blob = await response.blob();

            const fileName = `${Date.now()}-${selectedFile.name}`;

            const { data, error } = await supabase.storage
                .from('Audios')
                .upload(fileName, blob, {
                    contentType: 'audio/mpeg'
                });

            if (error) {
                console.log(error);
                Alert.alert(JSON.stringify(error));
                return;
            }

            const audioUrl = supabase.storage
                .from('Audios')
                .getPublicUrl(fileName).data.publicUrl;

            await fetch('http://192.168.1.78:8001/api/admin/upload-audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    category,
                    order,
                    audio_url: audioUrl
                }),
            });

            setSuccessMessage('Audio subido correctamente');

            setSuccessMessage('Audio subido correctamente');

            setTitle('');
            setOrder('1');
            setSelectedFile(null);

        } catch (error) {
            console.log(error);
            Alert.alert(JSON.stringify(error));
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{
                flex: 1,
                padding: 40,
                gap: 20,
            }}
        >
            <Text style={{ fontSize: 28, fontWeight: 'bold' }}>
                Admin Panel
            </Text>

            <Text>Título del audio</Text>

            <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ej. Meditación para comenzar el día"
                style={{
                    borderWidth: 1,
                    padding: 12,
                    borderRadius: 10
                }}
            />

            <Text>Categoría</Text>

            <View
                style={{
                    backgroundColor: '#FFF',
                    borderRadius: 18,
                    overflow: 'hidden',
                    minHeight: 64,
                    justifyContent: 'center',
                    paddingHorizontal: 14,
                    borderWidth: 2,
                    borderColor: '#E5E7EB',
                }}
            >
                <Picker
                    selectedValue={category}
                    onValueChange={(value) => setCategory(value)}
                    style={{
                        height: 64,
                        fontSize: 18,
                        color: '#222',
                        backgroundColor: '#FFF',
                    }}
                >
                    <Picker.Item label="🌅 Mañana" value="cat_morning" />
                    <Picker.Item label="🌙 Antes de Dormir" value="cat_sleep" />
                    <Picker.Item label="💭 Emocionales" value="cat_emotional" />
                    <Picker.Item label="✨ Espirituales" value="cat_spiritual" />
                    <Picker.Item label="🔥 Poder Personal" value="cat_power" />
                    <Picker.Item label="🩷 Sanación" value="cat_healing" />
                </Picker>
            </View>

            <Text>Orden</Text>

            <TextInput
                value={order}
                onChangeText={setOrder}
                keyboardType="numeric"
                placeholder="1"
                style={{
                    borderWidth: 1,
                    padding: 12,
                    borderRadius: 10
                }}
            />

            <TouchableOpacity
                onPress={pickAudio}
                style={{
                    backgroundColor: 'black',
                    padding: 16,
                    borderRadius: 10
                }}
            >
                <Text style={{ color: 'white', textAlign: 'center' }}>
                    Seleccionar MP3
                </Text>
            </TouchableOpacity>
            {selectedFile ? (
                <Text
                    style={{
                        marginTop: 10,
                        marginBottom: 10
                    }}
                >
                    Archivo seleccionado: {selectedFile.name}
                </Text>
            ) : null}

            {successMessage ? (
                <Text style={{ color: 'green', fontWeight: 'bold' }}>
                    {successMessage}
                </Text>
            ) : null}

            <TouchableOpacity
                onPress={uploadAudio}
                style={{
                    backgroundColor: uploading ? 'gray' : 'green',
                    padding: 16,
                    borderRadius: 10
                }}
            >
                <Text style={{ color: 'white', textAlign: 'center' }}>
                    {uploading ? 'SUBIENDO...' : 'SUBIR AUDIO'}
                </Text>
            </TouchableOpacity>
            <View style={{ marginTop: 40 }}>
                <Text
                    style={{
                        fontSize: 22,
                        fontWeight: 'bold',
                        marginBottom: 20
                    }}
                >
                    Audios existentes
                </Text>

                {Object.entries(
                    audios.reduce((acc: any, audio: any) => {
                        const category = audio.category_id;

                        if (!acc[category]) {
                            acc[category] = [];
                        }

                        acc[category].push(audio);

                        return acc;
                    }, {})
                ).map(([category, items]: any) => (
                    <View key={category}>

                        <Text
                            style={{
                                fontSize: 24,
                                fontWeight: 'bold',
                                marginTop: 20,
                                marginBottom: 12,
                            }}
                        >
                            {category}
                        </Text>

                        {items.map((audio: any, index: number) => (
                            <View
                                key={index}
                                style={{
                                    padding: 15,
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 10,
                                    marginBottom: 10
                                }}
                            >
                                <Text style={{ fontWeight: 'bold' }}>
                                    {audio.title}
                                </Text>

                                <TouchableOpacity
                                    onPress={async () => {
                                        try {
                                            await fetch(
                                                `http://192.168.1.78:8001/api/admin/audio/${audio.affirmation_id}`,
                                                {
                                                    method: 'DELETE'
                                                }
                                            );

                                            fetchAudios();
                                        } catch (error) {
                                            console.log(error);
                                        }
                                    }}
                                    style={{
                                        backgroundColor: 'red',
                                        padding: 10,
                                        borderRadius: 8,
                                        marginTop: 10
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: 'white',
                                            textAlign: 'center'
                                        }}
                                    >
                                        Eliminar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}