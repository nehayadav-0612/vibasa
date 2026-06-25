
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthContext } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ResidentHomeScreen({ navigation }) {
  const { user, token, logout } = useAuthContext();
  const [statusMessage, setStatusMessage] = useState('');

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['collection-status'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resident/status/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    refetchInterval: 30000,
  });

  const { data: resident, isLoading: residentLoading } = useQuery({
    queryKey: ['resident-details'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/resident/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.resident;
    },
  });

  async function handleConfirm() {
    try {
      await axios.post(`${API_URL}/resident/confirm-collection`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatusMessage('Collection confirmed successfully');
    } catch (error) {
      setStatusMessage('Failed to confirm: ' + (error.response?.data?.error || error.message));
    }
  }

  async function handleDispute() {
    try {
      await axios.post(
        `${API_URL}/resident/dispute-collection`,
        { reason: 'Collection not completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusMessage('Dispute reported');
    } catch (error) {
      setStatusMessage('Failed to report: ' + (error.response?.data?.error || error.message));
    }
  }

  if (statusLoading || residentLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E7F5C" />
      </View>
    );
  }

  const statusColor = status?.collected
    ? status?.status === 'resident_confirmed'
      ? '#2ECC71'
      : '#F39C12'
    : '#E0E0E0';

  const statusText = !status?.collected
    ? 'No collection today'
    : status?.status === 'resident_confirmed'
      ? 'Confirmed'
      : status?.status === 'resident_disputed'
        ? 'Disputed'
        : 'Marked by collector';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Today's Status</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{status?.date}</Text>
      </View>

      <View style={[styles.statusCard, { borderLeftColor: statusColor }]}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusBadgeText}>{statusText}</Text>
        </View>
      </View>

      {statusMessage ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{statusMessage}</Text>
        </View>
      ) : null}

      {resident ? (
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Property Details</Text>
          <DetailRow label="Property ID" value={resident.prop_uid} />
          <DetailRow label="Owner" value={resident.owner_name} />
          <DetailRow label="Address" value={resident.address} />
          <DetailRow label="Ward" value={resident.ward_name} />
          <DetailRow label="Mobile" value={resident.mobile} />
        </View>
      ) : null}

      {status?.collected ? (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirm Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disputeButton} onPress={handleDispute}>
            <Text style={styles.buttonText}>Dispute Collection</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.quickLinksContainer}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.quickLinkText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('Charges')}
        >
          <Text style={styles.quickLinkText}>Charges</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('ReportIssue')}
        >
          <Text style={styles.quickLinkText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E7F5C',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  subtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 4,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  messageBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2ECC71',
  },
  messageText: {
    color: '#1B5E20',
    fontSize: 14,
  },
  detailsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#2ECC71',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disputeButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  quickLink: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E7F5C',
  },
});
