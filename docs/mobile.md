# Mobile Architecture

## Stack

- **Framework**: Expo SDK 52 + Expo Router
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State**: Zustand + TanStack Query
- **Secure storage**: expo-secure-store (tokens)
- **Push**: Expo Notifications + Firebase FCM

## Folder Structure

```
mobile/
├── app/
│   ├── _layout.tsx           # Root layout (providers, gestures)
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar config
│   │   ├── index.tsx         # Home / Discover
│   │   ├── search.tsx        # Search + filters
│   │   ├── cart.tsx          # Cart
│   │   └── account.tsx       # Account
│   ├── product/
│   │   └── [slug].tsx        # Product detail
│   ├── seller/
│   │   └── [slug].tsx        # Seller profile
│   ├── checkout.tsx          # Checkout (modal)
│   ├── orders/
│   │   ├── index.tsx         # Order list
│   │   └── [id].tsx          # Order detail + tracking
│   └── auth/
│       ├── login.tsx
│       └── register.tsx
├── components/
│   ├── ProductCard.tsx
│   ├── SellerCard.tsx
│   ├── TrackingTimeline.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── lib/
│   ├── api.ts                # Same API client, adapted for RN
│   └── notifications.ts     # Push notification setup
├── store/
│   ├── auth.ts               # SecureStore-persisted tokens
│   └── cart.ts
├── app.json
├── eas.json
└── tailwind.config.js
```

## Push Notifications Setup

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

export async function registerPushToken() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  await api.post('/notifications/push/register', { token: token.data });
  await SecureStore.setItemAsync('push_token', token.data);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

## Build & Distribution

```
Development: expo start (Expo Go / Dev Client)
Preview: eas build --profile preview (internal distribution)
Production: eas build --profile production → App Store + Play Store

EAS Submit:
  eas submit --platform ios    (automatic TestFlight + App Store)
  eas submit --platform android (Play Store internal track)

OTA Updates:
  expo-updates with EAS Update
  Pushes JS bundle updates without App Store review
```

## Offline Support

- TanStack Query: persisted query cache (AsyncStorage)
- Cart items: Zustand + AsyncStorage persistence
- Viewed products: cached for 24h offline browsing
- Checkout: requires network (payment, inventory)

## Performance

- Use `FlashList` (not `FlatList`) for product lists (Shopify/Margelo)
- Image caching with `expo-image`
- Lazy load heavy screens (React.lazy + Suspense)
- Hermes JS engine (enabled by default in Expo SDK 50+)
