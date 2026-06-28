import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const menuItems = [
  { label: 'Đơn hàng của tôi', emoji: '📦', href: '/orders' },
  { label: 'Địa chỉ giao hàng', emoji: '📍', href: '/addresses' },
  { label: 'Danh sách yêu thích', emoji: '❤️', href: '/wishlist' },
  { label: 'Điểm thưởng', emoji: '⭐', href: '/loyalty' },
  { label: 'Cài đặt thông báo', emoji: '🔔', href: '/notifications' },
  { label: 'Hỗ trợ khách hàng', emoji: '💬', href: '/support' },
];

export default function AccountScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.name}>Khách hàng</Text>
          <Text style={styles.email}>Đăng nhập để xem đơn hàng</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginButtonText}>Đăng Nhập</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.href} style={styles.menuItem} onPress={() => router.push(item.href as never)}>
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9' },
  profileSection: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e7e5e4' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: '#1c1917', marginBottom: 4 },
  email: { fontSize: 13, color: '#78716c', marginBottom: 16 },
  loginButton: { backgroundColor: '#f97316', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
  loginButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  menuSection: { marginTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e7e5e4' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f4' },
  menuEmoji: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: '#1c1917' },
  menuArrow: { fontSize: 20, color: '#a8a29e' },
});
