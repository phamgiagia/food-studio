import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { checkoutApi } from '../src/lib/api';
import { useCartStore } from '../src/store/cart';

type ShippingForm = {
  name: string; phone: string; address: string;
  ward: string; district: string; province: string;
};

const PAYMENT_METHODS = [
  { id: 'cod',   label: 'Tiền mặt khi nhận hàng', icon: '💵' },
  { id: 'vnpay', label: 'VNPay',                   icon: '🏦' },
  { id: 'momo',  label: 'Ví MoMo',                 icon: '💜' },
];

const SHIPPING_FEE = 30_000;

function formatPrice(n: number) { return n.toLocaleString('vi-VN') + '₫'; }

export default function CheckoutScreen() {
  const [form, setForm] = useState<ShippingForm>({
    name: '', phone: '', address: '', ward: '', district: '', province: '',
  });
  const [payment, setPayment] = useState('cod');
  const [loading, setLoading] = useState(false);

  const items     = useCartStore(s => s.items);
  const subtotal  = useCartStore(s => s.totalPrice());
  const clearCart = useCartStore(s => s.clearCart);

  const updateField = (field: keyof ShippingForm) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Hãy thêm sản phẩm trước khi đặt hàng');
      return;
    }
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
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      }) as { id: string };
      clearCart();
      router.replace(`/orders/${order.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      Alert.alert('Lỗi đặt hàng', msg);
    } finally {
      setLoading(false);
    }
  };

  const total = subtotal + SHIPPING_FEE;

  return (
    <View className="flex-1 bg-stone-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5 space-y-5">
          {/* Shipping form */}
          <View className="bg-white rounded-2xl p-4">
            <Text className="font-semibold text-stone-900 mb-4">Địa chỉ giao hàng</Text>
            {([
              { field: 'name' as const,     label: 'Họ và tên',          placeholder: 'Nguyễn Văn A',       keyboard: 'default'        },
              { field: 'phone' as const,    label: 'Số điện thoại',      placeholder: '0987654321',         keyboard: 'phone-pad'      },
              { field: 'address' as const,  label: 'Địa chỉ',            placeholder: 'Số nhà, tên đường',  keyboard: 'default'        },
              { field: 'ward' as const,     label: 'Phường/Xã',          placeholder: 'Phường 1',           keyboard: 'default'        },
              { field: 'district' as const, label: 'Quận/Huyện',         placeholder: 'Quận 1',             keyboard: 'default'        },
              { field: 'province' as const, label: 'Tỉnh/Thành phố',     placeholder: 'TP. Hồ Chí Minh',   keyboard: 'default'        },
            ]).map(({ field, label, placeholder, keyboard }) => (
              <View key={field} className="mb-3">
                <Text className="text-xs font-medium text-stone-500 mb-1">{label}</Text>
                <TextInput
                  value={form[field]}
                  onChangeText={updateField(field)}
                  placeholder={placeholder}
                  placeholderTextColor="#a8a29e"
                  keyboardType={keyboard as 'default' | 'phone-pad'}
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
                accessibilityRole="radio"
                accessibilityState={{ checked: payment === method.id }}
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
            {items.length === 0 ? (
              <Text className="text-stone-400 text-sm text-center py-2">Giỏ hàng trống</Text>
            ) : (
              items.map(item => (
                <View key={`${item.productId}:${item.variantId ?? ''}`} className="flex-row justify-between py-1">
                  <Text className="text-stone-600 text-sm flex-1 pr-2" numberOfLines={1}>
                    {item.name} × {item.quantity}
                  </Text>
                  <Text className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</Text>
                </View>
              ))
            )}
            <View className="flex-row justify-between py-1.5 mt-1">
              <Text className="text-stone-500 text-sm">Phí vận chuyển</Text>
              <Text className="text-sm font-medium">{formatPrice(SHIPPING_FEE)}</Text>
            </View>
            <View className="flex-row justify-between pt-3 mt-2 border-t border-stone-100">
              <Text className="font-bold text-stone-900">Tổng cộng</Text>
              <Text className="font-bold text-orange-500 text-lg">{formatPrice(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 py-4 border-t border-stone-100 bg-white">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading || items.length === 0}
          className={`rounded-xl py-4 items-center ${items.length === 0 ? 'bg-stone-300' : 'bg-orange-500'}`}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Đặt hàng"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">
              {items.length === 0 ? 'Giỏ hàng trống' : `Đặt hàng · ${formatPrice(total)}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
