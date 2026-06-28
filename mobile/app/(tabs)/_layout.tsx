import { Tabs } from 'expo-router';
import { HomeIcon, MagnifyingGlassIcon, ShoppingCartIcon, UserIcon } from 'react-native-heroicons/outline';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#78716c',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e7e5e4',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 84 : 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Khám Phá',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Tìm Kiếm',
          tabBarIcon: ({ color, size }) => <MagnifyingGlassIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ Hàng',
          tabBarIcon: ({ color, size }) => <ShoppingCartIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Tài Khoản',
          tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
