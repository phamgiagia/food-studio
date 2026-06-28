import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../src/lib/api';

type OrderDetail = {
  id: string; order_number: string; status: string;
  total_amount: number; shipping_fee: number; created_at: number;
  shipping_address: { name: string; phone: string; address: string; ward: string; district: string; province: string };
  items: { id: string; product_name: string; quantity: number; unit_price: number }[];
  tracking_events: { status: string; description: string; created_at: number }[];
};

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STEP_LABELS: Record<string, string> = {
  pending: 'Đặt hàng', confirmed: 'Xác nhận', processing: 'Đóng gói', shipped: 'Đang giao', delivered: 'Đã nhận',
};

function formatPrice(n: number) { return n.toLocaleString('vi-VN') + '₫'; }
function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.get(id) as Promise<OrderDetail>,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-stone-50 items-center justify-center">
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-stone-50 items-center justify-center">
        <Text className="text-stone-500">Không tìm thấy đơn hàng</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-orange-500 font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStepIdx = STEPS.indexOf(order.status);

  return (
    <ScrollView className="flex-1 bg-stone-50" showsVerticalScrollIndicator={false}>
      <View className="px-5 py-5 space-y-5">
        {/* Header */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="font-mono font-bold text-stone-900 mb-1">{order.order_number}</Text>
          <Text className="text-stone-400 text-xs">{formatDate(order.created_at)}</Text>
        </View>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <View className="bg-white rounded-2xl p-4">
            <Text className="font-semibold text-stone-900 mb-4">Theo dõi đơn hàng</Text>
            <View className="flex-row items-center">
              {STEPS.map((step, idx) => (
                <View key={step} className="flex-row items-center flex-1">
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${idx <= currentStepIdx ? 'bg-orange-500' : 'bg-stone-200'}`}>
                    <Text className={`text-xs font-bold ${idx <= currentStepIdx ? 'text-white' : 'text-stone-400'}`}>
                      {idx + 1}
                    </Text>
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View className={`flex-1 h-0.5 ${idx < currentStepIdx ? 'bg-orange-500' : 'bg-stone-200'}`} />
                  )}
                </View>
              ))}
            </View>
            <View className="flex-row justify-between mt-2">
              {STEPS.map((step, idx) => (
                <Text key={step} className={`text-xs ${idx <= currentStepIdx ? 'text-orange-600 font-semibold' : 'text-stone-400'}`}
                  style={{ width: `${100 / STEPS.length}%`, textAlign: 'center' }}>
                  {STEP_LABELS[step]}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Tracking events */}
        {order.tracking_events?.length > 0 && (
          <View className="bg-white rounded-2xl p-4">
            <Text className="font-semibold text-stone-900 mb-4">Lịch sử vận chuyển</Text>
            <View className="space-y-3">
              {order.tracking_events.map((event, idx) => (
                <View key={idx} className="flex-row gap-3">
                  <View className="items-center">
                    <View className={`w-2.5 h-2.5 rounded-full mt-1 ${idx === 0 ? 'bg-orange-500' : 'bg-stone-300'}`} />
                    {idx < order.tracking_events.length - 1 && (
                      <View className="w-0.5 flex-1 bg-stone-200 mt-1" />
                    )}
                  </View>
                  <View className="flex-1 pb-3">
                    <Text className="text-sm font-medium text-stone-900">{event.description}</Text>
                    <Text className="text-xs text-stone-400 mt-0.5">{formatDate(event.created_at)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Items */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-stone-900 mb-3">Sản phẩm</Text>
          {order.items.map(item => (
            <View key={item.id} className="flex-row justify-between items-center py-2 border-b border-stone-50 last:border-0">
              <View className="flex-1">
                <Text className="text-sm font-medium text-stone-800">{item.product_name}</Text>
                <Text className="text-xs text-stone-400">x{item.quantity}</Text>
              </View>
              <Text className="font-semibold text-stone-900 text-sm">{formatPrice(item.unit_price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Shipping address */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-stone-900 mb-2">Địa chỉ giao hàng</Text>
          <Text className="text-stone-700 text-sm">{order.shipping_address.name}</Text>
          <Text className="text-stone-500 text-sm">{order.shipping_address.phone}</Text>
          <Text className="text-stone-500 text-sm">
            {order.shipping_address.address}, {order.shipping_address.ward}, {order.shipping_address.district}, {order.shipping_address.province}
          </Text>
        </View>

        {/* Price summary */}
        <View className="bg-white rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between py-1.5">
            <Text className="text-stone-500 text-sm">Tiền hàng</Text>
            <Text className="text-sm font-medium">{formatPrice(order.total_amount - order.shipping_fee)}</Text>
          </View>
          <View className="flex-row justify-between py-1.5">
            <Text className="text-stone-500 text-sm">Phí vận chuyển</Text>
            <Text className="text-sm font-medium">{formatPrice(order.shipping_fee)}</Text>
          </View>
          <View className="flex-row justify-between pt-3 mt-2 border-t border-stone-100">
            <Text className="font-bold text-stone-900">Tổng cộng</Text>
            <Text className="font-bold text-orange-500 text-lg">{formatPrice(order.total_amount)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
