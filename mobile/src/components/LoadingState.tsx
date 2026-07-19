import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#3457d5" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  label: {
    color: '#6b6c76',
    fontSize: 14,
  },
});
