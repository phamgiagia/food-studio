import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_SCREENS: {
  name: string; title: string;
  icon: IoniconName; iconActive: IoniconName;
}[] = [
  { name: 'index',   title: 'Khám Phá',  icon: 'home-outline',    iconActive: 'home' },
  { name: 'search',  title: 'Tìm Kiếm',  icon: 'search-outline',  iconActive: 'search' },
  { name: 'cart',    title: 'Giỏ Hàng',  icon: 'cart-outline',    iconActive: 'cart' },
  { name: 'account', title: 'Tài Khoản', icon: 'person-outline',  iconActive: 'person' },
];

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
      {TAB_SCREENS.map(({ name, title, icon, iconActive }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? iconActive : icon} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
