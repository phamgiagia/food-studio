import { View, Text } from 'react-native';

type TrackingEvent = {
  status: string;
  description: string;
  created_at: number;
};

interface Props {
  events: TrackingEvent[];
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export function TrackingTimeline({ events }: Props) {
  if (!events || events.length === 0) {
    return (
      <Text className="text-stone-400 text-sm text-center py-4">Chưa có cập nhật vận chuyển</Text>
    );
  }

  return (
    <View>
      {events.map((event, idx) => (
        <View key={idx} className="flex-row gap-3">
          <View className="items-center">
            <View className={`w-3 h-3 rounded-full mt-0.5 ${idx === 0 ? 'bg-orange-500' : 'bg-stone-300'}`} />
            {idx < events.length - 1 && (
              <View className="w-0.5 bg-stone-200 flex-1 mt-1" style={{ minHeight: 24 }} />
            )}
          </View>
          <View className="flex-1 pb-4">
            <Text className={`text-sm font-medium ${idx === 0 ? 'text-stone-900' : 'text-stone-600'}`}>
              {event.description}
            </Text>
            <Text className="text-xs text-stone-400 mt-0.5">{formatDate(event.created_at)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
