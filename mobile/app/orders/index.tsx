import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../src/lib/api';

type Order = {
  id: string; order_number: string; status: string;
  total_amount: number; created_at: number; item_count: number;
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', processing: 'Đang xử lý',
  shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
};
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
  shipped: '#0ea5e9', delivered: '#22c55e', cancelled: '#ef4444',
};

function formatPrice(n: number) { return n.toLocaleString('vi-VN') + '₫'; }
function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('vi-VN');
}

export default function OrdersScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.list() as Promise<{ orders: Order[]; total: number }>,
  });

  const orders = data?.orders ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 bg-stone-50 items-center justify-center">
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className="flex-1 bg-stone-50 items-center justify-center px-6">
        <Text className="text-5xl mb-4">📦</Text>
        <Text className="text-lg font-bold text-stone-800 mb-2">Chưa có đơn hàng</Text>
        <Text className="text-stone-500 text-sm text-center mb-6">Khám phá đặc sản và đặt hàng ngay!</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          className="bg-orange-500 px-6 py-3 rounded-xl"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold">Mua sắm ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
      ItemSeparatorComponent={() => <View className="h-3" />}
      renderItem={({ item: order }) => (
        <TouchableOpacity
          onPress={() => router.push(`/orders/${order.id}`)}
          className="bg-white rounded-2xl p-4 shadow-sm"
          activeOpacity={0.7}
        >
          <View className="flex-row justify-between items-start mb-3">
            <Text className="font-mono font-bold text-stone-900">{order.order_number}</Text>
            <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: STATUS_COLORS[order.status] + '20' }}>
              <Text className="text-xs font-semibold" style={{ color: STATUS_COLORS[order.status] }}>
                {STATUS_LABELS[order.status] ?? order.status}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-stone-400 text-sm">{order.item_count} sản phẩm · {formatDate(order.created_at)}</Text>
            <Text className="font-bold text-stone-900">{formatPrice(order.total_amount)}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
