import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../../src/lib/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { access_token } = await authApi.login(email.trim(), password);
      await SecureStore.setItemAsync('auth_token', access_token);
      router.replace('/(tabs)');
    } catch {
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-stone-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 justify-center">
          <View className="mb-10">
            <Text className="font-display text-3xl font-bold text-orange-500 mb-1">Food Studio</Text>
            <Text className="text-stone-500 text-base">Đặc sản vùng miền Việt Nam</Text>
          </View>

          <Text className="text-2xl font-bold text-stone-900 mb-6">Đăng nhập</Text>

          {!!error && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-sm font-medium text-stone-700 mb-1.5">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="ten@email.com"
                placeholderTextColor="#a8a29e"
                className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-900"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-stone-700 mb-1.5">Mật khẩu</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#a8a29e"
                className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-900"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="bg-orange-500 rounded-xl py-4 items-center mb-4"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/register')} activeOpacity={0.7}>
            <Text className="text-center text-stone-500 text-sm">
              Chưa có tài khoản?{' '}
              <Text className="text-orange-500 font-semibold">Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
