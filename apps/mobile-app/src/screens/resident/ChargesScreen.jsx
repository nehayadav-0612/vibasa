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

export default function ResidentChargesScreen() {
  const { token } = useAuthContext();

  const { data: charges, isLoading } = useQuery({
    queryKey: ['monthly-charges'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resident/monthly-charges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.charges;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E7F5C" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const statusColor = item.paid ? '#2ECC71' : '#F39C12';
    const statusText = item.paid ? 'PAID' : 'PENDING';

    return (
      <View style={styles.chargeItem}>
        <View style={styles.monthContainer}>
          <Text style={styles.monthText}>{item.month}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Collections</Text>
            <Text style={styles.statValue}>{item.total_collections}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Missed</Text>
            <Text style={styles.statValue}>{item.missed_collections}</Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <View style={styles.amountInfo}>
            <Text style={styles.amountLabel}>Amount Due</Text>
            <Text style={styles.amountValue}>₹{item.amount_due}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
      </View>
    );
  };

  const totalAmount = charges?.reduce((sum, c) => sum + c.amount_due, 0) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Charges</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total Due:</Text>
          <Text style={styles.summaryAmount}>₹{totalAmount}</Text>
        </View>
      </View>

      {!charges || charges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No charges available</Text>
        </View>
      ) : (
        <FlatList
          data={charges}
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#1E7F5C',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
  chargeItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  monthContainer: {
    marginBottom: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  amountInfo: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
