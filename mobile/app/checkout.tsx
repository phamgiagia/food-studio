import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { checkoutApi } from '../src/lib/api';

type ShippingForm = {
  name: string; phone: string; address: string;
  ward: string; district: string; province: string;
};

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Tiền mặt khi nhận hàng', icon: '💵' },
  { id: 'vnpay', label: 'VNPay', icon: '🏦' },
  { id: 'momo', label: 'Ví MoMo', icon: '💜' },
];

function formatPrice(n: number) { return n.toLocaleString('vi-VN') + '₫'; }

export default function CheckoutScreen() {
  const [form, setForm] = useState<ShippingForm>({ name: '', phone: '', address: '', ward: '', district: '', province: '' });
  const [payment, setPayment] = useState('cod');
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof ShippingForm) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handlePlaceOrder = async () => {
    const required = ['name', 'phone', 'address', 'ward', 'district', 'province'] as const;
    for (const field of required) {
      if (!form[field].trim()) {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ địa chỉ giao hàng');
        return;
      }
    }
    setLoading(true);
    try {
      const order = await checkoutApi.place({
        shipping_address: form,
        payment_method: payment,
        items: [], // In production: from cart store
      }) as { id: string };
      router.replace(`/orders/${order.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-stone-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5 space-y-5">
          {/* Shipping form */}
          <View className="bg-white rounded-2xl p-4">
            <Text className="font-semibold text-stone-900 mb-4">Địa chỉ giao hàng</Text>
            {([
              { field: 'name', label: 'Họ và tên', placeholder: 'Nguyễn Văn A' },
              { field: 'phone', label: 'Số điện thoại', placeholder: '0987654321' },
              { field: 'address', label: 'Địa chỉ', placeholder: 'Số nhà, tên đường' },
              { field: 'ward', label: 'Phường/Xã', placeholder: 'Phường 1' },
              { field: 'district', label: 'Quận/Huyện', placeholder: 'Quận 1' },
              { field: 'province', label: 'Tỉnh/Thành phố', placeholder: 'TP. Hồ Chí Minh' },
            ] as const).map(({ field, label, placeholder }) => (
              <View key={field} className="mb-3">
                <Text className="text-xs font-medium text-stone-500 mb-1">{label}</Text>
                <TextInput
                  value={form[field]}
                  onChangeText={updateField(field)}
                  placeholder={placeholder}
                  placeholderTextColor="#a8a29e"
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm text-stone-900"
                />
              </View>
            ))}
          </View>

          {/* Payment method */}
          <View className="bg-white rounded-2xl p-4">
            <Text className="font-semibold text-stone-900 mb-3">Phương thức thanh toán</Text>
            {PAYMENT_METHODS.map(method => (
              <TouchableOpacity
                key={method.id}
                onPress={() => setPayment(method.id)}
                className={`flex-row items-center gap-3 p-3 rounded-xl mb-2 border ${payment === method.id ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-white'}`}
                activeOpacity={0.7}
              >
                <Text className="text-xl">{method.icon}</Text>
                <Text className={`flex-1 font-medium text-sm ${payment === method.id ? 'text-orange-600' : 'text-stone-700'}`}>
                  {method.label}
                </Text>
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${payment === method.id ? 'border-orange-500' : 'border-stone-300'}`}>
                  {payment === method.id && <View className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Order summary */}
          <View className="bg-white rounded-2xl p-4 mb-2">
            <Text className="font-semibold text-stone-900 mb-3">Tóm tắt đơn hàng</Text>
            <View className="flex-row justify-between py-1.5">
              <Text className="text-stone-500 text-sm">Tiền hàng</Text>
              <Text className="text-sm font-medium">{formatPrice(450_000)}</Text>
            </View>
            <View className="flex-row justify-between py-1.5">
              <Text className="text-stone-500 text-sm">Phí vận chuyển</Text>
              <Text className="text-sm font-medium">{formatPrice(35_000)}</Text>
            </View>
            <View className="flex-row justify-between pt-3 mt-2 border-t border-stone-100">
              <Text className="font-bold text-stone-900">Tổng cộng</Text>
              <Text className="font-bold text-orange-500 text-lg">{formatPrice(485_000)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 py-4 border-t border-stone-100 bg-white">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading}
          className="bg-orange-500 rounded-xl py-4 items-center"
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Đặt hàng · {formatPrice(485_000)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
