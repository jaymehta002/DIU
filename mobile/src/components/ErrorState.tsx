import { StyleSheet, Text, View } from 'react-native';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fdecec',
    borderWidth: 1,
    borderColor: '#f3c1bd',
  },
  message: {
    color: '#b3261e',
    fontSize: 14,
    textAlign: 'center',
  },
});
