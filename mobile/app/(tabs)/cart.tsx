import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Giỏ Hàng</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Empty state */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyText}>Thêm đặc sản vào giỏ hàng để tiến hành thanh toán</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/')}>
            <Text style={styles.shopButtonText}>Khám Phá Sản Phẩm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e7e5e4', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#1c1917' },
  content: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1c1917', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#78716c', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  shopButton: { backgroundColor: '#f97316', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
  shopButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
