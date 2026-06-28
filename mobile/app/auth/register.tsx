import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../../src/lib/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu tối thiểu 8 ký tự');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { access_token } = await authApi.register(name.trim(), email.trim(), password);
      await SecureStore.setItemAsync('auth_token', access_token);
      router.replace('/(tabs)');
    } catch {
      setError('Email đã được sử dụng. Vui lòng thử email khác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-stone-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 justify-center py-12">
          <Text className="text-2xl font-bold text-stone-900 mb-1">Tạo tài khoản</Text>
          <Text className="text-stone-500 text-sm mb-8">Khám phá đặc sản vùng miền Việt Nam</Text>

          {!!error && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          <View className="space-y-4 mb-6">
            {[
              { label: 'Họ và tên', value: name, setter: setName, placeholder: 'Nguyễn Văn A', type: 'default' as const },
              { label: 'Email', value: email, setter: setEmail, placeholder: 'ten@email.com', type: 'email-address' as const },
            ].map(field => (
              <View key={field.label}>
                <Text className="text-sm font-medium text-stone-700 mb-1.5">{field.label}</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.type}
                  autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                  placeholder={field.placeholder}
                  placeholderTextColor="#a8a29e"
                  className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-900"
                />
              </View>
            ))}

            <View>
              <Text className="text-sm font-medium text-stone-700 mb-1.5">Mật khẩu</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Tối thiểu 8 ký tự"
                placeholderTextColor="#a8a29e"
                className="bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-900"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="bg-orange-500 rounded-xl py-4 items-center mb-4"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Tạo tài khoản</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.7}>
            <Text className="text-center text-stone-500 text-sm">
              Đã có tài khoản?{' '}
              <Text className="text-orange-500 font-semibold">Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
