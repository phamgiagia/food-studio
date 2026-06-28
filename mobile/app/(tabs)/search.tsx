import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const popular = ['Mắm tôm Huế', 'Cà phê Đắk Lắk', 'Bánh tráng Tây Ninh', 'Nước mắm Phú Quốc', 'Chả bò Đà Nẵng'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Tìm đặc sản..."
            placeholderTextColor="#a8a29e"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length === 0 && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Tìm Kiếm Phổ Biến</Text>
          <View style={styles.tags}>
            {popular.map(term => (
              <TouchableOpacity key={term} style={styles.tag} onPress={() => setQuery(term)}>
                <Text style={styles.tagText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {query.length > 0 && (
        <View style={styles.resultsEmpty}>
          <Text style={styles.resultsText}>Đang tìm kiếm "{query}"...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf9' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e7e5e4' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f4', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#1c1917' },
  clearIcon: { color: '#78716c', fontSize: 14, paddingLeft: 8 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917', marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  tagText: { fontSize: 13, color: '#44403c' },
  resultsEmpty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  resultsText: { color: '#78716c', fontSize: 14 },
});
