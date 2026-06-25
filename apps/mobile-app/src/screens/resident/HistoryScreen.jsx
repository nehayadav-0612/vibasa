import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthContext } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ResidentHistoryScreen() {
  const { token } = useAuthContext();

  const { data: history, isLoading } = useQuery({
    queryKey: ['collection-history'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resident/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.collections;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E7F5C" />
      </View>
    );
  }

  function getStatusColor(status) {
    switch (status) {
      case 'resident_confirmed':
        return '#2ECC71';
      case 'resident_disputed':
        return '#E74C3C';
      case 'collector_marked':
        return '#F39C12';
      case 'undone':
        return '#E0E0E0';
      default:
        return '#1E7F5C';
    }
  }

  function getStatusLabel(status) {
    const labels = {
      resident_confirmed: 'Confirmed',
      resident_disputed: 'Disputed',
      collector_marked: 'Marked',
      undone: 'Undone',
    };
    return labels[status] || status;
  }

  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusLabel}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Last 30 Days</Text>
        <Text style={styles.count}>{history?.length || 0} records</Text>
      </View>

      {!history || history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No collection history</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E7F5C',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  count: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusContainer: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
