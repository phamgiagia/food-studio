import { ScrollView, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const categories = [
  { id: '1', name: 'Bánh & Kẹo', emoji: '🍡' },
  { id: '2', name: 'Mắm & Gia Vị', emoji: '🫙' },
  { id: '3', name: 'Trà & Cà Phê', emoji: '☕' },
  { id: '4', name: 'Hải Sản Khô', emoji: '🦐' },
  { id: '5', name: 'Trái Cây Sấy', emoji: '🍑' },
  { id: '6', name: 'Đặc Sản', emoji: '🎁' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào! 👋</Text>
            <Text style={styles.headerTitle}>Food Studio</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={() => router.push('/search')}>
            <Text style={styles.searchText}>🔍  Tìm đặc sản...</Text>
          </TouchableOpacity>
        </View>

        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroText}>Đặc Sản Vùng Miền</Text>
          <Text style={styles.heroSub}>Hương vị quê hương, giao tận tay</Text>
          <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/search')}>
            <Text style={styles.heroButtonText}>Khám Phá Ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh Mục</Text>
          <FlatList
            data={categories}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.categoryChip}>
                <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                <Text style={styles.categoryName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Trending placeholder */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đang Được Yêu Thích</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAll}>Xem thêm</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={Array.from({ length: 6 }, (_, i) => ({ id: String(i) }))}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            renderItem={() => (
              <View style={styles.productCard}>
                <View style={styles.productImage} />
                <View style={styles.productInfo}>
                  <View style={[styles.skeleton, { width: '60%', height: 10 }]} />
                  <View style={[styles.skeleton, { width: '90%', height: 12, marginTop: 4 }]} />
                  <View style={[styles.skeleton, { width: '40%', height: 14, marginTop: 6 }]} />
                </View>
              </View>
            )}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  greeting: { fontSize: 13, color: '#78716c', marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1c1917' },
  searchButton: {
    marginTop: 12, backgroundColor: '#f5f5f4', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  searchText: { color: '#a8a29e', fontSize: 14 },
  heroBanner: {
    marginHorizontal: 20, marginVertical: 8, borderRadius: 20,
    backgroundColor: '#ea580c', padding: 24,
  },
  heroText: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: 14, color: '#fed7aa', marginBottom: 16 },
  heroButton: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  heroButtonText: { color: '#ea580c', fontWeight: '700', fontSize: 14 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1c1917', paddingHorizontal: 20, marginBottom: 12 },
  seeAll: { fontSize: 13, color: '#f97316', fontWeight: '600' },
  categoryList: { paddingHorizontal: 20, gap: 10 },
  categoryChip: {
    alignItems: 'center', backgroundColor: '#fff', borderRadius: 16,
    paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e7e5e4',
    minWidth: 80,
  },
  categoryEmoji: { fontSize: 24, marginBottom: 6 },
  categoryName: { fontSize: 11, fontWeight: '600', color: '#44403c', textAlign: 'center' },
  productList: { paddingHorizontal: 20, gap: 12 },
  productCard: { width: 160, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e7e5e4' },
  productImage: { width: '100%', height: 160, backgroundColor: '#e7e5e4' },
  productInfo: { padding: 12 },
  skeleton: { backgroundColor: '#e7e5e4', borderRadius: 6 },
});
