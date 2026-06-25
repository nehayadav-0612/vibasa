import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthContext } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CollectorHomeScreen({ navigation }) {
  const { token, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const { data: wards, isLoading } = useQuery({
    queryKey: ['collector-wards'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/collector/wards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.wards;
    },
  });

  const { data: todayCollections } = useQuery({
    queryKey: ['today-collections'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/collector/today-collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.collections;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E7F5C" />
      </View>
    );
  }

  const renderWard = ({ item: ward }) => (
    <TouchableOpacity
      style={styles.wardCard}
      onPress={() => navigation.navigate('Ward', { wardNo: ward })}
    >
      <View style={styles.wardIconContainer}>
        <Text style={styles.wardIcon}>📍</Text>
      </View>
      <View style={styles.wardInfo}>
        <Text style={styles.wardName}>Ward {ward}</Text>
        <Text style={styles.wardSubtext}>View properties in this ward</Text>
      </View>
      <Text style={styles.wardArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Your Wards</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{wards?.length || 0}</Text>
            <Text style={styles.statLabel}>Wards</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{todayCollections?.length || 0}</Text>
            <Text style={styles.statLabel}>Collections Today</Text>
          </View>
        </View>
      </View>

      {!wards || wards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No wards assigned</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={wards}
            renderItem={renderWard}
            keyExtractor={(item) => item}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>How to Use:</Text>
        <Text style={styles.infoText}>1. Select a ward to view properties</Text>
        <Text style={styles.infoText}>2. Tap a property to mark collection</Text>
        <Text style={styles.infoText}>3. Undo collections on the same day if needed</Text>
        <Text style={styles.infoText}>4. Your data syncs automatically when online</Text>
      </View>
    </ScrollView>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#E0E0E0',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContainer: {
    padding: 16,
  },
  wardCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  wardIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F0F8F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  wardIcon: {
    fontSize: 24,
  },
  wardInfo: {
    flex: 1,
  },
  wardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  wardSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  wardArrow: {
    fontSize: 20,
    color: '#1E7F5C',
  },
  infoBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1E7F5C',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginVertical: 4,
  },
});
