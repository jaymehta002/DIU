import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  message: {
    color: '#6b6c76',
    fontSize: 14,
    textAlign: 'center',
  },
});
