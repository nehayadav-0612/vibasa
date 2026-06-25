
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthContext } from '../../context/AuthContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CollectorWardScreen({ route }) {
  const { wardNo } = route.params;
  const { token } = useAuthContext();
  const { isOnline } = useNetworkStatus();
  const { saveCollectionLocally } = useOfflineStorage();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['ward-properties', wardNo],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/collector/ward/${wardNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.properties;
    },
  });

  const { data: markedCollections } = useQuery({
    queryKey: ['today-collections'],
    queryFn: async () => {
      if (!isOnline) return [];
      const response = await axios.get(`${API_URL}/collector/today-collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.collections.map((c) => c.prop_uid);
    },
    refetchInterval: isOnline ? 30000 : false,
  });

  async function handleMarkCollection(prop_uid) {
    setLoading(true);

    try {
      if (!isOnline) {
        await saveCollectionLocally(prop_uid, new Date().toISOString().split('T')[0], 'collector_marked');
        queryClient.invalidateQueries({ queryKey: ['ward-properties', wardNo] });
        alert('Marked offline. Will sync when online.');
      } else {
        await axios.post(
          `${API_URL}/collector/mark-collection`,
          { prop_uid },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        queryClient.invalidateQueries({ queryKey: ['today-collections'] });
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleUndoCollection(prop_uid) {
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/collector/undo-collection`,
        { prop_uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      queryClient.invalidateQueries({ queryKey: ['today-collections'] });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  const renderProperty = ({ item }) => {
    const isMarked = markedCollections?.includes(item.prop_uid);

    return (
      <View style={styles.propertyCard}>
        <View style={styles.propertyHeader}>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyId}>{item.prop_uid}</Text>
            <Text style={styles.propertyOwner}>{item.owner_name}</Text>
          </View>
          {isMarked ? (
            <View style={styles.markedBadge}>
              <Text style={styles.markedText}>✓ Marked</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.propertyDetails}>
          <Text style={styles.detailText}>{item.address}</Text>
          <Text style={styles.detailText}>{item.mobile}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {!isMarked ? (
            <TouchableOpacity
              style={[styles.markButton, loading && styles.buttonDisabled]}
              onPress={() => handleMarkCollection(item.prop_uid)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Mark Collection</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.undoButton, loading && styles.buttonDisabled]}
              onPress={() => handleUndoCollection(item.prop_uid)}
              disabled={loading || !isOnline}
            >
              <Text style={styles.buttonText}>Undo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E7F5C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ward {wardNo}</Text>
        <Text style={styles.count}>{properties?.length || 0} properties</Text>
      </View>

      {!properties || properties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No properties in this ward</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
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
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  propertyOwner: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  markedBadge: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  propertyDetails: {
    padding: 12,
    paddingHorizontal: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#999',
    marginVertical: 2,
  },
  buttonContainer: {
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  markButton: {
    flex: 1,
    backgroundColor: '#1E7F5C',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  undoButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
