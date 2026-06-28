import { View, Text, FlatList, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '../../src/store/cart';

function formatPrice(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

export default function CartScreen() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCartStore();

  const handleRemove = (productId: string, variantId?: string) => {
    Alert.alert('Xóa sản phẩm?', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => removeItem(productId, variantId) },
    ]);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Giỏ Hàng</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyText}>Thêm đặc sản vào giỏ hàng để bắt đầu mua sắm!</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')} activeOpacity={0.8}>
            <Text style={styles.shopButtonText}>Khám phá đặc sản</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Giỏ Hàng</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert('Xóa tất cả?', 'Xóa toàn bộ giỏ hàng?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa hết', style: 'destructive', onPress: clearCart },
          ]);
        }}>
          <Text style={styles.clearBtn}>Xóa hết</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => `${item.productId}:${item.variantId ?? ''}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imgWrap}>
              {item.imageUrl
                ? <Image source={{ uri: item.imageUrl }} style={styles.img} resizeMode="cover" />
                : <Text style={{ fontSize: 32 }}>🍜</Text>
              }
            </View>
            <View style={styles.info}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.sellerName}>{item.sellerName}</Text>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleRemove(item.productId, item.variantId)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng ({totalItems()} sản phẩm)</Text>
          <Text style={styles.totalPrice}>{formatPrice(totalPrice())}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')} activeOpacity={0.8}>
          <Text style={styles.checkoutBtnText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e7e5e4', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#1c1917' },
  clearBtn: { fontSize: 13, color: '#ef4444', fontWeight: '500' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1c1917', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#78716c', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  shopButton: { backgroundColor: '#f97316', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
  shopButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12 },
  imgWrap: { width: 76, height: 76, borderRadius: 12, backgroundColor: '#f5f5f4', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  img: { width: '100%', height: '100%' },
  info: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#1c1917', marginBottom: 2 },
  sellerName: { fontSize: 12, color: '#a8a29e', marginBottom: 6 },
  price: { fontSize: 15, fontWeight: '700', color: '#f97316' },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 16, color: '#d4d0cc' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#e7e5e4', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 16, color: '#57534e', fontWeight: '600' },
  qty: { fontSize: 14, fontWeight: '700', color: '#1c1917', minWidth: 20, textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e7e5e4', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 14, color: '#78716c' },
  totalPrice: { fontSize: 20, fontWeight: '700', color: '#f97316' },
  checkoutBtn: { backgroundColor: '#f97316', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
