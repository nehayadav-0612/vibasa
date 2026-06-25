import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SyncIndicator({ isOnline }) {
  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.text}>Offline Mode</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  badge: {
    backgroundColor: '#F39C12',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
