import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

const BACKGROUND_IMAGE =
  'https://customer-assets.emergentagent.com/job_positive-audio/artifacts/dcdozmbx_lumina_fondo.jpg';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    if (password.length < 6) {
      Alert.alert(
        'Error',
        'La contraseña debe tener mínimo 6 caracteres'
      );
      return;
    }

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      'Éxito',
      'Tu contraseña fue actualizada.'
    );

    router.replace('/(auth)/login');
  };

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGE }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          Nueva contraseña
        </Text>

        <Text style={styles.subtitle}>
          Ingresa tu nueva contraseña.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>
            Guardar contraseña
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#123B7A',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },

  button: {
    backgroundColor: '#7B61FF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});