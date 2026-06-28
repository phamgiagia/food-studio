import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { sellerApi } from '../../src/lib/api';

type Seller = {
  id: string; name: string; slug: string; bio: string; province: string;
  logo_url: string | null; banner_url: string | null;
  rating_avg: number; rating_count: number; product_count: number;
  total_sales: number; is_verified: boolean;
  products: { id: string; name: string; price: number; images: { url: string }[] }[];
};

function formatPrice(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

export default function SellerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: seller, isLoading } = useQuery({
    queryKey: ['seller', slug],
    queryFn: () => sellerApi.getBySlug(slug) as Promise<Seller>,
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  if (!seller) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-stone-500 text-center">Không tìm thấy nhà bán hàng</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-orange-500 font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View className="h-48 bg-orange-100">
        {seller.banner_url && (
          <Image source={{ uri: seller.banner_url }} className="w-full h-full" resizeMode="cover" />
        )}
      </View>

      <View className="px-5 -mt-10">
        {/* Logo */}
        <View className="w-20 h-20 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden mb-3">
          {seller.logo_url ? (
            <Image source={{ uri: seller.logo_url }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full bg-orange-100 items-center justify-center">
              <Text className="text-orange-500 font-bold text-2xl">{seller.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-xl font-bold text-stone-900">{seller.name}</Text>
          {seller.is_verified && (
            <Text className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">✓ Xác thực</Text>
          )}
        </View>

        <Text className="text-stone-500 text-sm mb-4">{seller.province}</Text>

        {/* Stats */}
        <View className="flex-row gap-6 mb-5 pb-5 border-b border-stone-100">
          {[
            { label: 'Sản phẩm', value: seller.product_count },
            { label: 'Đã bán', value: seller.total_sales },
            { label: 'Đánh giá', value: seller.rating_avg?.toFixed(1) ?? '—' },
          ].map(stat => (
            <View key={stat.label} className="items-center">
              <Text className="text-xl font-bold text-stone-900">{stat.value}</Text>
              <Text className="text-xs text-stone-400">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        {seller.bio && (
          <View className="mb-6">
            <Text className="font-semibold text-stone-900 mb-2">Câu chuyện</Text>
            <Text className="text-stone-600 text-sm leading-relaxed">{seller.bio}</Text>
          </View>
        )}

        {/* Products */}
        <Text className="font-semibold text-stone-900 mb-4">Sản phẩm</Text>
      </View>

      <View className="px-5 pb-8">
        {(seller.products ?? []).length === 0 ? (
          <Text className="text-stone-400 text-sm text-center py-4">Chưa có sản phẩm</Text>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {(seller.products ?? []).map(product => (
              <TouchableOpacity
                key={product.id}
                onPress={() => router.push(`/product/${product.id}`)}
                className="bg-stone-50 rounded-xl overflow-hidden"
                style={{ width: '47%' }}
                activeOpacity={0.7}
              >
                <View className="aspect-square bg-stone-200">
                  {product.images?.[0] && (
                    <Image source={{ uri: product.images[0].url }} className="w-full h-full" resizeMode="cover" />
                  )}
                </View>
                <View className="p-3">
                  <Text className="text-sm font-medium text-stone-800 mb-1" numberOfLines={2}>{product.name}</Text>
                  <Text className="text-orange-500 font-bold text-sm">{formatPrice(product.price)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
