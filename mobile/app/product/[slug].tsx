import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../src/lib/api';
import { useCartStore } from '../../src/store/cart';
import { useState } from 'react';

type Product = {
  id: string; name: string; description: string; price: number; compare_price: number;
  province: string; slug: string; rating_avg: number; rating_count: number;
  seller: { name: string; slug: string; logo_url: string | null };
  images: { url: string }[];
};

function formatPrice(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore(s => s.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug) as Promise<Product>,
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images?.[0]?.url,
      sellerName: product.seller.name,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-stone-500 text-center">Không tìm thấy sản phẩm</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-orange-500 font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product image */}
        <View className="aspect-square bg-stone-100">
          {product.images?.[0] ? (
            <Image source={{ uri: product.images[0].url }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-stone-300 text-6xl">🍜</Text>
            </View>
          )}
        </View>

        <View className="px-5 py-5">
          {/* Province & seller */}
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {product.province}
            </Text>
            <TouchableOpacity onPress={() => router.push(`/seller/${product.seller.slug}`)}>
              <Text className="text-xs text-stone-500">{product.seller.name}</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-xl font-bold text-stone-900 mb-3">{product.name}</Text>

          {/* Rating */}
          <View className="flex-row items-center gap-1.5 mb-4">
            <Text className="text-yellow-500">{'★'.repeat(Math.round(product.rating_avg ?? 0))}</Text>
            <Text className="text-stone-500 text-sm">{(product.rating_avg ?? 0).toFixed(1)} ({product.rating_count ?? 0} đánh giá)</Text>
          </View>

          {/* Price */}
          <View className="flex-row items-baseline gap-2 mb-4">
            <Text className="text-2xl font-bold text-orange-500">{formatPrice(product.price)}</Text>
            {product.compare_price > product.price && (
              <Text className="text-stone-400 line-through text-base">{formatPrice(product.compare_price)}</Text>
            )}
          </View>

          {/* Quantity */}
          <View className="flex-row items-center gap-4 mb-6">
            <Text className="text-sm font-medium text-stone-700">Số lượng:</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-stone-200 items-center justify-center"
              >
                <Text className="text-stone-700 font-bold">-</Text>
              </TouchableOpacity>
              <Text className="text-base font-semibold w-8 text-center">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full border border-stone-200 items-center justify-center"
              >
                <Text className="text-stone-700 font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <Text className="font-semibold text-stone-900 mb-2">Mô tả sản phẩm</Text>
          <Text className="text-stone-600 text-sm leading-relaxed">{product.description}</Text>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View className="px-5 py-4 border-t border-stone-100 bg-white">
        <TouchableOpacity
          onPress={handleAddToCart}
          className={`rounded-xl py-4 items-center ${addedToCart ? 'bg-green-500' : 'bg-orange-500'}`}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">
            {addedToCart ? 'Đã thêm vào giỏ ✓' : 'Thêm vào giỏ hàng'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
